"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Settings, X, Download, HardDrive } from "lucide-react"
import { sessionPersistence } from "@/lib/session-persistence"

interface OptimizationSettings {
  chunkSize: number
  autoDownload: boolean
  maxFileSize: number
  maxFilesPerTransfer: number
}

interface FloatingSettingsBubbleProps {
  chunkSize: number
  autoDownload: boolean
  maxFilesPerTransfer: number
  onChunkSizeChange: (value: number) => void
  onAutoDownloadChange: (value: boolean) => void
  onMaxFilesPerTransferChange: (value: number) => void
}

export function FloatingSettingsBubble({
  chunkSize,
  autoDownload,
  maxFilesPerTransfer,
  onChunkSizeChange,
  onAutoDownloadChange,
  onMaxFilesPerTransferChange,
}: FloatingSettingsBubbleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<OptimizationSettings>({
    chunkSize: chunkSize || 64,
    autoDownload: autoDownload || false,
    maxFileSize: 100,
    maxFilesPerTransfer: maxFilesPerTransfer || 10,
  })

  const storageKey = useMemo(() => {
    try {
      const s = sessionPersistence.loadSession()
      if (s?.id) {
        const safeName = s.name ? s.name.replace(/[:]/g, "_") : ""
        return `fileTransferSettings:${s.id}:${safeName}`
      }
    } catch {}
    return "fileTransferSettings"
  }, [])

  const hasHydratedFromStorage = useRef(false)

  useEffect(() => {
    try {
      const savedRaw = sessionStorage.getItem(storageKey)
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as Partial<OptimizationSettings>
        setSettings((prev) => ({ ...prev, ...parsed }))
        // Immediately sync parent so sessionPersistence stores the value with id + name
        if (typeof parsed.maxFilesPerTransfer === "number") {
          onMaxFilesPerTransferChange(parsed.maxFilesPerTransfer)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to load settings from sessionStorage:", error)
    } finally {
      hasHydratedFromStorage.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(settings))
    } catch (error) {
      console.error("[v0] Failed to save settings to sessionStorage:", error)
    }
  }, [settings, storageKey])

  useEffect(() => {
    if (!hasHydratedFromStorage.current) return
    setSettings((prev) => ({
      ...prev,
      chunkSize: typeof chunkSize === "number" ? chunkSize : prev.chunkSize,
      autoDownload: typeof autoDownload === "boolean" ? autoDownload : prev.autoDownload,
      maxFilesPerTransfer: typeof maxFilesPerTransfer === "number" ? maxFilesPerTransfer : prev.maxFilesPerTransfer,
    }))
  }, [chunkSize, autoDownload, maxFilesPerTransfer])

  const handleSettingChange = (key: keyof OptimizationSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))

    if (key === "chunkSize") {
      onChunkSizeChange(value)
    }
    if (key === "autoDownload") {
      onAutoDownloadChange(value)
    }
    if (key === "maxFilesPerTransfer") {
      onMaxFilesPerTransferChange(value)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-0 group"
        >
          <Settings className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Configure your file transfer preferences</p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-10 w-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="space-y-6">
                {/* File Limits */}
                <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <HardDrive className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">File Limits</h3>
                        <p className="text-sm text-gray-500">Configure file size restrictions</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm">Max File Size: {settings.maxFileSize || 100} MB</Label>
                        </div>
                        <Slider
                          value={[settings.maxFileSize || 100]}
                          onValueChange={([value]) => handleSettingChange("maxFileSize", value)}
                          max={1000}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>1 MB</span>
                          <span>1000 MB</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm">
                            Max Files Per Transfer: {settings.maxFilesPerTransfer || 10}
                          </Label>
                        </div>
                        <Slider
                          value={[settings.maxFilesPerTransfer || 10]}
                          onValueChange={([value]) => handleSettingChange("maxFilesPerTransfer", value)}
                          max={50}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>1 file</span>
                          <span>50 files</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chunk Size */}
                <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <HardDrive className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Chunk Size</h3>
                        <p className="text-sm text-gray-500">{settings.chunkSize} KB per chunk</p>
                      </div>
                    </div>
                    <Slider
                      value={[settings.chunkSize]}
                      onValueChange={([value]) => handleSettingChange("chunkSize", value)}
                      max={512}
                      min={16}
                      step={16}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>16 KB</span>
                      <span>512 KB</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Auto Download */}
                <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Download className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Auto Download</h3>
                        <p className="text-sm text-gray-500">Automatically save incoming files</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Enable Auto Download</Label>
                      <Switch
                        checked={settings.autoDownload}
                        onCheckedChange={(checked) => handleSettingChange("autoDownload", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingSettingsBubble
