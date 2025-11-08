"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  HardDrive,
  Cookie,
  FileText,
  Globe,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Package,
  Server,
  Activity,
  Archive,
  Gauge,
  ChevronDown,
  Lightbulb,
  HeartPulse,
  Crown,
  AlertTriangle,
  CircleCheckBig,
  Zap,
} from "lucide-react"
import { toast as showToast } from "@/hooks/use-toast"
import { renderJsonValue } from "@/components/render-json-value"

interface StorageData {
  localStorage: { [key: string]: any }
  sessionStorage: { [key: string]: any }
  cookies: { [key: string]: string }
  indexedDB: {
    databases: Array<{
      name: string
      version: number
      objectStores: Array<{
        name: string
        keyPath: string | string[]
        autoIncrement: boolean
        indexes: Array<{
          name: string
          keyPath: string | string[]
          unique: boolean
        }>
        itemCount: number
        totalSize: number
        sampleData?: any[]
      }>
    }>
  }
}

interface BrowserStorageEstimate {
  usage: number
  quota: number
  supported: boolean
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const getStorageSize = (obj: { [key: string]: any }): number => {
  return Object.entries(obj).reduce((total, [key, value]) => {
    const jsonString = typeof value === "string" ? value : JSON.stringify(value)
    return total + new Blob([key + jsonString]).size
  }, 0)
}

const calculateActualFileSize = (item: any): number => {
  if (item && item.blob && item.blob instanceof Blob) {
    return item.blob.size
  }
  if (item && typeof item.size === "number") {
    return item.size
  }
  return new Blob([JSON.stringify(item)]).size
}

const parseStorageValue = (value: string) => {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const toast = {
  error: (message: string, _opts?: any) => showToast({ title: message, variant: "destructive" }),
}

export default function ExpandableStorageAnalyzer() {
  const [storageData, setStorageData] = useState<StorageData>({
    localStorage: {},
    sessionStorage: {},
    cookies: {},
    indexedDB: { databases: [] },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [browserStorage, setBrowserStorage] = useState<BrowserStorageEstimate>({
    usage: 0,
    quota: 0,
    supported: false,
  })
  const [previousStorageValues, setPreviousStorageValues] = useState<{
    usage: number
    quota: number
    totalSize: number
  }>({ usage: 0, quota: 0, totalSize: 0 })
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  const storageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const isUpdatingRef = useRef<boolean>(false)

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedItems(newExpanded)
  }

  const getBrowserStorageEstimate = async (): Promise<BrowserStorageEstimate> => {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          supported: true,
        }
      }
    } catch (error) {
      console.log("[nw] Storage API not supported or failed:", error)
    }

    return {
      usage: 0,
      quota: 0,
      supported: false,
    }
  }

  const getStorageHealthScore = (): { score: number; status: string; color: string } => {
    if (!browserStorage.supported || browserStorage.quota === 0) {
      return { score: 100, status: "Unknown", color: "text-muted-foreground" }
    }

    const usagePercent = (browserStorage.usage / browserStorage.quota) * 100

    if (usagePercent < 50) {
      return { score: 100, status: "Excellent", color: "text-green-500" }
    } else if (usagePercent < 75) {
      return { score: 75, status: "Good", color: "text-blue-500" }
    } else if (usagePercent < 90) {
      return { score: 50, status: "Fair", color: "text-yellow-500" }
    } else {
      return { score: 25, status: "Critical", color: "text-red-500" }
    }
  }

  const storageSizes = useMemo(
    () => ({
      localStorage: getStorageSize(storageData.localStorage),
      sessionStorage: getStorageSize(storageData.sessionStorage),
      cookies: getStorageSize(storageData.cookies),
      indexedDB: storageData.indexedDB.databases.reduce(
        (total, db) => total + db.objectStores.reduce((dbTotal, store) => dbTotal + store.totalSize, 0),
        0,
      ),
    }),
    [storageData],
  )

