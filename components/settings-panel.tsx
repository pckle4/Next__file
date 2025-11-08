"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Settings, X, Zap, Shield, Volume2, Bell, Monitor, Check, RotateCcw } from "lucide-react"

interface SettingsPanelProps {
  chunkSize: number
  autoDownload: boolean
  onChunkSizeChange: (size: number) => void
  onAutoDownloadChange: (enabled: boolean) => void
}

export function SettingsPanel({
  chunkSize,
  autoDownload,
  onChunkSizeChange,
  onAutoDownloadChange,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempChunkSize, setTempChunkSize] = useState(chunkSize.toString())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // Track unsaved changes

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState("system")
  const [maxConnections, setMaxConnections] = useState([5])
  const [compressionLevel, setCompressionLevel] = useState([3])
  const [encryptionMode, setEncryptionMode] = useState("standard")

  const handleChunkSizeChange = (value: string) => {
    setTempChunkSize(value)
    setHasUnsavedChanges(true)
  }

  const handleApplySettings = () => {
    const size = Number.parseInt(tempChunkSize)
    if (size >= 1024 && size <= 2097152) {
      onChunkSizeChange(size)
      setHasUnsavedChanges(false)
    }
  }

  const handleChunkSizeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplySettings()
    }
  }

  const handleResetToDefaults = () => {
    setTempChunkSize("262144")
    onChunkSizeChange(262144)
    onAutoDownloadChange(true)
    setSoundEnabled(true)
    setNotifications(true)
    setTheme("system")
    setMaxConnections([5])
    setCompressionLevel([3])
    setEncryptionMode("standard")
    setHasUnsavedChanges(false)
  }

  return (
    <>
      {/* Floating Settings Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="default"
          className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 hover:scale-110 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
          <Settings className="h-5 w-5 animate-spin-slow group-hover:animate-spin transition-all duration-300 relative z-10" />
          {hasUnsavedChanges && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping" />
          )}
        </Button>
      </div>

      {/* Settings Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="relative">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Settings className="h-6 w-6 text-primary animate-float" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  </div>
                  Settings
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure transfer settings, security, and preferences
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <Badge
                    variant="outline"
                    className="border-orange-500/30 text-orange-600 bg-orange-500/10 animate-pulse"
                  >
                    Unsaved Changes
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pb-8">
              {/* Transfer Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Zap className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Transfer Settings</h3>
                    <p className="text-sm text-muted-foreground">Optimize file transfer performance</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Chunk Size Setting */}
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="chunk-size" className="text-base font-medium">
                          Chunk Size (bytes)
                        </Label>
                        <Badge variant="secondary" className="font-mono">
                          {(chunkSize / 1024).toFixed(0)}KB
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="chunk-size"
                          type="number"
                          min="1024"
                          max="2097152"
                          value={tempChunkSize}
                          onChange={(e) => handleChunkSizeChange(e.target.value)}
                          onKeyPress={handleChunkSizeKeyPress}
                          placeholder="262144"
                          className="font-mono flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Range: 1KB - 2MB. Larger chunks = faster transfer, smaller chunks = more reliable on slow
                        connections.
                      </p>
                    </div>
                  </Card>

                  {/* Auto Download Setting */}
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between h-full">
                      <div className="space-y-2">
                        <Label htmlFor="auto-download" className="text-base font-medium">
                          Auto Download
                        </Label>
                        <p className="text-sm text-muted-foreground">Automatically download received files</p>
                      </div>
                      <Switch
                        id="auto-download"
                        checked={autoDownload}
                        onCheckedChange={onAutoDownloadChange}
                        className="scale-125"
                      />
                    </div>
                  </Card>
                </div>

                {/* Performance Sliders */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Max Connections */}
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Maximum Concurrent Connections</Label>
                        <Badge variant="outline" className="font-semibold">
                          {maxConnections[0]} peers
                        </Badge>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={maxConnections}
                          onValueChange={setMaxConnections}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 peer</span>
                        <span>10 peers</span>
                      </div>
                    </div>
                  </Card>

                  {/* Compression Level */}
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">File Compression Level</Label>
                        <Badge variant="outline" className="font-semibold">
                          Level {compressionLevel[0]}
                        </Badge>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={compressionLevel}
                          onValueChange={setCompressionLevel}
                          max={9}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>None (Faster)</span>
                        <span>Maximum (Smaller)</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quick Presets */}
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Quick Presets</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempChunkSize("16384")
                          setHasUnsavedChanges(true)
                        }}
                        className="hover:scale-105 transition-transform"
                      >
                        Reliable (16KB)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempChunkSize("65536")
                          setHasUnsavedChanges(true)
                        }}
                        className="hover:scale-105 transition-transform"
                      >
                        Balanced (64KB)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempChunkSize("262144")
                          setHasUnsavedChanges(true)
                        }}
                        className="hover:scale-105 transition-transform"
                      >
                        Fast (256KB)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempChunkSize("524288")
                          setHasUnsavedChanges(true)
                        }}
                        className="hover:scale-105 transition-transform"
                      >
                        Ultra (512KB)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempChunkSize("1048576")
                          setHasUnsavedChanges(true)
                        }}
                        className="hover:scale-105 transition-transform"
                      >
                        Max (1MB)
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        "💡 For large files (>100MB), use Ultra or Max. For small files or slow connections, use Reliable or Balanced."
                      }
                    </p>
                  </div>
                </Card>
              </div>

              {/* Security Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <Shield className="h-5 w-5 text-blue-500 animate-glow" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold !text-slate-900 dark:!text-slate-100">Security & Privacy</h3>
                    <p className="text-sm !text-slate-600 dark:!text-slate-400">
                      Configure encryption and security options
                    </p>
                  </div>
                </div>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Encryption Mode</Label>
                    <Select value={encryptionMode} onValueChange={setEncryptionMode}>
                      <SelectTrigger className="hover:border-primary/50 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (AES-256)</SelectItem>
                        <SelectItem value="enhanced">Enhanced (AES-256 + RSA)</SelectItem>
                        <SelectItem value="paranoid">Paranoid (Triple Encryption)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Higher encryption levels provide better security but may reduce transfer speed.
                    </p>
                  </div>
                </Card>

                {/* Security Features */}
                <Card className="p-4 hover:shadow-md transition-shadow bg-slate-100 dark:bg-slate-800">
                  <div className="space-y-4">
                    <Label className="text-base font-medium !text-slate-900 dark:!text-slate-100">
                      Security Features
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg border">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm !text-slate-800 dark:!text-slate-200">
                          End-to-end encrypted transfers
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg border">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm !text-slate-800 dark:!text-slate-200">
                          Direct peer-to-peer connection (no servers)
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg border">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-sm !text-slate-800 dark:!text-slate-200">
                          Files never stored on external servers
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* User Experience Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <Monitor className="h-5 w-5 text-purple-500 animate-heartbeat" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">User Experience</h3>
                    <p className="text-sm text-muted-foreground">Customize interface and notifications</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Theme Setting */}
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Theme</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="hover:border-primary/50 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>

                  {/* Sound Effects */}
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col justify-between h-full">
                      <div className="space-y-2">
                        <Label htmlFor="sound-effects" className="flex items-center gap-2 text-base font-medium">
                          <Volume2 className="h-4 w-4" />
                          Sound Effects
                        </Label>
                        <p className="text-sm text-muted-foreground">Play sounds for transfer events</p>
                      </div>
                      <Switch
                        id="sound-effects"
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                        className="scale-125 mt-4"
                      />
                    </div>
                  </Card>

                  {/* Notifications */}
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col justify-between h-full">
                      <div className="space-y-2">
                        <Label htmlFor="notifications" className="flex items-center gap-2 text-base font-medium">
                          <Bell className="h-4 w-4" />
                          Desktop Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">Show system notifications for transfers</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                        className="scale-125 mt-4"
                      />
                    </div>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  onClick={handleApplySettings}
                  disabled={!hasUnsavedChanges}
                  className="flex-1 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
                  size="lg"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Apply Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetToDefaults}
                  className="flex-1 hover:scale-105 transition-transform bg-transparent"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
