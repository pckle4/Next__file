interface ProfileData {
  id: string
  name: string
  createdAt: number
  lastUsed: number
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
      if (value) this.cache.set(key, { value, timestamp: Date.now() })
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
      // ignore
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
      this.cache.delete(key)
    } catch {
      // ignore
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
      // ignore
    }
  }
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // ignore
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

class ProfilePersistence {
  private static instance: ProfilePersistence
  private adapters: StorageAdapter[]
  private readonly KEY = "fileshare_profile_v1"
  private readonly VERSION = "1.0.0"
  private readonly MAX_AGE = 365 * 24 * 60 * 60 * 1000
  private cache: { data: ProfileData; timestamp: number } | null = null
  private readonly CACHE_TTL = 10000

  private constructor() {
    this.adapters = [new LocalStorageAdapter(), new SessionStorageAdapter(), new MemoryStorageAdapter()]
  }

  static getInstance(): ProfilePersistence {
    if (!ProfilePersistence.instance) {
      ProfilePersistence.instance = new ProfilePersistence()
    }
    return ProfilePersistence.instance
  }

  private isValidProfile(p: ProfileData | null): p is ProfileData {
    if (!p) return false
    const hasId = p.id && p.id.length === 6
    const hasName = p.name && p.name.trim().length > 0
    const notExpired = Date.now() - p.lastUsed <= this.MAX_AGE
    return hasId && hasName && notExpired
  }

  saveProfile(id: string, name: string): void {
    const data: ProfileData = {
      id: id.toUpperCase(),
      name: name.trim(),
      createdAt: Date.now(),
      lastUsed: Date.now(),
      version: this.VERSION,
    }
    this.cache = { data, timestamp: Date.now() }
    const serialized = JSON.stringify(data)

    const write = () => {
      for (const a of this.adapters) {
        try {
          a.setItem(this.KEY, serialized)
        } catch {
          // ignore
        }
      }
    }
    if (typeof requestIdleCallback !== "undefined") requestIdleCallback(write)
    else setTimeout(write, 0)
  }

  loadProfile(): { id: string; name: string } | null {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL && this.isValidProfile(this.cache.data)) {
      return { id: this.cache.data.id, name: this.cache.data.name }
    }

    for (const a of this.adapters) {
      try {
        const raw = a.getItem(this.KEY)
        if (!raw) continue
        const parsed: ProfileData = JSON.parse(raw)
        if (this.isValidProfile(parsed)) {
          parsed.lastUsed = Date.now()
          this.cache = { data: parsed, timestamp: Date.now() }
          const update = () => a.setItem(this.KEY, JSON.stringify(parsed))
          if (typeof requestIdleCallback !== "undefined") requestIdleCallback(update)
          else setTimeout(update, 0)
          return { id: parsed.id, name: parsed.name }
        } else {
          a.removeItem(this.KEY)
        }
      } catch {
        // ignore read failure
      }
    }
    return null
  }

  clearProfile(): void {
    this.cache = null
    for (const a of this.adapters) {
      try {
        a.removeItem(this.KEY)
      } catch {
        // ignore
      }
    }
  }
}

export const profilePersistence = ProfilePersistence.getInstance()
