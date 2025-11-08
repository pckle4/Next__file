interface ReceivedFile {
  id: string
  name: string
  size: number
  type: string
  blob: Blob
  timestamp: number
  peerId: string
}

interface StoredFileMetadata {
  id: string
  name: string
  size: number
  type: string
  timestamp: number
  peerId: string
}

class ReceivedFilesStorage {
  private static instance: ReceivedFilesStorage
  private dbName = "received_files_db"
  private dbVersion = 1
  private storeName = "files"
  private metadataKey = "received_files_metadata"
  private db: IDBDatabase | null = null
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours

  private constructor() {
    this.initDB()
    this.startCleanupTimer()
  }

  static getInstance(): ReceivedFilesStorage {
    if (!ReceivedFilesStorage.instance) {
      ReceivedFilesStorage.instance = new ReceivedFilesStorage()
    }
    return ReceivedFilesStorage.instance
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error("[nw] ReceivedFilesStorage: Failed to initialize database:", request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        this.db = request.result
        console.log("[nw] ReceivedFilesStorage: Database initialized successfully")
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" })
          console.log("[nw] ReceivedFilesStorage: Database schema created")
        }
      }
    })
  }

  async addReceivedFile(fileData: {
    id: string
    name: string
    size: number
    type: string
    blob: Blob
    peerId: string
  }): Promise<void> {
    const receivedFile: ReceivedFile = {
      ...fileData,
      timestamp: Date.now(),
    }

    console.log(`[nw] ReceivedFilesStorage: Adding file: ${fileData.name} (${this.formatBytes(fileData.size)})`)
    await this.storeFile(receivedFile)
  }

  async storeFile(file: ReceivedFile): Promise<void> {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)

      const request = store.put(file)
      request.onsuccess = () => {
        console.log(`[nw] ReceivedFilesStorage: File stored successfully: ${file.name}`)
        this.updateMetadata()
        resolve()
      }
      request.onerror = () => {
        console.error(`[nw] ReceivedFilesStorage: Failed to store file ${file.name}:`, request.error)
        reject(request.error)
      }
    })
  }

  async getFile(id: string): Promise<ReceivedFile | null> {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)

      const request = store.get(id)
      request.onsuccess = () => {
        const result = request.result || null
        if (result) {
          console.log(`[nw] ReceivedFilesStorage: File retrieved: ${result.name}`)
        }
        resolve(result)
      }
      request.onerror = () => {
        console.error(`[nw] ReceivedFilesStorage: Failed to retrieve file ${id}:`, request.error)
        reject(request.error)
      }
    })
  }

  async getAllFiles(): Promise<ReceivedFile[]> {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)

      const request = store.getAll()
      request.onsuccess = () => {
        const files = request.result || []
        if (files.length > 0) {
          console.log(`[nw] ReceivedFilesStorage: Retrieved ${files.length} files`)
        }
        resolve(files)
      }
      request.onerror = () => {
        console.error("[nw] ReceivedFilesStorage: Failed to retrieve all files:", request.error)
        reject(request.error)
      }
    })
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)

      const request = store.delete(id)
      request.onsuccess = () => {
        console.log(`[nw] ReceivedFilesStorage: File deleted: ${id}`)
        this.updateMetadata()
        resolve()
      }
      request.onerror = () => {
        console.error(`[nw] ReceivedFilesStorage: Failed to delete file ${id}:`, request.error)
        reject(request.error)
      }
    })
  }

  async clearAllFiles(): Promise<void> {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)

      const request = store.clear()
      request.onsuccess = () => {
        console.log("[nw] ReceivedFilesStorage: All files cleared")
        try {
          localStorage.removeItem(this.metadataKey)
        } catch (error) {
          console.warn("[nw] ReceivedFilesStorage: Failed to clear metadata from localStorage:", error)
        }
        resolve()
      }
      request.onerror = () => {
        console.error("[nw] ReceivedFilesStorage: Failed to clear all files:", request.error)
        reject(request.error)
      }
    })
  }

  private updateMetadata(): void {
    this.getAllFiles().then((files) => {
      const metadata: StoredFileMetadata[] = files.map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        timestamp: file.timestamp,
        peerId: file.peerId,
      }))

      try {
        localStorage.setItem(this.metadataKey, JSON.stringify(metadata))
      } catch (error) {
        console.warn("[nw] ReceivedFilesStorage: Failed to update file metadata in localStorage:", error)
      }
    })
  }

  getMetadata(): StoredFileMetadata[] {
    try {
      const stored = localStorage.getItem(this.metadataKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn("[nw] ReceivedFilesStorage: Failed to load file metadata from localStorage:", error)
      return []
    }
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      console.log("[nw] ReceivedFilesStorage: Running periodic file cleanup")
      this.cleanupOldFiles()
    }, this.CLEANUP_INTERVAL)

    // Also run cleanup on startup
    setTimeout(() => {
      console.log("[nw] ReceivedFilesStorage: Running startup file cleanup")
      this.cleanupOldFiles()
    }, 5000)
  }

  private async cleanupOldFiles(): Promise<void> {
    try {
      const files = await this.getAllFiles()
      const now = Date.now()
      let cleanedCount = 0

      if (files.length > 0) {
        console.log(`[nw] ReceivedFilesStorage: Checking ${files.length} files for cleanup`)
      }

      for (const file of files) {
        const fileAge = now - file.timestamp
        const hoursOld = Math.floor(fileAge / (60 * 60 * 1000))

        if (fileAge > this.CLEANUP_INTERVAL) {
          console.log(`[nw] ReceivedFilesStorage: Cleaning up old file: ${file.name} (${hoursOld} hours old)`)
          await this.deleteFile(file.id)
          cleanedCount++
        }
      }

      if (cleanedCount > 0) {
        console.log(`[nw] ReceivedFilesStorage: Cleanup completed: ${cleanedCount} files removed`)
      }
    } catch (error) {
      console.warn("[nw] ReceivedFilesStorage: Failed to cleanup old files:", error)
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }
}

export const receivedFilesStorage = ReceivedFilesStorage.getInstance()
