interface ReceivedFileData {
  id: string
  name: string
  size: number
  type: string
  blob: Blob
  peerId: string
  peerName?: string
  timestamp: number
  version: string
}

interface StoredFileMetadata {
  id: string
  name: string
  size: number
  type: string
  peerId: string
  peerName?: string
  timestamp: number
  version: string
}

interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

class LocalStorageAdapter implements StorageAdapter {
  private cache = new Map<string, { value: string; timestamp: number }>()
  private readonly CACHE_TTL = 5000

  getItem(key: string): string | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value
    }

    try {
      const value = localStorage.getItem(key)
      if (value) {
        this.cache.set(key, { value, timestamp: Date.now() })
      }
      return value
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
      this.cache.set(key, { value, timestamp: Date.now() })
    } catch {}
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
      this.cache.delete(key)
    } catch {}
  }
}

class FileHistoryPersistence {
  private static instance: FileHistoryPersistence
  private adapter: StorageAdapter
  private readonly METADATA_KEY = "fileshare_received_files_v2"
  private readonly VERSION = "2.0.0"
  private readonly MAX_AGE = 24 * 60 * 60 * 1000
  private metadataCache: { data: StoredFileMetadata[]; timestamp: number } | null = null
  private readonly CACHE_TTL = 5000
  private dbName = "FileHistoryDB"
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private lastLoggedExpiry: Set<string> = new Set()

  private constructor() {
    this.adapter = new LocalStorageAdapter()
    this.initIndexedDB()
  }