  const totalSize = useMemo(() => {
    return storageSizes.localStorage + storageSizes.sessionStorage + storageSizes.cookies + storageSizes.indexedDB
  }, [storageSizes])

  const healthScore = useMemo(() => getStorageHealthScore(), [browserStorage])

  const largestConsumers = useMemo(() => {
    const consumers = [
      {
        name: "IndexedDB",
        size: storageSizes.indexedDB,
        icon: Database,
        color: "text-purple-500",
      },
      { name: "localStorage", size: storageSizes.localStorage, icon: HardDrive, color: "text-blue-500" },
      {
        name: "sessionStorage",
        size: storageSizes.sessionStorage,
        icon: Clock,
        color: "text-green-500",
      },
      { name: "Cookies", size: storageSizes.cookies, icon: Cookie, color: "text-orange-500" },
    ]

    return consumers.sort((a, b) => b.size - a.size)
  }, [storageSizes])

  const analyzeStorage = async () => {
    if (isUpdatingRef.current) {
      console.log("[nw] Storage analysis already in progress, skipping")
      return
    }

    isUpdatingRef.current = true
    setIsLoading(true)

    try {
      console.log("[nw] Starting storage analysis")
      const startTime = Date.now()

      const browserStorageEstimate = await Promise.race([
        getBrowserStorageEstimate(),
        new Promise<BrowserStorageEstimate>((resolve) =>
          setTimeout(() => resolve({ usage: 0, quota: 0, supported: false }), 2000),
        ),
      ])
      setBrowserStorage(browserStorageEstimate)

      const localStorageData: { [key: string]: any } = {}
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            const value = localStorage.getItem(key) || ""
            localStorageData[key] = parseStorageValue(value)
          }
        }
      } catch (error) {
        console.warn("[nw] Error reading localStorage:", error)
      }

      const sessionStorageData: { [key: string]: any } = {}
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key) {
            const value = sessionStorage.getItem(key) || ""
            sessionStorageData[key] = parseStorageValue(value)
          }
        }
      } catch (error) {
        console.warn("[nw] Error reading sessionStorage:", error)
      }

      const cookiesData: { [key: string]: string } = {}
      try {
        document.cookie.split(";").forEach((cookie) => {
          const [name, value] = cookie.trim().split("=")
          if (name && value) {
            cookiesData[name] = decodeURIComponent(value)
          }
        })
      } catch (error) {
        console.warn("[nw] Error reading cookies:", error)
      }

      let indexedDBData = { databases: [] }
      try {
        const databasesPromise = indexedDB.databases()
        const databases = await Promise.race([
          databasesPromise,
          new Promise<IDBDatabaseInfo[]>((resolve) => setTimeout(() => resolve([]), 3000)),
        ])

        indexedDBData = {
          databases: await Promise.all(
            databases.map(async (dbInfo) => {
              if (!dbInfo.name) return null

              try {
                const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
                  const request = indexedDB.open(dbInfo.name!, dbInfo.version)
                  request.onsuccess = () => resolve(request.result)
                  request.onerror = () => reject(request.error)
                  request.onblocked = () => reject(new Error("Database blocked"))
                })

                const db = await Promise.race([
                  dbPromise,
                  new Promise<IDBDatabase>((_, reject) =>
                    setTimeout(() => reject(new Error("Database open timeout")), 3000),
                  ),
                ])

                const objectStores = await Promise.all(
                  Array.from(db.objectStoreNames).map(async (storeName) => {
                    try {
                      const transaction = db.transaction([storeName], "readonly")
                      const store = transaction.objectStore(storeName)

                      const countPromise = new Promise<number>((resolve) => {
                        const countRequest = store.count()
                        countRequest.onsuccess = () => resolve(countRequest.result)
                        countRequest.onerror = () => resolve(0)
                      })

                      const count = await Promise.race([
                        countPromise,
                        new Promise<number>((resolve) => setTimeout(() => resolve(0), 2000)),
                      ])

                      const { sampleData, totalSize } = await new Promise<{ sampleData: any[]; totalSize: number }>(
                        (resolve) => {
                          const items: any[] = []
                          let calculatedTotalSize = 0
                          const request = store.openCursor()
                          let itemCount = 0
                          let timeoutId: NodeJS.Timeout

                          const cleanup = () => {
                            if (timeoutId) clearTimeout(timeoutId)
                          }

                          timeoutId = setTimeout(() => {
                            cleanup()
                            resolve({ sampleData: items, totalSize: calculatedTotalSize })
                          }, 3000)

                          request.onsuccess = (event) => {
                            const cursor = (event.target as IDBRequest).result
                            if (cursor) {
                              const item = cursor.value
                              const itemSize = calculateActualFileSize(item)
                              calculatedTotalSize += itemSize

                              if (itemCount < 3) {
                                items.push({
                                  key: cursor.key,
                                  value: item,
                                  actualSize: itemSize,
                                })
                              }
                              itemCount++
                              cursor.continue()
                            } else {
                              cleanup()
                              resolve({ sampleData: items, totalSize: calculatedTotalSize })
                            }
                          }
                          request.onerror = () => {
                            cleanup()
                            resolve({ sampleData: [], totalSize: 0 })
                          }
                        },
                      )

                      return {
                        name: storeName,
                        keyPath: store.keyPath,
                        autoIncrement: store.autoIncrement,
                        indexes: Array.from(store.indexNames).map((indexName) => {
                          const index = store.index(indexName)
                          return {
                            name: indexName,
                            keyPath: index.keyPath,
                            unique: index.unique,
                          }
                        }),
                        itemCount: count,
                        totalSize,
                        sampleData,
                      }
                    } catch (error) {
                      console.warn(`[nw] Error analyzing store ${storeName}:`, error)
                      return {
                        name: storeName,
                        keyPath: null,
                        autoIncrement: false,
                        indexes: [],
                        itemCount: 0,
                        totalSize: 0,
                        sampleData: [],
                      }
                    }
                  }),
                )

                db.close()

                return {
                  name: dbInfo.name,
                  version: dbInfo.version || 1,
                  objectStores,
                }
              } catch (error) {
                console.warn(`[nw] Error opening database ${dbInfo.name}:`, error)
                return {
                  name: dbInfo.name,
                  version: dbInfo.version || 1,
                  objectStores: [],
                }
              }
            }),
          ).then((results) => results.filter(Boolean)),
        }
      } catch (error) {
        console.warn("[nw] Error analyzing IndexedDB:", error)
      }

      const newStorageData = {
        localStorage: localStorageData,
        sessionStorage: sessionStorageData,
        cookies: cookiesData,
        indexedDB: indexedDBData,
      }

      setStorageData(newStorageData)
      setLastUpdateTime(new Date())

      const analysisTime = Date.now() - startTime
      console.log(`[nw] Storage analysis completed in ${analysisTime}ms`)

      const totalLocalStorageSize = getStorageSize(localStorageData)
      const totalSessionStorageSize = getStorageSize(sessionStorageData)
      const totalCookiesSize = getStorageSize(cookiesData)
      const totalIndexedDBSize = indexedDBData.databases.reduce(
        (total, db) => total + db.objectStores.reduce((dbTotal, store) => dbTotal + store.totalSize, 0),
        0,
      )

      const totalCalculatedSize =
        totalLocalStorageSize + totalSessionStorageSize + totalCookiesSize + totalIndexedDBSize

      const hasChanged =
        browserStorageEstimate.usage !== previousStorageValues.usage ||
        browserStorageEstimate.quota !== previousStorageValues.quota ||
        totalCalculatedSize !== previousStorageValues.totalSize

      if (hasChanged) {
        console.log("[nw] Storage values updated:", {
          browserUsage: formatBytes(browserStorageEstimate.usage),
          calculatedTotal: formatBytes(totalCalculatedSize),
          changeDetected: true,
        })

        setPreviousStorageValues({
          usage: browserStorageEstimate.usage,
          quota: browserStorageEstimate.quota,
          totalSize: totalCalculatedSize,
        })
      }

      window.dispatchEvent(
        new CustomEvent("storage-analysis-complete", {
          detail: { storageData: newStorageData, browserStorage: browserStorageEstimate },
        }),
      )
    } catch (error) {
      console.error("[nw] Failed to analyze storage:", error)
      toast.error("Failed to analyze storage")
    } finally {
      setIsLoading(false)
      isUpdatingRef.current = false
    }
  }

  const debouncedAnalyzeStorage = useCallback(() => {
    if (storageChangeTimeoutRef.current) {
      clearTimeout(storageChangeTimeoutRef.current)
    }
    storageChangeTimeoutRef.current = setTimeout(() => {
      const now = Date.now()
      if (now - lastUpdateTimeRef.current > 200 && !isUpdatingRef.current) {
        lastUpdateTimeRef.current = now
        analyzeStorage()
      }
    }, 100)
  }, [])

  useEffect(() => {
    analyzeStorage()

    const handleStorageChange = (e?: StorageEvent) => {
      console.log("[nw] Storage change detected:", e?.key || "unknown key")
      setTimeout(() => analyzeStorage(), 50)
    }

    const handleIndexedDBChange = () => {
      console.log("[nw] IndexedDB change detected")
      setTimeout(() => analyzeStorage(), 50)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("[nw] Page became visible, refreshing storage analysis")
        setTimeout(() => analyzeStorage(), 100)
      }
    }

    const handleFocus = () => {
      console.log("[nw] Window focused, refreshing storage analysis")
      setTimeout(() => analyzeStorage(), 50)
    }

    const handleStorageAnalysisComplete = () => {
      console.log("[nw] Storage analysis completed, UI updated")
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("indexeddb-change", handleIndexedDBChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("file-stored", handleIndexedDBChange)
    window.addEventListener("file-deleted", handleIndexedDBChange)
    window.addEventListener("files-cleared", handleIndexedDBChange)
    window.addEventListener("storage-analysis-complete", handleStorageAnalysisComplete)

    const periodicRefresh = setInterval(() => {
      if (!document.hidden && !isUpdatingRef.current) {
        console.log("[nw] Periodic storage refresh")
        analyzeStorage()
      }
    }, 5000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("indexeddb-change", handleIndexedDBChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("file-stored", handleIndexedDBChange)
      window.removeEventListener("file-deleted", handleIndexedDBChange)
      window.removeEventListener("files-cleared", handleIndexedDBChange)
      window.removeEventListener("storage-analysis-complete", handleStorageAnalysisComplete)
      clearInterval(periodicRefresh)

      if (storageChangeTimeoutRef.current) {
        clearTimeout(storageChangeTimeoutRef.current)
      }
    }
  }, [])

  const totalItems =
    Object.keys(storageData.localStorage).length +
    Object.keys(storageData.sessionStorage).length +
    Object.keys(storageData.cookies).length +
    storageData.indexedDB.databases.reduce(
      (total, db) => total + db.objectStores.reduce((dbTotal, store) => dbTotal + store.itemCount, 0),
      0,
    )

  const usagePercent =
    browserStorage.supported && browserStorage.quota > 0 ? (browserStorage.usage / browserStorage.quota) * 100 : 0

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-card via-card to-card/95 border border-border/50 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Database className="h-5 w-5 text-primary" />
              </div>
              {/* </CHANGE> */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Storage Analyzer
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Activity className="h-3 w-3 text-accent" />
                  {totalItems} items • Updated {lastUpdateTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {browserStorage.supported && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <Gauge className="h-3 w-3" />
                  {formatBytes(browserStorage.usage)}
                </div>
              )}
              <div className="px-3 py-1.5 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 text-accent rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Archive className="h-3 w-3" />
                {formatBytes(totalSize)}
              </div>
            </div>
          </div>

          {browserStorage.supported && (
            <div className="mb-6 p-5 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-xl border border-primary/10 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Browser Storage Quota</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      usagePercent < 50
                        ? "bg-green-500/10 text-green-600"
                        : usagePercent < 75
                          ? "bg-blue-500/10 text-blue-600"
                          : usagePercent < 90
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {usagePercent < 50 ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : usagePercent < 90 ? (
                      <Info className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {usagePercent.toFixed(1)}% Used
                  </div>
                </div>
              </div>

              <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden mb-4 shadow-inner">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                    usagePercent < 50
                      ? "bg-gradient-to-r from-green-500 to-green-400"
                      : usagePercent < 75
                        ? "bg-gradient-to-r from-blue-500 to-blue-400"
                        : usagePercent < 90
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          : "bg-gradient-to-r from-red-500 to-red-400"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <span className="text-muted-foreground text-xs font-medium">Used Space</span>
                  <div className="font-mono font-bold text-primary mt-1">{formatBytes(browserStorage.usage)}</div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
                  <span className="text-muted-foreground text-xs font-medium">Total Quota</span>
                  <div className="font-mono font-bold text-accent mt-1">{formatBytes(browserStorage.quota)}</div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border/50 hover:border-green-500/30 transition-colors">
                  <span className="text-muted-foreground text-xs font-medium">Available</span>
                  <div className="font-mono font-bold text-green-600 mt-1">
                    {formatBytes(browserStorage.quota - browserStorage.usage)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 p-5 bg-gradient-to-br from-accent/10 via-primary/10 to-accent/5 rounded-xl border border-accent/20 shadow-inner relative overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Smart Insights
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">AI-powered storage analysis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Storage Health Card */}
                <div className="bg-background/90 backdrop-blur-sm p-5 rounded-xl border-2 border-border/50 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-lg group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          healthScore.score >= 75
                            ? "bg-green-500/10"
                            : healthScore.score >= 50
                              ? "bg-yellow-500/10"
                              : "bg-red-500/10"
                        }`}
                      >
                        <HeartPulse
                          className={`h-4 w-4 ${healthScore.color} group-hover:scale-110 transition-transform`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold">Storage Health</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-2xl font-bold ${healthScore.color}`}>{healthScore.score}</span>
                      <span className="text-xs text-muted-foreground font-medium">/100</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {healthScore.score >= 75 ? (
                      <CircleCheckBig className={`h-5 w-5 ${healthScore.color}`} />
                    ) : healthScore.score >= 50 ? (
                      <Info className={`h-5 w-5 ${healthScore.color}`} />
                    ) : (
                      <AlertTriangle className={`h-5 w-5 ${healthScore.color}`} />
                    )}
                    <div>
                      <span className={`text-base font-bold ${healthScore.color}`}>{healthScore.status}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {healthScore.score >= 75
                          ? "Optimal performance"
                          : healthScore.score >= 50
                            ? "Consider cleanup"
                            : "Action required"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Largest Consumer Card */}
                <div className="bg-background/90 backdrop-blur-sm p-5 rounded-xl border-2 border-border/50 hover:border-accent/40 transition-all duration-300 shadow-md hover:shadow-lg group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Crown className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold">Top Consumer</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-lg font-bold text-amber-600">
                        {formatBytes(largestConsumers[0]?.size || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {largestConsumers[0] && (
                      <>
                        {(() => {
                          const IconComponent = largestConsumers[0].icon
                          return (
                            <div
                              className={`p-1.5 rounded-lg ${
                                largestConsumers[0].name === "IndexedDB"
                                  ? "bg-purple-500/10"
                                  : largestConsumers[0].name === "localStorage"
                                    ? "bg-blue-500/10"
                                    : largestConsumers[0].name === "sessionStorage"
                                      ? "bg-green-500/10"
                                      : "bg-orange-500/10"
                              }`}
                            >
                              <IconComponent className={`h-5 w-5 ${largestConsumers[0].color}`} />
                            </div>
                          )
                        })()}
                        <div>
                          <span className="text-base font-bold">{largestConsumers[0]?.name}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(((largestConsumers[0]?.size || 0) / totalSize) * 100).toFixed(1)}% of total storage
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Recommendations */}
              {usagePercent > 75 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-yellow-500/30 rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent animate-shimmer pointer-events-none"></div>
                  <div className="relative flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-600 mb-1">Storage Warning</h4>
                      <p className="text-xs text-yellow-700/90 dark:text-yellow-600/90 leading-relaxed">
                        You're using <span className="font-bold">{usagePercent.toFixed(0)}%</span> of available storage.
                        Consider clearing unused <span className="font-semibold">{largestConsumers[0]?.name}</span> data
                        to free up space and maintain optimal performance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 p-5 bg-muted/30 rounded-xl border border-border/50">
            <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Storage Distribution
            </h4>
            <div className="space-y-3">
              {largestConsumers.map((consumer, index) => {
                const percentage = totalSize > 0 ? (consumer.size / totalSize) * 100 : 0
                return (
                  <div key={consumer.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {consumer.icon && <consumer.icon className={`h-3.5 w-3.5 ${consumer.color}`} />}
                        <span className="font-medium text-xs break-all">{consumer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{formatBytes(consumer.size)}</span>
                        <span className="text-xs font-semibold text-primary">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          index === 0
                            ? "bg-gradient-to-r from-purple-500 to-purple-400"
                            : index === 1
                              ? "bg-gradient-to-r from-blue-500 to-blue-400"
                              : index === 2
                                ? "bg-gradient-to-r from-green-500 to-green-400"
                                : "bg-gradient-to-r from-orange-500 to-orange-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-3">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg border border-blue-500/10 cursor-pointer hover:border-blue-500/30 transition-all group"
                onClick={() => toggleExpanded("localStorage")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Package className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm sm:text-base">localStorage</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs border-blue-500/30">
                        {Object.keys(storageData.localStorage).length} items
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                    {formatBytes(storageSizes.localStorage)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-blue-500 transition-transform duration-300 ${expandedItems.has("localStorage") ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedItems.has("localStorage") ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(storageData.localStorage)
                    .slice(0, 20)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="p-3 bg-gradient-to-r from-muted to-muted/50 hover:from-muted hover:to-muted/80 rounded-lg border border-border/50 hover:border-blue-500/30 transition-all space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="font-mono font-semibold text-xs break-all text-blue-600 dark:text-blue-400">
                            {key}
                          </span>
                          <span className="text-muted-foreground text-xs self-start sm:self-auto px-2 py-0.5 bg-background/50 rounded">
                            {formatBytes(
                              new Blob([key + (typeof value === "string" ? value : JSON.stringify(value))]).size,
                            )}
                          </span>
                        </div>
                        {renderJsonValue(value, `localStorage-${key}`)}
                      </div>
                    ))}
                  {Object.keys(storageData.localStorage).length > 20 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ... and {Object.keys(storageData.localStorage).length - 20} more items
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg border border-green-500/10 cursor-pointer hover:border-green-500/30 transition-all group"
                onClick={() => toggleExpanded("sessionStorage")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <Clock className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm sm:text-base">sessionStorage</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs border-green-500/30">
                        {Object.keys(storageData.sessionStorage).length} items
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                    {formatBytes(storageSizes.sessionStorage)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-green-500 transition-transform duration-300 ${expandedItems.has("sessionStorage") ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedItems.has("sessionStorage") ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(storageData.sessionStorage)
                    .slice(0, 20)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="p-3 bg-gradient-to-r from-muted to-muted/50 hover:from-muted hover:to-muted/80 rounded-lg border border-border/50 hover:border-green-500/30 transition-all space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="font-mono font-semibold text-xs break-all text-green-600 dark:text-green-400">
                            {key}
                          </span>
                          <span className="text-muted-foreground text-xs self-start sm:self-auto px-2 py-0.5 bg-background/50 rounded">
                            {formatBytes(
                              new Blob([key + (typeof value === "string" ? value : JSON.stringify(value))]).size,
                            )}
                          </span>
                        </div>
                        {renderJsonValue(value, `sessionStorage-${key}`)}
                      </div>
                    ))}
                  {Object.keys(storageData.sessionStorage).length > 20 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ... and {Object.keys(storageData.sessionStorage).length - 20} more items
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-orange-500/5 to-transparent rounded-lg border border-orange-500/10 cursor-pointer hover:border-orange-500/30 transition-all group"
                onClick={() => toggleExpanded("cookies")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                    <Cookie className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm sm:text-base">Cookies</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs border-orange-500/30">
                        {Object.keys(storageData.cookies).length} items
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                    {formatBytes(storageSizes.cookies)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-orange-500 transition-transform duration-300 ${expandedItems.has("cookies") ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedItems.has("cookies") ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(storageData.cookies)
                    .slice(0, 15)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="p-3 bg-gradient-to-r from-muted to-muted/50 hover:from-muted hover:to-muted/80 rounded-lg border border-border/50 hover:border-orange-500/30 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="font-mono font-semibold text-xs break-all text-orange-600 dark:text-orange-400">
                            {key}
                          </span>
                          <span className="text-muted-foreground text-xs self-start sm:self-auto px-2 py-0.5 bg-background/50 rounded">
                            {formatBytes(new Blob([key + value]).size)}
                          </span>
                        </div>
                        <div className="mt-2 text-muted-foreground break-all text-xs font-mono bg-background/30 p-2 rounded">
                          {value}
                        </div>
                      </div>
                    ))}
                  {Object.keys(storageData.cookies).length > 15 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ... and {Object.keys(storageData.cookies).length - 15} more items
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-purple-500/5 to-transparent rounded-lg border border-purple-500/10 cursor-pointer hover:border-purple-500/30 transition-all group"
                onClick={() => toggleExpanded("indexedDB")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Server className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm sm:text-base">IndexedDB</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs border-purple-500/30">
                        {storageData.indexedDB.databases.length} databases
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                    {formatBytes(storageSizes.indexedDB)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-purple-500 transition-transform duration-300 ${expandedItems.has("indexedDB") ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedItems.has("indexedDB") ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {storageData.indexedDB.databases.map((db) => (
                    <div
                      key={db.name}
                      className="p-3 bg-gradient-to-r from-muted to-muted/50 rounded-lg border border-border/50 hover:border-purple-500/30 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-mono font-semibold text-xs break-all text-purple-600 dark:text-purple-400">
                          {db.name}
                        </span>
                        <span className="text-muted-foreground text-xs self-start sm:self-auto px-2 py-0.5 bg-background/50 rounded">
                          v{db.version}
                        </span>
                      </div>
                      {db.objectStores.slice(0, 10).map((store) => (
                        <div
                          key={store.name}
                          className="ml-2 space-y-2 p-2 bg-background/50 rounded-lg border border-border/30"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3 w-3 text-purple-500" />
                              <span className="font-medium text-xs break-all">{store.name}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 self-start sm:self-auto">
                              <span className="text-muted-foreground text-xs font-mono">
                                {formatBytes(store.totalSize)}
                              </span>
                              <span className="text-muted-foreground text-xs">({store.itemCount} items)</span>
                            </div>
                          </div>
                          {store.sampleData && store.sampleData.length > 0 && (
                            <div className="ml-2 sm:ml-4 space-y-1.5">
                              <span className="text-muted-foreground text-xs font-medium">Sample data:</span>
                              {store.sampleData.slice(0, 3).map((item, index) => (
                                <div key={index} className="p-2 bg-background/70 rounded border border-border/30">
                                  {renderJsonValue(
                                    item.value,
                                    `indexeddb-${db.name}-${store.name}-${index}`,
                                    item.actualSize,
                                  )}
                                </div>
                              ))}
                              {store.sampleData.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  ... {store.sampleData.length - 3} more records
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {db.objectStores.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center">
                          ... and {db.objectStores.length - 10} more object stores
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
