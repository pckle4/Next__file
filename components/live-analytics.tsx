"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Activity, Globe, ArrowUp, ArrowDown, Clock, Zap, Database, Signal } from "lucide-react"
import type { LiveAnalytics as LiveAnalyticsType } from "@/hooks/use-peer-connection"
import { memo } from "react"
import { formatCompactTimestamp } from "@/utils/ist-time"

interface LiveAnalyticsProps {
  analytics: LiveAnalyticsType
  isConnected: boolean
  peerId: string | null
}

const LiveAnalytics = memo(function LiveAnalytics({ analytics, isConnected, peerId }: LiveAnalyticsProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return "0 B/s"
    const k = 1024
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"]
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
    return Number.parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const isReallyConnected = isConnected && (analytics?.connectedPeersCount ?? 0) > 0

  const getStatusColor = () => {
    if (!peerId) return "bg-gray-500"
    if (isReallyConnected) return "bg-green-500"
    return "bg-yellow-500"
  }

  const getStatusText = () => {
    if (!peerId) return "Initializing"
    if (isReallyConnected) return "Connected"
    return "Ready"
  }

  const totalSentBytes = analytics.totalDataSent || 0
  const totalReceivedBytes = analytics.totalDataReceived || 0
  const totalDataTransferred = totalSentBytes + totalReceivedBytes
  const currentSendSpeed = analytics.currentSendSpeed || 0
  const currentReceiveSpeed = analytics.currentReceiveSpeed || 0
  const avgSendSpeed = analytics.averageSendSpeed || 0
  const avgReceiveSpeed = analytics.averageReceiveSpeed || 0

  const formattedTotalData = formatBytes(totalDataTransferred)
  const formattedSentData = formatBytes(totalSentBytes)
  const formattedReceivedData = formatBytes(totalReceivedBytes)
  const statusColor = getStatusColor()
  const statusText = getStatusText()
  const recentConnections = analytics.connectionHistory
    .sort((a, b) => b.connectedAt.getTime() - a.connectedAt.getTime())
    .slice(0, 5)
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <Card className="glass-card hover-glow border-0 shadow-xl relative overflow-hidden animate-scale-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-16 -left-16 w-32 h-32 bg-accent/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <span>Live Analytics</span>
            <div className="text-sm text-muted-foreground font-normal">Real-time network stats</div>
          </div>
          <Badge
            className={`glass-effect border-0 ${
              isReallyConnected ? "text-green-600 bg-green-500/10" : "text-yellow-600 bg-yellow-500/10"
            } animate-pulse`}
          >
            <div className={`w-2 h-2 rounded-full ${statusColor} mr-2 animate-pulse`} />
            {statusText}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last updated: {currentTime}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        <div className="glass-effect rounded-2xl p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Connected Peers</span>
          </div>
          <div className="text-3xl font-bold text-primary">{analytics.connectedPeersCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Active connections</div>
        </div>

        <div className="w-full h-px bg-border" />

        <div className="grid grid-cols-1 gap-4">
          <div className="glass-effect rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-green-500/10">
                <ArrowUp className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Sending Statistics</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">{analytics.totalFilesSent}</div>
                <div className="text-xs text-muted-foreground">Files sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formattedSentData}</div>
                <div className="text-xs text-muted-foreground">Data sent</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current speed:</span>
                <span className="font-bold text-green-600">{formatSpeed(currentSendSpeed)}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Average speed:</span>
                <span className="font-bold text-green-600">{formatSpeed(avgSendSpeed)}</span>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <ArrowDown className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Receiving Statistics</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{analytics.totalFilesReceived}</div>
                <div className="text-xs text-muted-foreground">Files received</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{formattedReceivedData}</div>
                <div className="text-xs text-muted-foreground">Data received</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current speed:</span>
                <span className="font-bold text-blue-600">{formatSpeed(currentReceiveSpeed)}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Average speed:</span>
                <span className="font-bold text-blue-600">{formatSpeed(avgReceiveSpeed)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-4 border border-border/30 hover-scale">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-accent/10">
              <Database className="h-4 w-4 text-accent" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Total Data Transferred</span>
          </div>
          <div className="text-2xl font-bold text-accent">{formattedTotalData}</div>
          <div className="text-xs text-muted-foreground mt-1">Cumulative bandwidth usage</div>
          <div className="mt-3 pt-3 border-t border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Sent:</span>
                <span className="text-xs font-bold text-green-600">{formattedSentData}</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">Received:</span>
                <span className="text-xs font-bold text-blue-600">{formattedReceivedData}</span>
              </div>
            </div>
          </div>
        </div>

        {recentConnections.length > 0 && (
          <>
            <div className="w-full h-px bg-border" />
            <div className="glass-effect rounded-2xl p-4 border border-border/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-muted-foreground">Recent Connections</span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {recentConnections.length} recent • Updated {formatCompactTimestamp()}
                  </div>
                </div>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {recentConnections.map((connection, index) => {
                  const now = new Date()
                  const diffInMinutes = Math.floor((now.getTime() - connection.connectedAt.getTime()) / (1000 * 60))
                  const isRecent = diffInMinutes < 5

                  return (
                    <div
                      key={`${connection.peerId}-${connection.connectedAt.getTime()}`}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 glass-effect p-3 rounded-xl border border-border/20 hover-scale transition-all duration-200 ${
                        isRecent ? "ring-1 ring-primary/20 bg-primary/5" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg flex-shrink-0 ${isRecent ? "bg-primary/20" : "bg-primary/10"}`}
                        >
                          <Activity className={`h-3 w-3 ${isRecent ? "text-primary animate-pulse" : "text-primary"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <code className="font-mono font-bold text-primary text-xs sm:text-sm truncate block">
                            {connection.peerId}
                          </code>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {connection.status === "connected" ? "Active connection" : "Disconnected"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div
                            className="text-xs text-muted-foreground/70 block"
                            title={connection.connectedAt.toLocaleString()}
                          >
                            {connection.connectedAt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </div>
                        </div>
                        <Badge
                          className={`glass-effect border-0 text-xs px-2 py-0.5 ${
                            connection.status === "connected"
                              ? "text-green-600 bg-green-500/10 animate-pulse"
                              : "text-red-600 bg-red-500/10"
                          }`}
                        >
                          {connection.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-border/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Auto-refreshing every 5 seconds</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
})

export default LiveAnalytics
