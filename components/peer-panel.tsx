"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Send,
  Upload,
  User,
  Wifi,
  WifiOff,
  X,
  Activity,
  Shield,
  Lock,
  CheckCircle2,
  Star,
  Award,
  Verified,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AnimatedIcon, kindFromFilename } from "@/components/animated-icon"
import { computeFileMetadata, formatBytes, type FileMetadata } from "@/lib/file-metadata"

interface PeerPanelProps {
  connectedPeers: string[]
  peerInfo: Map<string, { id: string; displayName?: string; connectedAt: Date }>
  isConnected: boolean
  onSendFile: (file: File, targetPeerId: string) => Promise<void>
  onDisconnectPeer?: (peerId: string) => void
  displayName: string
}

export function PeerPanel({
  connectedPeers,
  peerInfo,
  isConnected,
  onSendFile,
  onDisconnectPeer,
  displayName,
}: PeerPanelProps) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({})
  const [sendingStates, setSendingStates] = useState<Record<string, boolean>>({})
  const [disconnectingStates, setDisconnectingStates] = useState<Record<string, boolean>>({})
  const [selectedMeta, setSelectedMeta] = useState<Record<string, FileMetadata | null>>({})
  const [computingMeta, setComputingMeta] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleFileSelect = (peerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [peerId]: file }))
      setComputingMeta((prev) => ({ ...prev, [peerId]: true }))
      computeFileMetadata(file)
        .then((meta) => {
          setSelectedMeta((prev) => ({ ...prev, [peerId]: meta }))
        })
        .catch(() => {
          setSelectedMeta((prev) => ({ ...prev, [peerId]: null }))
        })
        .finally(() => {
          setComputingMeta((prev) => ({ ...prev, [peerId]: false }))
        })
    }
  }

  const handleSendToPeer = async (peerId: string) => {
    const file = selectedFiles[peerId]
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to send to this peer.",
        variant: "destructive",
      })
      return
    }

    setSendingStates((prev) => ({ ...prev, [peerId]: true }))

    try {
      await onSendFile(file, peerId)

      setSelectedFiles((prev) => ({ ...prev, [peerId]: null }))
      setSelectedMeta((prev) => ({ ...prev, [peerId]: null }))

      const fileInput = document.getElementById(`file-${peerId}`) as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      toast({
        title: "File Sent!",
        description: `Successfully sent ${file.name} to peer ${peerId}`,
      })
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingStates((prev) => ({ ...prev, [peerId]: false }))
    }
  }

  const handleDisconnectPeer = async (peerId: string) => {
    if (!onDisconnectPeer) return

    setDisconnectingStates((prev) => ({ ...prev, [peerId]: true }))

    try {
      await onDisconnectPeer(peerId)

      toast({
        title: "Peer Disconnected",
        description: `Successfully disconnected from peer ${peerId}`,
      })
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect from peer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDisconnectingStates((prev) => ({ ...prev, [peerId]: false }))
    }
  }

  if (!isConnected || connectedPeers.length === 0) {
    return (
      <Card className="animate-slide-up glass-card hover-glow border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted/20">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <span>Connected Peers</span>
              <div className="text-sm text-muted-foreground font-normal">Manage peer connections</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 glass-effect rounded-2xl animate-pulse" />
              <WifiOff className="absolute inset-0 m-auto h-10 w-10 opacity-50" />
            </div>
            <p className="text-lg font-medium mb-2">No Connected Peers</p>
            <p className="text-sm">Connect to peers to see them here and send files individually.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up glass-card hover-glow border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
              <Users className="h-5 w-5 text-primary animate-float" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span>Connected Peers ({connectedPeers.length})</span>
              <Shield className="h-4 w-4 text-green-500" />
              <Lock className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm text-muted-foreground font-normal">Manage peer connections and file transfers</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedPeers.map((peerId) => {
          const peer = peerInfo.get(peerId)
          const peerDisplayName = peer?.displayName || `Peer ${peerId}`

          return (
            <div
              key={peerId}
              className="glass-effect rounded-2xl p-5 border border-border/30 hover:border-primary/30 transition-all duration-300 hover-scale group"
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/50 transition-colors">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold text-foreground bg-accent/10 px-3 py-1.5 rounded-lg border truncate">
                            {peerDisplayName}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs border-green-500/30 text-green-600 bg-green-500/10"
                          >
                            <Wifi className="h-3 w-3 mr-1" />
                            Online
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Verified className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600">Verified</span>
                          </div>
                        </div>
                        <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded block break-all">
                          ID: {peerId}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Active</span>
                      <Star className="h-3 w-3 text-yellow-500" />
                      <Award className="h-3 w-3 text-purple-500" />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      aria-label={`Disconnect ${peerDisplayName}`}
                      onClick={() => handleDisconnectPeer(peerId)}
                      disabled={disconnectingStates[peerId]}
                      className="w-full sm:w-auto h-9 sm:h-8 px-3 rounded-lg font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {disconnectingStates[peerId] ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">Disconnecting</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <X className="h-3 w-3" />
                          <span className="text-xs">Disconnect</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Secure File Transfer</span>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Protected</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id={`file-${peerId}`}
                      type="file"
                      onChange={(e) => handleFileSelect(peerId, e)}
                      className="sr-only"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const el = document.getElementById(`file-${peerId}`) as HTMLInputElement | null
                        if (el) el.click()
                      }}
                      aria-controls={`file-${peerId}`}
                      className="h-12 w-full sm:w-auto justify-center gap-2 text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose File</span>
                    </Button>

                    <Button
                      variant="success"
                      onClick={() => handleSendToPeer(peerId)}
                      disabled={!selectedFiles[peerId] || sendingStates[peerId]}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 hover-scale transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 h-12 px-5 rounded-xl font-bold w-full sm:w-auto text-base"
                    >
                      {sendingStates[peerId] ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span className="text-base">Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          <span className="text-base">Send File</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  {selectedFiles[peerId] && (
                    <div className="text-sm text-muted-foreground glass-effect p-4 rounded-lg border border-border/30 animate-slide-in-right">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const file = selectedFiles[peerId]!
                            const kind = kindFromFilename(file.name, file.type || "")
                            return <AnimatedIcon kind={kind} size={20} />
                          })()}
                          <span className="font-medium text-foreground break-all">{selectedFiles[peerId]!.name}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Size: {formatBytes(selectedFiles[peerId]!.size)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Type: {selectedFiles[peerId]!.type || "unknown"}
                          </Badge>
                          {selectedMeta[peerId]?.extension && (
                            <Badge variant="outline" className="text-xs">
                              Ext: {selectedMeta[peerId]!.extension}
                            </Badge>
                          )}
                          {selectedMeta[peerId]?.imageWidth && selectedMeta[peerId]?.imageHeight && (
                            <Badge variant="outline" className="text-xs">
                              {selectedMeta[peerId]!.imageWidth}×{selectedMeta[peerId]!.imageHeight}px
                            </Badge>
                          )}
                          {computingMeta[peerId] ? (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Checksum
                            </Badge>
                          ) : selectedMeta[peerId]?.sha256Hex ? (
                            <Badge variant="outline" className="text-xs">
                              SHA-256: {selectedMeta[peerId]!.sha256Hex.slice(0, 8)}…
                            </Badge>
                          ) : null}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {selectedMeta[peerId]?.lastModified
                            ? `Last modified: ${new Date(selectedMeta[peerId]!.lastModified!).toLocaleString()}`
                            : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