  static getInstance(): FileHistoryPersistence {
    if (!FileHistoryPersistence.instance) {
      FileHistoryPersistence.instance = new FileHistoryPersistence()
    }
    return FileHistoryPersistence.instance
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        resolve()
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains("files")) {
          const store = db.createObjectStore("files", { keyPath: "id" })
          store.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  private async storeFileBlob(fileData: ReceivedFileData): Promise<void> {
    if (!this.db) {
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["files"], "readwrite")
      const store = transaction.objectStore("files")

      const request = store.put({
        id: fileData.id,
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        peerId: fileData.peerId,
        peerName: fileData.peerName,
        timestamp: fileData.timestamp,
        blob: fileData.blob,
      })

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  private async getFileBlob(fileId: string): Promise<Blob | null> {
    if (!this.db) {
      return null
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(["files"], "readonly")
      const store = transaction.objectStore("files")
      const request = store.get(fileId)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.blob : null)
      }

      request.onerror = () => {
        resolve(null)
      }
    })
  }

  private async deleteFileBlob(fileId: string): Promise<void> {
    if (!this.db) {
      return
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(["files"], "readwrite")
      const store = transaction.objectStore("files")
      const request = store.delete(fileId)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        resolve()
      }
    })
  }

  async addReceivedFile(fileData: Omit<ReceivedFileData, "version" | "timestamp">): Promise<void> {
    const timestamp = Date.now()
    const fullFileData: ReceivedFileData = {
      ...fileData,
      timestamp,
      version: this.VERSION,
    }

    await this.storeFileBlob(fullFileData)

    const metadata: StoredFileMetadata = {
      id: fileData.id,
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      peerId: fileData.peerId,
      peerName: fileData.peerName,
      timestamp,
      version: this.VERSION,
    }

    const existingFiles = this.loadFileMetadata()
    const updatedFiles = [...existingFiles.filter((f) => f.id !== fileData.id), metadata]

    this.saveFileMetadata(updatedFiles)

    console.log(`[nw] File added to history: ${fileData.name} (${this.formatBytes(fileData.size)})`)

    if (!this.lastLoggedExpiry.has(fileData.id)) {
      const expiryDate = new Date(timestamp + this.MAX_AGE)
      console.log(`[nw] File expiry scheduled: ${fileData.name} expires at ${expiryDate.toLocaleString()}`)
      this.lastLoggedExpiry.add(fileData.id)
    }

    window.dispatchEvent(new CustomEvent("indexeddb-change"))
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  private saveFileMetadata(files: StoredFileMetadata[]): void {
    this.metadataCache = { data: files, timestamp: Date.now() }

    const serialized = JSON.stringify(files)
    this.adapter.setItem(this.METADATA_KEY, serialized)
  }

  private loadFileMetadata(): StoredFileMetadata[] {
    if (this.metadataCache && Date.now() - this.metadataCache.timestamp < this.CACHE_TTL) {
      return this.metadataCache.data
    }

    try {
      const serialized = this.adapter.getItem(this.METADATA_KEY)
      if (!serialized) return []

      const files: StoredFileMetadata[] = JSON.parse(serialized)
      const validFiles = files.filter((file) => this.isValidFile(file))

      this.metadataCache = { data: validFiles, timestamp: Date.now() }
      return validFiles
    } catch (error) {
      return []
    }
  }

  private isValidFile(file: StoredFileMetadata): boolean {
    const now = Date.now()
    const isExpired = now - file.timestamp > this.MAX_AGE
    const hasValidData = file.id && file.name && file.timestamp > 0

    return !isExpired && hasValidData
  }

  async getReceivedFiles(): Promise<Array<StoredFileMetadata & { blob?: Blob }>> {
    const metadata = this.loadFileMetadata()

    const filesWithBlobs = await Promise.all(
      metadata.map(async (file) => {
        const blob = await this.getFileBlob(file.id)
        return { ...file, blob: blob || undefined }
      }),
    )

    return filesWithBlobs
  }

  async downloadFile(fileId: string): Promise<void> {
    const metadata = this.loadFileMetadata().find((f) => f.id === fileId)
    if (!metadata) {
      return
    }

    const blob = await this.getFileBlob(fileId)
    if (!blob) {
      return
    }

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = metadata.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Clean up the URL after a delay to allow the browser to process it
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  }

  async cleanupExpiredFiles(): Promise<void> {
    const allFiles = this.loadFileMetadata()
    const now = Date.now()
    const expiredFiles = allFiles.filter((file) => now - file.timestamp > this.MAX_AGE)

    if (expiredFiles.length > 0) {
      console.log(`[nw] Cleaning up ${expiredFiles.length} expired files`)
      expiredFiles.forEach((file) => {
        this.lastLoggedExpiry.delete(file.id)
      })

      await Promise.all(expiredFiles.map((file) => this.deleteFileBlob(file.id)))

      const validFiles = allFiles.filter((file) => now - file.timestamp <= this.MAX_AGE)
      this.saveFileMetadata(validFiles)

      window.dispatchEvent(new CustomEvent("indexeddb-change"))
    }
  }

  async clearAllFiles(): Promise<void> {
    const allFiles = this.loadFileMetadata()

    if (allFiles.length > 0) {
      console.log(`[nw] Clearing all file history: ${allFiles.length} files removed`)
    }

    await Promise.all(allFiles.map((file) => this.deleteFileBlob(file.id)))

    this.adapter.removeItem(this.METADATA_KEY)
    this.metadataCache = null
    this.lastLoggedExpiry.clear()

    try {
      localStorage.removeItem("fileshare_received_files_v2")
    } catch (error) {
      console.warn("[nw] Failed to clear additional metadata:", error)
    }

    window.dispatchEvent(new CustomEvent("indexeddb-change"))
  }

  startPeriodicCleanup(): void {
    this.cleanupExpiredFiles()

    setInterval(
      () => {
        this.cleanupExpiredFiles()
      },
      60 * 60 * 1000,
    )
  }

  async deleteFile(fileId: string): Promise<void> {
    const existingFiles = this.loadFileMetadata()
    const fileToDelete = existingFiles.find((f) => f.id === fileId)

    await this.deleteFileBlob(fileId)

    const updatedFiles = existingFiles.filter((f) => f.id !== fileId)
    this.saveFileMetadata(updatedFiles)

    if (fileToDelete) {
      console.log(`[nw] File manually deleted: ${fileToDelete.name}`)
      this.lastLoggedExpiry.delete(fileId)
    }

    window.dispatchEvent(new CustomEvent("indexeddb-change"))
  }
}

export const fileHistoryPersistence = FileHistoryPersistence.getInstance()
