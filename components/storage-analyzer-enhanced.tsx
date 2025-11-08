"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  HardDrive,
  Cookie,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Monitor,
  Archive,
  Clock,
  FileText,
  LayoutDashboard,
  ListTree,
} from "lucide-react"
import { useState, useEffect } from "react"
import { fileStorage } from "@/lib/file-storage"
import { receivedFilesStorage } from "@/lib/received-files-storage"
import { fileHistoryPersistence } from "@/lib/file-history-persistence"

interface StorageInfo {
  type: string
  icon: React.ReactNode
  size: string
  itemCount: number
  details: Array<{ key: string; value: string; size?: string }>
  canClear: boolean
  clearFunction?: () => Promise<void> | void
}

export function StorageAnalyzer() {
  const [storageData, setStorageData] = useState<StorageInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({})
  const [clearing, setClearing] = useState<{ [key: string]: boolean }>({})

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const getStorageSize = (storage: Storage): number => {
    let total = 0
    for (const key in storage) {
      if (storage.hasOwnProperty(key)) {
        total += storage[key].length + key.length
      }
    }
    return total * 2 // Rough estimate (UTF-16)
  }

  const getCookieSize = (): number => {
    return document.cookie.length * 2
  }

  const getIndexedDBSize = async (
    dbName: string,
  ): Promise<{ size: number; count: number; items: Array<{ key: string; value: string; size?: string }> }> => {
    return new Promise((resolve) => {
      const request = indexedDB.open(dbName)

      request.onerror = () => {
        resolve({ size: 0, count: 0, items: [] })
      }

      request.onsuccess = () => {
        const db = request.result
        const storeNames = Array.from(db.objectStoreNames)
        let totalSize = 0
        let totalCount = 0
        const items: Array<{ key: string; value: string; size?: string }> = []

        if (storeNames.length === 0) {
          resolve({ size: 0, count: 0, items: [] })
          return
        }

        let completed = 0

        storeNames.forEach((storeName) => {
          const transaction = db.transaction([storeName], "readonly")
          const store = transaction.objectStore(storeName)
          const request = store.getAll()

          request.onsuccess = () => {
            const data = request.result
            totalCount += data.length

            data.forEach((item: any, index: number) => {
              const itemSize = JSON.stringify(item).length * 2
              totalSize += itemSize

              if (index < 5) {
                // Show first 5 items
                items.push({
                  key: `${storeName}[${item.id || index}]`,
                  value: item.name || item.id || `Item ${index}`,
                  size: formatBytes(itemSize),
                })
              }
            })

            completed++
            if (completed === storeNames.length) {
              resolve({ size: totalSize, count: totalCount, items })
            }
          }

          request.onerror = () => {
            completed++
            if (completed === storeNames.length) {
              resolve({ size: totalSize, count: totalCount, items })
            }
          }
        })
      }
    })
  }

  const analyzeStorage = async () => {
    setIsLoading(true)

    try {
      const localStorageSize = getStorageSize(localStorage)
      const localStorageItems: Array<{ key: string; value: string; size?: string }> = []

      for (let i = 0; i < Math.min(localStorage.length, 10); i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key) || ""
          localStorageItems.push({
            key,
            value: value.length > 50 ? `${value.substring(0, 50)}...` : value,
            size: formatBytes((key.length + value.length) * 2),
          })
        }
      }

      const sessionStorageSize = getStorageSize(sessionStorage)
      const sessionStorageItems: Array<{ key: string; value: string; size?: string }> = []

      for (let i = 0; i < Math.min(sessionStorage.length, 10); i++) {
        const key = sessionStorage.key(i)
        if (key) {
          const value = sessionStorage.getItem(key) || ""
          sessionStorageItems.push({
            key,
            value: value.length > 50 ? `${value.substring(0, 50)}...` : value,
            size: formatBytes((key.length + value.length) * 2),
          })
        }
      }

      const cookieSize = getCookieSize()
      const cookies = document.cookie.split(";").filter((c) => c.trim())
      const cookieItems = cookies.slice(0, 10).map((cookie) => {
        const [key, ...valueParts] = cookie.trim().split("=")
        const value = valueParts.join("=")
        return {
          key: key || "unknown",
          value: value.length > 50 ? `${value.substring(0, 50)}...` : value,
          size: formatBytes(cookie.length * 2),
        }
      })

      const fileStorageInfo = await getIndexedDBSize("NowhileFileStorage")
      const receivedFilesInfo = await getIndexedDBSize("received_files_db")
      const fileHistoryInfo = await getIndexedDBSize("FileHistoryDB")

      const storageInfo: StorageInfo[] = [
        {
          type: "localStorage",
          icon: <HardDrive className="h-5 w-5 text-blue-500" />,
          size: formatBytes(localStorageSize),
          itemCount: localStorage.length,
          details: localStorageItems,
          canClear: true,
          clearFunction: () => {
            localStorage.clear()
            analyzeStorage()
          },
        },
        {
          type: "sessionStorage",
          icon: <Monitor className="h-5 w-5 text-green-500" />,
          size: formatBytes(sessionStorageSize),
          itemCount: sessionStorage.length,
          details: sessionStorageItems,
          canClear: true,
          clearFunction: () => {
            sessionStorage.clear()
            analyzeStorage()
          },
        },
        {
          type: "Cookies",
          icon: <Cookie className="h-5 w-5 text-orange-500" />,
          size: formatBytes(cookieSize),
          itemCount: cookies.length,
          details: cookieItems,
          canClear: true,
          clearFunction: () => {
            document.cookie.split(";").forEach((cookie) => {
              const eqPos = cookie.indexOf("=")
              const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
            })
            analyzeStorage()
          },
        },
        {
          type: "File Storage (IndexedDB)",
          icon: <Archive className="h-5 w-5 text-purple-500" />,
          size: formatBytes(fileStorageInfo.size),
          itemCount: fileStorageInfo.count,
          details: fileStorageInfo.items,
          canClear: true,
          clearFunction: async () => {
            await fileStorage.clearAll()
            analyzeStorage()
          },
        },
        {
          type: "Received Files (IndexedDB)",
          icon: <FileText className="h-5 w-5 text-cyan-500" />,
          size: formatBytes(receivedFilesInfo.size),
          itemCount: receivedFilesInfo.count,
          details: receivedFilesInfo.items,
          canClear: true,
          clearFunction: async () => {
            await receivedFilesStorage.clearAllFiles()
            analyzeStorage()
          },
        },
        {
          type: "File History (IndexedDB)",
          icon: <Clock className="h-5 w-5 text-pink-500" />,
          size: formatBytes(fileHistoryInfo.size),
          itemCount: fileHistoryInfo.count,
          details: fileHistoryInfo.items,
          canClear: true,
          clearFunction: async () => {
            await fileHistoryPersistence.clearAllFiles()
            analyzeStorage()
          },
        },
      ]

      setStorageData(storageInfo)
    } catch (error) {
      console.error("Failed to analyze storage:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    analyzeStorage()
  }, [])

  const handleClear = async (storageType: string, clearFunction?: () => Promise<void> | void) => {
    if (!clearFunction) return

    setClearing((prev) => ({ ...prev, [storageType]: true }))

    try {
      await clearFunction()
      console.log(`[nw] Cleared ${storageType} storage`)
    } catch (error) {
      console.error(`Failed to clear ${storageType}:`, error)
    } finally {
      setClearing((prev) => ({ ...prev, [storageType]: false }))
    }
  }

  const toggleDetails = (storageType: string) => {
    setShowDetails((prev) => ({
      ...prev,
      [storageType]: !prev[storageType],
    }))
  }

  const getTotalSize = () => {
    return storageData.reduce((total, storage) => {
      const sizeStr = storage.size
      const sizeNum = Number.parseFloat(sizeStr.split(" ")[0])
      const unit = sizeStr.split(" ")[1]

      let bytes = sizeNum
      switch (unit) {
        case "KB":
          bytes *= 1024
          break
        case "MB":
          bytes *= 1024 * 1024
          break
        case "GB":
          bytes *= 1024 * 1024 * 1024
          break
      }

      return total + bytes
    }, 0)
  }

  const getTotalItems = () => {
    return storageData.reduce((total, storage) => total + storage.itemCount, 0)
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Analyzing storage...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Storage Analyzer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {formatBytes(getTotalSize())} total
            </Badge>
            <Badge variant="outline" className="text-sm">
              {getTotalItems()} items
            </Badge>
            <Button variant="outline" size="sm" onClick={analyzeStorage} className="h-8 px-3 text-sm bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="group gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary transition-transform duration-200 group-data-[state=active]:scale-110 group-hover:scale-105" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="group gap-2">
              <ListTree className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=active]:scale-110 group-hover:scale-105" />
              <span>Details</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storageData.map((storage) => (
                <div
                  key={storage.type}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">{storage.icon}</div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{storage.type}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{storage.size}</span>
                      <span>•</span>
                      <span>{storage.itemCount} items</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDetails(storage.type)}
                      className="h-8 px-3 text-sm"
                    >
                      {showDetails[storage.type] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>

                    {storage.canClear && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClear(storage.type, storage.clearFunction)}
                        disabled={clearing[storage.type]}
                        className="h-8 px-3 text-sm text-destructive hover:bg-destructive/10"
                      >
                        {clearing[storage.type] ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {storageData.map((storage) => (
              <div key={storage.type} className="space-y-2">
                <div className="flex items-center gap-2">
                  {storage.icon}
                  <h3 className="font-medium">{storage.type}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {storage.itemCount} items
                  </Badge>
                </div>

                {storage.details.length > 0 ? (
                  <div className="space-y-1 pl-7">
                    {storage.details.map((detail, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                        <div className="flex-1 min-w-0">
                          <span className="font-mono text-xs text-muted-foreground">{detail.key}:</span>
                          <span className="ml-2 truncate">{detail.value}</span>
                        </div>
                        {detail.size && (
                          <Badge variant="outline" className="text-xs ml-2">
                            {detail.size}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {storage.itemCount > storage.details.length && (
                      <p className="text-xs text-muted-foreground pl-2">
                        ... and {storage.itemCount - storage.details.length} more items
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground pl-7">No items found</p>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
