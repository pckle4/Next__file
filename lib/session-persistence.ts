interface SessionData {
  id: string
  name: string
  createdAt: number
  lastUsed: number
  version: string
  maxFilesPerTransfer?: number
  lastConnectedPeerId?: string
  chatMessages?: any[]
  analytics?: any
  peerInfo?: Map<string, any>
  connectionHistory?: string[]
}

interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

class LocalStorageAdapter implements StorageAdapter {
  private cache = new Map<string, { value: string; timestamp: number }>()
  private readonly CACHE_TTL = 5000 // 5 seconds cache

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
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
      this.cache.delete(key)
    } catch {
      // Silently fail if localStorage is not available
    }
  }
}

class SessionStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      // Silently fail if sessionStorage is not available
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Silently fail if sessionStorage is not available
    }
  }
}

class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>()

  getItem(key: string): string | null {
    return this.storage.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }
}

export class SessionPersistence {
  private static instance: SessionPersistence
  private adapters: StorageAdapter[]
  private readonly SESSION_KEY = "fileshare_session_v2"
  private readonly VERSION = "2.0.0"
  private readonly MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days
  private sessionCache: { data: SessionData; timestamp: number } | null = null
  private readonly CACHE_TTL = 10000 // 10 seconds

  private constructor() {
    this.adapters = [new LocalStorageAdapter(), new SessionStorageAdapter(), new MemoryStorageAdapter()]
  }

  static getInstance(): SessionPersistence {
    if (!SessionPersistence.instance) {
      SessionPersistence.instance = new SessionPersistence()
    }
    return SessionPersistence.instance
  }

