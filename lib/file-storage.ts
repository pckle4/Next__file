interface StoredFile {
  id: string
  name: string
  size: number
  type: string
  blob: Blob
  timestamp: number
  peerId: string
}

class FileStorageManager {
  private dbName = "NowhileFileStorage"
  private dbVersion = 1
  private storeName = "tempFiles"
  private db: IDBDatabase | null = null
  private isInitialized = false
  private cleanupInterval: NodeJS.Timeout | null = null

  async init(): Promise<void> {
    if (this.isInitialized && this.db) {
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error("[nw] FileStorage: Failed to initialize database:", request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        console.log("[nw] FileStorage: Database initialized successfully")

        this.setupCleanupInterval()
        this.checkExistingFiles()
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" })
          store.createIndex("peerId", "peerId", { unique: false })
          store.createIndex("timestamp", "timestamp", { unique: false })
          console.log("[nw] FileStorage: Database schema created")
        }
      }
    })
  }

  private setupCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Run cleanup exactly every 24 hours
    this.cleanupInterval = setInterval(
      () => {
        this.clearOldFiles(24 * 60 * 60 * 1000) // Exactly 24 hours
      },
      24 * 60 * 60 * 1000,
    ) // Every 24 hours
  }

  private async checkExistingFiles(): Promise<void> {
    try {
      const transaction = this.db!.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const files = request.result as StoredFile[]
        const now = Date.now()
        const validFiles = files.filter((file) => {
          const age = now - file.timestamp
          return age <= 24 * 60 * 60 * 1000 // Exactly 24 hours
        })

        if (files.length > 0) {
          console.log(`[nw] FileStorage: Found ${files.length} existing files, ${validFiles.length} valid`)
        }

        // Clean up expired files if any exist
        if (validFiles.length !== files.length) {
          const expiredCount = files.length - validFiles.length
          console.log(`[nw] FileStorage: Cleaning up ${expiredCount} expired files`)
          this.clearOldFiles(24 * 60 * 60 * 1000)
        }
      }

      request.onerror = () => {
        console.error("[nw] FileStorage: Failed to check existing files:", request.error)
      }
    } catch (error) {
      console.error("[nw] FileStorage: Error checking existing files:", error)
    }
  }

  async storeFile(file: StoredFile): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.put(file)

      request.onerror = () => {
        console.error(`[nw] FileStorage: Failed to store file ${file.name}:`, request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        console.log(`[nw] File added: ${file.name} (${this.formatBytes(file.size)})`)
        window.dispatchEvent(new CustomEvent("indexeddb-change"))
        resolve()
      }
    })
  }

  async getFile(fileId: string): Promise<StoredFile | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.get(fileId)

      request.onerror = () => {
        console.error(`[nw] FileStorage: Failed to retrieve file ${fileId}:`, request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        const result = request.result || null
        resolve(result)
      }
    })
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(fileId)

      request.onerror = () => {
        console.error(`[nw] FileStorage: Failed to delete file ${fileId}:`, request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        console.log(`[nw] File deleted: ${fileId}`)
        window.dispatchEvent(new CustomEvent("indexeddb-change"))
        resolve()
      }
    })
  }

  async deleteFilesByPeer(peerId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const index = store.index("peerId")
      const request = index.openCursor(IDBKeyRange.only(peerId))
      let deletedCount = 0

      request.onerror = () => {
        console.error(`[nw] FileStorage: Failed to delete files for peer ${peerId}:`, request.error)
        reject(request.error)
      }
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          deletedCount++
          cursor.delete()
          cursor.continue()
        } else {
          if (deletedCount > 0) {
            console.log(`[nw] Files deleted for peer: ${peerId} (${deletedCount} files)`)
            window.dispatchEvent(new CustomEvent("indexeddb-change"))
          }
          resolve()
        }
      }
    })
  }

  async clearOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init()

    const cutoffTime = Date.now() - maxAge

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const index = store.index("timestamp")
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime))
      let deletedCount = 0

      request.onerror = () => {
        console.error("[nw] FileStorage: Failed to clear old files:", request.error)
        reject(request.error)
      }
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          deletedCount++
          cursor.delete()
          cursor.continue()
        } else {
          if (deletedCount > 0) {
            console.log(`[nw] Old files cleared: ${deletedCount} files`)
            window.dispatchEvent(new CustomEvent("indexeddb-change"))
          }
          resolve()
        }
      }
    })
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => {
        console.error("[nw] FileStorage: Failed to clear all files:", request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        console.log("[nw] All files cleared")
        window.dispatchEvent(new CustomEvent("indexeddb-change"))
        resolve()
      }
    })
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

export const fileStorage = new FileStorageManager()
