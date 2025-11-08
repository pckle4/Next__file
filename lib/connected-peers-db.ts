const DB_NAME = "nowhile_connected_peers"
const DB_VERSION = 2
const STORE_NAME = "peers"
const REFRESH_FLAG_STORE = "refresh_flag"

interface ConnectedPeer {
  peerId: string
  displayName?: string
  connectedAt: number
}

interface RefreshFlag {
  id: string
  hasRefreshed: boolean
  timestamp: number
  clientId?: string // optional for backward compatibility
}

class ConnectedPeersDB {
  private dbPromise: Promise<IDBDatabase> | null = null

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "peerId" })
        }

        if (!db.objectStoreNames.contains(REFRESH_FLAG_STORE)) {
          db.createObjectStore(REFRESH_FLAG_STORE, { keyPath: "id" })
        }
      }
    })

    return this.dbPromise
  }

  async addPeer(peerId: string, displayName?: string): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    const peer: ConnectedPeer = {
      peerId,
      displayName,
      connectedAt: Date.now(),
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.put(peer)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async removePeer(peerId: string): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(peerId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAllPeers(): Promise<ConnectedPeer[]> {
    const db = await this.getDB()
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async clearAll(): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async setRefreshFlag(flag: { clientId: string; hasRefreshed: boolean; timestamp: number }): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(REFRESH_FLAG_STORE, "readwrite")
    const store = tx.objectStore(REFRESH_FLAG_STORE)

    const value: RefreshFlag = {
      id: "current",
      hasRefreshed: flag.hasRefreshed,
      timestamp: flag.timestamp,
      clientId: flag.clientId,
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.put(value)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getRefreshFlag(): Promise<RefreshFlag | null> {
    const db = await this.getDB()
    const tx = db.transaction(REFRESH_FLAG_STORE, "readonly")
    const store = tx.objectStore(REFRESH_FLAG_STORE)

    return new Promise((resolve, reject) => {
      const request = store.get("current")
      request.onsuccess = () => {
        const result = request.result as RefreshFlag | undefined
        resolve(result || null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearRefreshFlag(): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(REFRESH_FLAG_STORE, "readwrite")
    const store = tx.objectStore(REFRESH_FLAG_STORE)

    await new Promise<void>((resolve, reject) => {
      const request = store.delete("current")
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const connectedPeersDB = new ConnectedPeersDB()
