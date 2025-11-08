"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Copy, Check, RefreshCw, Wifi, WifiOff, User, Shield, AlertCircle, Info, Loader2 } from "lucide-react"
import { toast as showToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { connectedPeersDB } from "@/lib/connected-peers-db"

interface ConnectionHubProps {
  peerId: string | null
  isConnected: boolean
  connectionStatus: "disconnected" | "connecting" | "connected" | "ready" | "error" | "initializing"
  connectedPeers: string[]
  peerInfo: Map<string, { id: string; displayName?: string; connectedAt: Date }>
  error: string | null
  displayName?: string
  connectKey: string
  onConnectKeyChange: (key: string) => void
  onConnect: () => void
  onCopyKey: () => void
  onRegenerateKey: () => void
  onConnectToPeer?: (peerId: string) => void
}

const ConnectionHub = ({
  peerId,
  isConnected,
  connectionStatus,
  connectedPeers,
  peerInfo,
  error,
  displayName,
  connectKey,
  onConnectKeyChange,
  onConnect,
  onCopyKey,
  onRegenerateKey,
  onConnectToPeer,
}: ConnectionHubProps) => {
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [isAutoConnecting, setIsAutoConnecting] = useState(false)
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false)
  const [pendingReconnectPeers, setPendingReconnectPeers] = useState<Array<{ peerId: string; displayName?: string }>>(
    [],
  )
  const [reconnectionProgress, setReconnectionProgress] = useState<{
    current: number
    total: number
    status: string
  } | null>(null)
  const hasShownReconnectPrompt = useRef(false)

  const connectedPeersRef = useRef<string[]>(connectedPeers)
  const statusRef = useRef<typeof connectionStatus>(connectionStatus)
  useEffect(() => {
    connectedPeersRef.current = connectedPeers
  }, [connectedPeers])
  useEffect(() => {
    statusRef.current = connectionStatus
  }, [connectionStatus])

  useEffect(() => {
    const checkStoredPeers = async () => {
      if (hasShownReconnectPrompt.current) return
      if (isConnected) return
      if (connectionStatus !== "ready" && connectionStatus !== "initializing" && connectionStatus !== "connecting")
        return

      try {
        const idbFlag = await connectedPeersDB.getRefreshFlag()

        let flagClientId = idbFlag?.clientId
        let flagTimestamp = idbFlag?.timestamp
        let hasFlag = Boolean(idbFlag?.hasRefreshed)

        if (!hasFlag && typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("nw_refresh_flag")
            if (raw) {
              const parsed = JSON.parse(raw) as { clientId?: string; timestamp?: number }
              flagClientId = parsed.clientId
              flagTimestamp = parsed.timestamp
              hasFlag = true
            }
          } catch {
            // ignore parse errors
          }
        }

        if (!hasFlag) return

        const myClientId =
          typeof window !== "undefined"
            ? localStorage.getItem("nw_client_id") || (window as any).__nwClientId || null
            : null

        const isRecent = Date.now() - (flagTimestamp || 0) < 300_000

        const clientIdMatches = !flagClientId || !myClientId || flagClientId === myClientId
        if (!clientIdMatches || !isRecent) {
          return
        }

        const storedPeers = await connectedPeersDB.getAllPeers()
        if (storedPeers.length > 0) {
          setPendingReconnectPeers(storedPeers.map((p) => ({ peerId: p.peerId, displayName: p.displayName })))
          setShowReconnectPrompt(true)
          hasShownReconnectPrompt.current = true
        }
      } catch {
        // Silent error handling
      }
    }

    checkStoredPeers()
  }, [connectionStatus, isConnected])

  useEffect(() => {
    if (
      connectKey.length === 6 &&
      !isConnected &&
      !isAutoConnecting &&
      connectionStatus === "ready" &&
      peerId &&
      !connectedPeers.includes(connectKey)
    ) {
      setTimeout(() => {
        onConnect()
      }, 800)
    }
  }, [connectKey, isConnected, isAutoConnecting, connectionStatus, onConnect, peerId, connectedPeers])

  const handleCopyKey = useCallback(async () => {
    try {
      if (!peerId) {
        showToast({ title: "No connection key available to copy", variant: "destructive" })
        return
      }

      await navigator.clipboard.writeText(peerId)
      setCopyFeedback(true)
      onCopyKey()
      showToast({ title: "Connection key copied!" })

      setTimeout(() => {
        setCopyFeedback(false)
      }, 2000)
    } catch (error) {
      showToast({ title: "Failed to copy connection key", variant: "destructive" })
    }
  }, [peerId, onCopyKey])

  const handleConnect = useCallback(() => {
    if (!connectKey.trim()) {
      showToast({ title: "Please enter a connection key", variant: "destructive" })
      return
    }
    if (connectKey.length !== 6) {
      showToast({ title: "Connection key must be 6 characters", variant: "destructive" })
      return
    }
    if (connectKey === peerId) {
      showToast({ title: "Cannot connect to yourself", variant: "destructive" })
      return
    }
    if (connectedPeers.includes(connectKey)) {
      showToast({ title: "Already connected to this peer", variant: "destructive" })
      return
    }
    onConnect()
  }, [connectKey, peerId, connectedPeers, onConnect])

  const waitForPeerConnectionResult = useCallback(async (targetPeerId: string, timeoutMs = 15000) => {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      if (connectedPeersRef.current.includes(targetPeerId)) {
        return "connected" as const
      }
      await new Promise((r) => setTimeout(r, 200))
    }
    return "timeout" as const
  }, [])

  const confirmReconnect = useCallback(async () => {
    setIsAutoConnecting(true)
    setShowReconnectPrompt(false)

    setReconnectionProgress({
      current: 0,
      total: pendingReconnectPeers.length,
      status: "Starting reconnection...",
    })

    const peersToConnect = pendingReconnectPeers.filter((peer) => !connectedPeersRef.current.includes(peer.peerId))

    if (peersToConnect.length === 0) {
      setReconnectionProgress(null)
      setIsAutoConnecting(false)
      showToast({ title: "Already connected to all peers" })
      return
    }

    let successCount = 0
    let failCount = 0

    const BATCH_SIZE = 3
    for (let i = 0; i < peersToConnect.length; i += BATCH_SIZE) {
      const batch = peersToConnect.slice(i, i + BATCH_SIZE)

      const batchPromises = batch.map(async (peer) => {
        setReconnectionProgress({
          current: i + batch.indexOf(peer) + 1,
          total: peersToConnect.length,
          status: `Connecting to ${peer.peerId}${peer.displayName ? ` (${peer.displayName})` : ""}...`,
        })

        try {
          if (onConnectToPeer) {
            onConnectToPeer(peer.peerId)
          } else {
            onConnectKeyChange(peer.peerId)
            await new Promise((r) => setTimeout(r, 50))
            await Promise.resolve(onConnect())
          }

          const result = await waitForPeerConnectionResult(peer.peerId, 8000)

          if (result === "connected") {
            successCount++
            return { success: true, peerId: peer.peerId }
          } else {
            failCount++
            return { success: false, peerId: peer.peerId }
          }
        } catch (error) {
          failCount++
          return { success: false, peerId: peer.peerId }
        }
      })

      await Promise.allSettled(batchPromises)

      if (i + BATCH_SIZE < peersToConnect.length) {
        await new Promise((r) => setTimeout(r, 300))
      }
    }

    setReconnectionProgress({
      current: peersToConnect.length,
      total: peersToConnect.length,
      status: `Reconnection complete: ${successCount} succeeded, ${failCount} failed`,
    })

    if (successCount > 0) {
      showToast({
        title: `Reconnected to ${successCount} peer${successCount !== 1 ? "s" : ""}`,
        description: failCount > 0 ? `Failed to connect to ${failCount} peer${failCount !== 1 ? "s" : ""}` : undefined,
      })
    } else {
      showToast({
        title: "Reconnection failed",
        description: "Could not reconnect to any peers",
        variant: "destructive",
      })
    }

    setTimeout(() => {
      setReconnectionProgress(null)
    }, 3000)

    setIsAutoConnecting(false)

    try {
      await connectedPeersDB.clearRefreshFlag()
      if (typeof window !== "undefined") {
        localStorage.removeItem("nw_refresh_flag")
      }
    } catch {}
  }, [pendingReconnectPeers, onConnectKeyChange, onConnect, waitForPeerConnectionResult, onConnectToPeer])

  const cancelReconnect = useCallback(async () => {
    try {
      await connectedPeersDB.clearAll()
      await connectedPeersDB.clearRefreshFlag()
      if (typeof window !== "undefined") {
        localStorage.removeItem("nw_refresh_flag")
      }
    } catch {}
    setPendingReconnectPeers([])
    hasShownReconnectPrompt.current = true
    setShowReconnectPrompt(false)
  }, [])

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
      case "ready":
        return <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
      case "connecting":
      case "initializing":
        return (
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )
      case "error":
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
      default:
        return <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
    }
  }

  return (
    <TooltipProvider>
      <AlertDialog open={showReconnectPrompt} onOpenChange={setShowReconnectPrompt}>
        <AlertDialogContent className="bg-card text-foreground border z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-none sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-pretty text-base sm:text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Reconnect to peers?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm sm:text-base">
              We detected {pendingReconnectPeers.length} peer{pendingReconnectPeers.length !== 1 ? "s" : ""} from your
              last session. Would you like to reconnect?
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
                {pendingReconnectPeers.map((peer) => (
                  <div
                    key={peer.peerId}
                    className="flex items-center gap-2 text-xs font-mono bg-background/50 p-2 rounded border"
                  >
                    <Users className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="font-bold text-primary">{peer.peerId}</span>
                    {peer.displayName && <span className="text-muted-foreground">({peer.displayName})</span>}
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel onClick={cancelReconnect} className="bg-background text-foreground w-full sm:w-auto">
              No, stay disconnected
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReconnect}
              className="bg-primary text-primary-foreground w-full sm:w-auto"
            >
              Yes, reconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {reconnectionProgress && (
        <div className="fixed bottom-4 right-4 z-50 bg-card border rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">
                Reconnecting... ({reconnectionProgress.current}/{reconnectionProgress.total})
              </div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{reconnectionProgress.status}</div>
              <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(reconnectionProgress.current / reconnectionProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-card/50 backdrop-blur-sm border">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="hidden sm:inline">Connection Hub</span>
            <span className="sm:hidden">Connect</span>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              P2P
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            {getStatusIcon()}
            <span className="truncate">
              {connectionStatus === "connected"
                ? `${connectedPeers.length} peer${connectedPeers.length !== 1 ? "s" : ""}`
                : connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "ready"
                    ? "Ready"
                    : connectionStatus === "initializing"
                      ? "Initializing..."
                      : connectionStatus === "error"
                        ? "Error"
                        : "Ready"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          {error && (
            <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80 break-words">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Your Connection Key</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share this ID with others to start file sharing</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {peerId ? (
              <div className="p-3 rounded-lg border bg-primary/5 text-center space-y-2">
                <code className="text-lg sm:text-xl font-mono font-bold text-primary tracking-widest block">
                  {peerId}
                </code>
                {displayName && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{displayName}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground sm:hidden">Share this ID to start sharing</div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border bg-muted/30 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {connectionStatus === "initializing" ? "Reinitializing..." : "Generating..."}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCopyKey}
                disabled={!peerId}
                className={`flex-1 h-9 text-sm ${copyFeedback ? "bg-green-500 hover:bg-green-600" : ""}`}
              >
                {copyFeedback ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Copied!</span>
                    <span className="sm:hidden">✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Copy Key</span>
                    <span className="sm:hidden">Copy</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onRegenerateKey}
                disabled={connectedPeers.length > 0}
                className="px-3 h-9"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Connect to Peer</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter a 6-character key to connect. Auto-connects when 6 characters are entered.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="6-char key"
                value={connectKey}
                onChange={(e) => {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 6)
                  onConnectKeyChange(value)
                }}
                className="font-mono text-center tracking-widest text-sm h-9 flex-1"
                maxLength={6}
                style={{
                  borderColor: connectKey.length === 6 ? "#10b981" : undefined,
                  boxShadow: connectKey.length === 6 ? "0 0 0 1px #10b981" : undefined,
                }}
              />
              <Button
                onClick={handleConnect}
                disabled={
                  !connectKey.trim() ||
                  connectionStatus === "connecting" ||
                  connectionStatus === "initializing" ||
                  isAutoConnecting
                }
                className="px-4 h-9 text-sm"
              >
                {connectionStatus === "connecting" || connectionStatus === "initializing" || isAutoConnecting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Connect</span>
                    <span className="sm:hidden">Go</span>
                  </>
                )}
              </Button>
            </div>

            {connectKey.length === 6 && !isConnected && (
              <div className="text-xs text-green-600 text-center animate-pulse">Auto-connecting in a moment...</div>
            )}
          </div>

          {connectedPeers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Connected ({connectedPeers.length})</span>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {connectedPeers.map((peer) => {
                  const info = peerInfo.get(peer)
                  return (
                    <div
                      key={peer}
                      className="flex items-center justify-between p-2 bg-background/50 rounded-lg border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <code className="font-mono font-bold text-primary text-sm truncate">{peer}</code>
                        {info?.displayName && (
                          <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                            ({info.displayName})
                          </span>
                        )}
                      </div>
                      <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default ConnectionHub
