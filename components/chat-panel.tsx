"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, Users, FileText, ImageIcon, Video, Music, Archive, File, Clock, User } from "lucide-react"
import type { ChatMessage } from "../types/chat-message"
import type { PeerInfo } from "../hooks/use-peer-connection"

interface ChatPanelProps {
  messages: ChatMessage[]
  connectedPeers: string[]
  peerInfo: Map<string, PeerInfo>
  onSendMessage: (message: string) => void
  isConnected: boolean
  currentUserId: string | null
}

function ChatPanel({ messages, connectedPeers, peerInfo, onSendMessage, isConnected, currentUserId }: ChatPanelProps) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement?.parentElement
      if (container) {
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      // Only scroll if the last message is from the current user or if user was already at bottom
      if (lastMessage.isOwn) {
        scrollToBottom()
      }
    }
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSendMessage = () => {
    if (message.trim() && isConnected) {
      onSendMessage(message.trim())
      setMessage("")
      // auto-shrink after send
      if (inputRef.current) {
        inputRef.current.style.height = "auto"
      }
    }
  }

  const adjustHeight = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    const lineHeight = 20 // approx line height in px for text-sm
    const maxRows = 3
    const maxHeight = lineHeight * maxRows + 16 // padding allowance
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px"
  }

  useEffect(() => {
    adjustHeight()
  }, [message])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      ;(e.currentTarget as HTMLTextAreaElement).blur()
      return
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(timestamp)
  }

  const getPeerDisplayName = (peerId: string) => {
    const peer = peerInfo.get(peerId)
    return peer?.displayName || `User-${peerId.slice(0, 4)}`
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "svg":
        return <ImageIcon className="h-3 w-3 text-green-500" />
      case "mp4":
      case "avi":
      case "mov":
      case "mkv":
      case "webm":
        return <Video className="h-3 w-3 text-red-500" />
      case "mp3":
      case "wav":
      case "flac":
      case "aac":
        return <Music className="h-3 w-3 text-purple-500" />
      case "zip":
      case "rar":
      case "7z":
      case "tar":
        return <Archive className="h-3 w-3 text-orange-500" />
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
        return <FileText className="h-3 w-3 text-blue-500" />
      default:
        return <File className="h-3 w-3 text-gray-500" />
    }
  }

  if (!isConnected) {
    return (
      <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Chat</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />0
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Connect to peers to start chatting
          </div>
          <div className="p-2 border-t">
            <div className="flex gap-2">
              <Textarea placeholder="Connect to chat" disabled className="flex-1 h-6 text-sm" />
              <Button disabled size="sm" className="px-2 h-6">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Chat</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {connectedPeers.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 py-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-xs py-6">
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {!msg.isOwn && (
                      <div className="text-xs font-medium mb-1 opacity-70 flex items-center gap-1">
                        <User className="h-2 w-2" />
                        {getPeerDisplayName(msg.peerId)}
                      </div>
                    )}
                    <div className="text-sm break-words">{msg.message}</div>
                    <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                      <Clock className="h-2 w-2" />
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-1.5 border-t">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 resize-none text-sm leading-5 min-h-7 sm:min-h-8 lg:min-h-9 max-h-[56px]"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              size="sm"
              className="px-2 h-7 sm:h-8 lg:h-9"
              aria-label="Send message"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatPanel
