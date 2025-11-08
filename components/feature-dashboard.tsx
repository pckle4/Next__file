"use client"
import { ModernTabs } from "./modern-tabs"
import ChatPanel from "./chat-panel"
import LiveAnalytics from "./live-analytics"
import { PeerPanel } from "./peer-panel"
import ExpandableStorageAnalyzer from "./expandable-storage-analyzer"
import { ReceivedFilesPanel } from "./received-files-panel"
import { MessageCircle, BarChart3, History, Users, HardDrive } from "lucide-react"
import type { ChatMessage } from "../types/chat-message"
import type { PeerInfo, LiveAnalytics as LiveAnalyticsType } from "../hooks/use-peer-connection"

interface FeatureDashboardProps {
  // Chat props
  chatMessages: ChatMessage[]
  connectedPeers: string[]
  peerInfo: Map<string, PeerInfo>
  onSendMessage: (message: string) => void
  isConnected: boolean
  currentUserId: string | null

  // Analytics props
  analytics: LiveAnalyticsType
  peerId: string | null

  // Peer panel props
  displayName: string
  onSendFile: (file: File, targetPeerId: string) => Promise<void>
  onDisconnectPeer: (peerId: string) => void

  // File history count for badge
  fileHistoryCount: number
}

export function FeatureDashboard({
  chatMessages,
  connectedPeers,
  peerInfo,
  onSendMessage,
  isConnected,
  currentUserId,
  analytics,
  peerId,
  displayName,
  onSendFile,
  onDisconnectPeer,
  fileHistoryCount,
}: FeatureDashboardProps) {
  const tabs = [
    {
      id: "history",
      label: "File History",
      icon: <History className="h-4 w-4 text-[hsl(var(--chart-3))]" />,
      badge: fileHistoryCount,
      tooltip: "Browse, search, and manage your received files.",
      content: (
        <div className="min-h-[300px]">
          <ReceivedFilesPanel />
        </div>
      ),
    },
    {
      id: "chat",
      label: "Chat",
      icon: <MessageCircle className="h-4 w-4 text-[hsl(var(--accent))]" />,
      badge: chatMessages.length,
      tooltip: "Send messages to connected peers.",
      content: (
        <div className="min-h-[300px]">
          <ChatPanel
            messages={chatMessages}
            connectedPeers={connectedPeers}
            peerInfo={peerInfo}
            onSendMessage={onSendMessage}
            isConnected={isConnected}
            currentUserId={currentUserId}
          />
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Live Analytics",
      icon: <BarChart3 className="h-4 w-4 text-[hsl(var(--chart-5))]" />,
      tooltip: "Real-time metrics like RTT, bitrate, and loss.",
      content: (
        <div className="min-h-[300px]">
          <LiveAnalytics analytics={analytics} isConnected={isConnected} peerId={peerId} />
        </div>
      ),
    },
    {
      id: "peers",
      label: "Peer Management",
      icon: <Users className="h-4 w-4 text-[hsl(var(--chart-2))]" />,
      badge: connectedPeers.length,
      tooltip: "Manage peers, send files, and adjust policies.",
      content: (
        <div className="min-h-[300px] space-y-6">
          <PeerPanel
            connectedPeers={connectedPeers}
            peerInfo={peerInfo}
            isConnected={isConnected}
            onSendFile={onSendFile}
            onDisconnectPeer={onDisconnectPeer}
            displayName={displayName}
          />
        </div>
      ),
    },
    {
      id: "storage",
      label: "Storage Analyzer",
      icon: <HardDrive className="h-4 w-4 text-[hsl(var(--chart-4))]" />,
      tooltip: "See storage use, large files, and cleanup hints.",
      content: (
        <div className="min-h-[300px]">
          <ExpandableStorageAnalyzer />
        </div>
      ),
    },
  ]

  return (
    <div className="w-full animate-slide-up">
      <ModernTabs tabs={tabs} defaultTab="history" className="shadow-lg" />
    </div>
  )
}