  private generateId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    // Prefer secure randomness when available
    try {
      if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        const arr = new Uint32Array(6)
        crypto.getRandomValues(arr)
        let id = ""
        for (let i = 0; i < 6; i++) {
          id += chars[arr[i] % chars.length]
        }
        return id
      }
    } catch {
      // fall back below
    }
    // Fallback: Math.random (kept for compatibility)
    let id = ""
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return id
  }

  private isValidSession(session: SessionData): boolean {
    const now = Date.now()
    const isExpired = now - session.lastUsed > this.MAX_AGE
    const hasValidId = session.id && session.id.length === 6
    const hasValidName = session.name && session.name.trim().length > 0

    return !isExpired && hasValidId && hasValidName
  }

  saveSession(
    id: string,
    name: string,
    maxFilesPerTransfer?: number,
    sessionData?: {
      lastConnectedPeerId?: string
      chatMessages?: any[]
      analytics?: any
      peerInfo?: Map<string, any>
      connectionHistory?: string[]
    },
  ): void {
    let peerInfoObject = {}
    try {
      if (sessionData?.peerInfo) {
        if (sessionData.peerInfo instanceof Map) {
          peerInfoObject = Object.fromEntries(sessionData.peerInfo)
        } else if (typeof sessionData.peerInfo === "object") {
          peerInfoObject = sessionData.peerInfo
        }
      }
    } catch (error) {
      peerInfoObject = {}
    }

    const fullSessionData: SessionData = {
      id: id.toUpperCase(),
      name: name.trim(),
      createdAt: Date.now(),
      lastUsed: Date.now(),
      version: this.VERSION,
      maxFilesPerTransfer: maxFilesPerTransfer || 10,
      lastConnectedPeerId: sessionData?.lastConnectedPeerId,
      chatMessages: sessionData?.chatMessages || [],
      analytics: sessionData?.analytics,
      peerInfo: peerInfoObject,
      connectionHistory: sessionData?.connectionHistory || [],
    }

    this.sessionCache = { data: fullSessionData, timestamp: Date.now() }

    const serialized = JSON.stringify(fullSessionData)

    const saveToStorage = () => {
      for (const adapter of this.adapters) {
        try {
          adapter.setItem(this.SESSION_KEY, serialized)
        } catch (error) {
          // Silent error handling
        }
      }
    }

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(saveToStorage)
    } else {
      setTimeout(saveToStorage, 0)
    }
  }

  loadSession(): {
    id: string
    name: string
    maxFilesPerTransfer?: number
    lastConnectedPeerId?: string
    chatMessages?: any[]
    analytics?: any
    peerInfo?: any
    connectionHistory?: string[]
  } | null {
    if (this.sessionCache && Date.now() - this.sessionCache.timestamp < this.CACHE_TTL) {
      if (this.isValidSession(this.sessionCache.data)) {
        const data = this.sessionCache.data
        return {
          id: data.id,
          name: data.name,
          maxFilesPerTransfer: data.maxFilesPerTransfer || 10,
          lastConnectedPeerId: data.lastConnectedPeerId,
          chatMessages: data.chatMessages || [],
          analytics: data.analytics,
          peerInfo: data.peerInfo || {},
          connectionHistory: data.connectionHistory || [],
        }
      }
    }

    for (const adapter of this.adapters) {
      try {
        const serialized = adapter.getItem(this.SESSION_KEY)
        if (!serialized) continue

        const sessionData: SessionData = JSON.parse(serialized)

        if (this.isValidSession(sessionData)) {
          sessionData.lastUsed = Date.now()

          this.sessionCache = { data: sessionData, timestamp: Date.now() }

          const updateStorage = () => {
            adapter.setItem(this.SESSION_KEY, JSON.stringify(sessionData))
          }

          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(updateStorage)
          } else {
            setTimeout(updateStorage, 0)
          }

          return {
            id: sessionData.id,
            name: sessionData.name,
            maxFilesPerTransfer: sessionData.maxFilesPerTransfer || 10,
            lastConnectedPeerId: sessionData.lastConnectedPeerId,
            chatMessages: sessionData.chatMessages || [],
            analytics: sessionData.analytics,
            peerInfo: sessionData.peerInfo || {},
            connectionHistory: sessionData.connectionHistory || [],
          }
        } else {
          adapter.removeItem(this.SESSION_KEY)
        }
      } catch (error) {
        // Silent error handling
      }
    }

    return null
  }

  updateSessionWithConnectionData(connectionData: {
    lastConnectedPeerId?: string
    chatMessages?: any[]
    analytics?: any
    peerInfo?: Map<string, any>
    connectionHistory?: string[]
  }): void {
    const existingSession = this.loadSession()
    if (existingSession) {
      this.saveSession(existingSession.id, existingSession.name, existingSession.maxFilesPerTransfer, {
        lastConnectedPeerId: connectionData.lastConnectedPeerId || existingSession.lastConnectedPeerId,
        chatMessages: connectionData.chatMessages || existingSession.chatMessages,
        analytics: connectionData.analytics || existingSession.analytics,
        peerInfo: connectionData.peerInfo || new Map(Object.entries(existingSession.peerInfo || {})),
        connectionHistory: connectionData.connectionHistory || existingSession.connectionHistory,
      })
    }
  }

  clearConnectionMemory(): void {
    const existingSession = this.loadSession()
    if (existingSession) {
      this.saveSession(existingSession.id, existingSession.name, existingSession.maxFilesPerTransfer, {
        lastConnectedPeerId: undefined,
        chatMessages: existingSession.chatMessages,
        analytics: existingSession.analytics,
        peerInfo: existingSession.peerInfo,
        connectionHistory: [],
      })
    }
  }

  clearSession(): void {
    this.sessionCache = null

    for (const adapter of this.adapters) {
      try {
        adapter.removeItem(this.SESSION_KEY)
      } catch (error) {
        // Silent error handling
      }
    }
  }

  createNewSession(
    name: string,
    maxFilesPerTransfer?: number,
  ): { id: string; name: string; maxFilesPerTransfer: number } {
    const id = this.generateId()
    const trimmedName = name.trim()
    const maxFiles = maxFilesPerTransfer || 10

    this.saveSession(id, trimmedName, maxFiles)

    return { id, name: trimmedName, maxFilesPerTransfer: maxFiles }
  }

  updateSession(id: string, name: string, maxFilesPerTransfer?: number): void {
    this.saveSession(id, name, maxFilesPerTransfer)
  }

  getOrCreateSession(
    name?: string,
    maxFilesPerTransfer?: number,
  ): { id: string; name: string; maxFilesPerTransfer: number; isNew: boolean } {
    const existingSession = this.loadSession()

    if (existingSession) {
      return { ...existingSession, maxFilesPerTransfer: existingSession.maxFilesPerTransfer || 10, isNew: false }
    }

    if (name && name.trim()) {
      const newSession = this.createNewSession(name, maxFilesPerTransfer)
      return { ...newSession, isNew: true }
    }

    // Return null-like values if no name provided and no existing session
    return { id: "", name: "", maxFilesPerTransfer: 10, isNew: true }
  }
}

export const sessionPersistence = SessionPersistence.getInstance()
