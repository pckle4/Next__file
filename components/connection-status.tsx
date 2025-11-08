"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, WifiOff, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  isConnected: boolean
  connectionStatus: "disconnected" | "connecting" | "connected" | "ready" | "error" | "initializing"
  connectedPeers: string[]
  onDisconnect: (peerId?: string) => void
}

export function ConnectionStatus({
  isConnected,
  connectionStatus,
  connectedPeers,
  onDisconnect,
}: ConnectionStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasPeers = connectedPeers.length > 0

  const getStatusColor = () => {
    if (hasPeers) {
      return "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
    }
    if (connectionStatus === "error") {
      return "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
    }
    if (connectionStatus === "initializing") {
      return "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
    }
    return "bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
  }

  const getStatusIcon = () => {
    const isReallyConnected = hasPeers

    return (
      <div className="relative">
        <div className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded-full", isReallyConnected ? "bg-green-500" : "bg-red-500")} />
        {isReallyConnected && (
          <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-ping opacity-75" />
        )}
      </div>
    )
  }

  const getStatusText = () => {
    if (hasPeers) {
      return `Connected to ${connectedPeers.length} peer${connectedPeers.length > 1 ? "s" : ""}`
    }
    if (connectionStatus === "connecting") {
      return "Establishing connection..."
    }
    if (connectionStatus === "disconnected") {
      return "Disconnected"
    }
    if (connectionStatus === "error") {
      return "Error connecting"
    }
    if (connectionStatus === "initializing") {
      return "Initializing..."
    }
    return "Ready"
  }

  const isActuallyConnected = hasPeers

  if (!hasPeers && connectionStatus !== "connected") {
    return null
  }

  return (
    <Card
      className={cn(
        "animate-slide-up border-2 transition-all duration-300 relative overflow-hidden backdrop-blur-sm w-full max-w-full mx-auto",
        "px-1 sm:px-0",
        getStatusColor(),
      )}
    >
      <div className="p-2 sm:p-3 md:p-4 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {getStatusIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {getStatusText()}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1">
                <Shield className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                <span className="truncate">P2P Encrypted</span>
                {isActuallyConnected && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    <span>Live</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {isActuallyConnected ? (
              <Badge
                variant="default"
                className="animate-scale-in font-medium text-xs relative overflow-hidden px-1.5 sm:px-2 transition-colors duration-300 bg-green-600 hover:bg-green-700 text-white"
              >
                <span className="hidden sm:inline">Connected</span>
                <span className="sm:hidden">On</span>
              </Badge>
            ) : connectionStatus === "connecting" ? (
              <Badge variant="outline" className="font-medium text-xs px-1.5 sm:px-2">
                Connecting
              </Badge>
            ) : connectionStatus === "error" ? (
              <Badge variant="outline" className="font-medium text-xs px-1.5 sm:px-2 bg-red-500 text-white">
                Error
              </Badge>
            ) : connectionStatus === "initializing" ? (
              <Badge variant="outline" className="font-medium text-xs px-1.5 sm:px-2 bg-yellow-500 text-white">
                Initializing
              </Badge>
            ) : (
              <Badge variant="outline" className="font-medium text-xs px-1.5 sm:px-2">
                Disconnected
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              type="button"
              className="hover:bg-white/20 dark:hover:bg-black/20 h-6 w-6 sm:h-8 sm:w-8 group"
            >
              <div className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <CardContent className="pt-0 pb-2 sm:pb-4 space-y-2 sm:space-y-4 relative z-10">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <h4 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">Connected Peers</h4>
              <Badge variant="outline" className="text-xs">
                {connectedPeers.length}
              </Badge>
            </div>
            <div className="grid gap-1 sm:gap-2">
              {connectedPeers.map((peer) => (
                <div
                  key={peer}
                  className="flex items-center justify-between p-2 sm:p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-primary/20 backdrop-blur-sm gap-2 hover:bg-white/70 dark:hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                      <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-ping opacity-75" />
                    </div>
                    <code className="font-mono font-bold text-primary text-xs sm:text-sm truncate flex-1 min-w-0">
                      {peer}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onDisconnect(peer)
                    }}
                    type="button"
                    className="hover:bg-red-500/20 dark:hover:bg-red-500/20 h-6 w-6 sm:h-8 sm:w-8 text-red-500 hover:text-red-600 flex-shrink-0 hover:scale-110 transition-all"
                    title="Disconnect from this peer"
                  >
                    <WifiOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
