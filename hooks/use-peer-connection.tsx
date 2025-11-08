"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Peer, { type DataConnection } from "peerjs"
import type { ChatMessage } from "../types/chat-message"
import { transferEngine } from "@/lib/transfer-engine"
import { sessionPersistence } from "@/lib/session-persistence"
import { fileStorage } from "@/lib/file-storage"
import { currentUserNameRef } from "@/utils/current-user-name"
import { useSimpleConnectionMonitor } from "./use-simple-connection-monitor"
import { receivedFilesStorage } from "@/lib/received-files-storage"
import { fileHistoryPersistence } from "@/lib/file-history-persistence"
import { connectedPeersDB } from "@/lib/connected-peers-db"
import { logFileShared, logFileReceived, logPeerConnected, logPeerDisconnected } from "@/utils/console-logger"
import { consoleLogWithIST } from "@/utils/ist-time" // this is a no-op to silence verbose logs

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export interface FileTransfer {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "pending" | "transferring" | "completed" | "error"
  data?: ArrayBuffer
  peerId: string
  lastDOMUpdate?: number
  chunksReceived?: number
  totalChunks?: number
  lastChunkTime?: number
  isStored?: boolean
}

export interface LiveAnalytics {
  totalFilesSent: number
  totalFilesReceived: number
  totalDataTransferred: number
  totalDataSent: number
  totalDataReceived: number
  currentSendSpeed: number
  currentReceiveSpeed: number
  averageSendSpeed: number
  averageReceiveSpeed: number
  peakSendSpeed: number
  peakReceiveSpeed: number
  connectionsEstablished: number
  sessionsCompleted: number
  totalTransferTime: number
  successfulTransfers: number
  failedTransfers: number
  connectedPeersCount: number
  connectionUptime: number
  lastActivity: Date | null
  connectionHistory: Array<{
    peerId: string
    connectedAt: Date
    disconnectedAt?: Date
    status: "connected" | "disconnected"
  }>
}

export interface PeerInfo {
  id: string
  displayName?: string
  connectedAt: Date
}

export interface PeerConnectionState {
  peer: Peer | null
  peerId: string | null
  isConnected: boolean
  connectionStatus: "disconnected" | "connecting" | "connected" | "ready" | "error" | "initializing"
  connectedPeers: string[]
  peerInfo: Map<string, PeerInfo> // Added peer info storage
  error: string | null
  incomingFiles: FileTransfer[]
  outgoingFiles: FileTransfer[]
  chunkSize: number
  autoDownload: boolean
  analytics: LiveAnalytics
  chatMessages: ChatMessage[] // Added chat messages storage
}

export function usePeerConnection() {
  const [state, setState] = useState<PeerConnectionState>({
    peer: null,
    peerId: null,
    isConnected: false,
    connectionStatus: "disconnected",
    connectedPeers: [],
    peerInfo: new Map(), // Initialize peer info map
    error: null,
    incomingFiles: [],
    outgoingFiles: [],
    chunkSize: 262144, // 256KB chunks for much faster transfer
    autoDownload: true,
    analytics: {
      totalFilesSent: 0,
      totalFilesReceived: 0,
      totalDataTransferred: 0,
      totalDataSent: 0,
      totalDataReceived: 0,
      currentSendSpeed: 0,
      currentReceiveSpeed: 0,
      averageSendSpeed: 0,
      averageReceiveSpeed: 0,
      peakSendSpeed: 0,
      peakReceiveSpeed: 0,
      connectionsEstablished: 0,
      sessionsCompleted: 0,
      totalTransferTime: 0,
      successfulTransfers: 0,
      failedTransfers: 0,
      connectedPeersCount: 0,
      connectionUptime: 0,
      lastActivity: null,
      connectionHistory: [],
    },
    chatMessages: [], // Initialize chat messages array
  })

  const connectionsRef = useRef<Map<string, DataConnection>>(new Map())
  const fileTransfersRef = useRef<Map<string, FileTransfer>>(new Map())
  const peerRef = useRef<Peer | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const usedIdsRef = useRef<Set<string>>(new Set())
  const connectionStartTimeRef = useRef<Date | null>(null)
  const analyticsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const analyticsUpdateBatchRef = useRef<Partial<LiveAnalytics>>({})
  const analyticsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const transferStatsRef = useRef<Map<string, { bytesTransferred: number; lastUpdate: number }>>(new Map())
  const speedTrackingRef = useRef<{
    sendStartTime: number
    receiveStartTime: number
    sendBytes: number
    receiveBytes: number
    sendSpeeds: number[]
    receiveSpeeds: number[]
  }>({
    sendStartTime: 0,
    receiveStartTime: 0,
    sendBytes: 0,
    receiveBytes: 0,
    sendSpeeds: [],
    receiveSpeeds: [],
  })

  const chunkAckRef = useRef<Map<string, Set<number>>>(new Map())
  const pendingChunksRef = useRef<Map<string, number>>(new Map())

  const isVisibleRef = useRef(true)
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionKeepAliveRef = useRef<NodeJS.Timeout | null>(null)
  const backgroundModeRef = useRef(false)

  const lastSeenRef = useRef<Map<string, number>>(new Map())
  const livenessIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const connectionLockRef = useRef<Map<string, boolean>>(new Map())
  const cleanupLockRef = useRef<boolean>(false)

  const lastConnectedPeerRef = useRef<string | null>(null)
  const sessionDataRef = useRef<any>(null)

  const announcedDisconnectReasonRef = useRef<Map<string, string>>(new Map())
  const manualDisconnectPeersRef = useRef<Set<string>>(new Set())

  const isUnloadingRef = useRef<boolean>(false)

  // Initialize stable clientId once per browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("nw_client_id")
      if (!id) {
        id = self.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
        localStorage.setItem("nw_client_id", id)
      }
      ;(window as any).__nwClientId = id
    }
  }, [])

  const tryPeerReconnect = useCallback(() => {
    const peer = peerRef.current
    if (!peer) return
    if (peer.disconnected) {
      try {
        peer.reconnect()
      } catch {}
      reconnectAttemptsRef.current += 1
      const base = Math.min(30000, 1000 * Math.pow(2, reconnectAttemptsRef.current))
      const jitter = Math.floor(base * (0.2 + Math.random() * 0.3)) // +20–50% jitter
      const delay = Math.min(30000, base + jitter)
      // </CHANGE> clear any pending reconnect timeout before setting a new one to avoid overlaps
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (reconnectAttemptsRef.current < 6) {
        reconnectTimeoutRef.current = setTimeout(tryPeerReconnect, delay)
      }
    } else {
      reconnectAttemptsRef.current = 0
    }
  }, [])
  // </CHANGE>

  const setCurrentUserName = useCallback((name: string) => {
    currentUserNameRef.current = name
  }, [])

  const getErrorMessage = useCallback((error: any): string => {
    if (error.type === "peer-unavailable") {
      return "Peer not found. The connection key may be incorrect or the peer is offline."
    } else if (error.type === "network") {
      return "Network connection lost. Check your internet connection and try again."
    } else if (error.type === "server-error") {
      return "Server connection failed. The PeerJS server may be temporarily unavailable."
    } else if (error.type === "socket-error") {
      return "Connection socket error. Please refresh the page and try again."
    } else if (error.type === "socket-closed") {
      return "Connection closed unexpectedly. Attempting to reconnect..."
    } else if (error.type === "unavailable-id") {
      return "Connection ID is already in use. Generating a new ID..."
    } else if (error.type === "ssl-unavailable") {
      return "Secure connection unavailable. Please ensure you're using HTTPS."
    } else if (error.type === "disconnected") {
      return "Disconnected from signaling server. Attempting to reconnect..."
    } else if (error.type === "invalid-id") {
      return "Invalid connection ID format. Please check the connection key."
    } else if (error.type === "invalid-key") {
      return "Invalid API key or configuration error."
    } else if (error.message?.includes("self")) {
      return "Cannot connect to yourself! Please use a different connection key."
    } else if (error.message?.includes("timeout")) {
      return "Connection timed out. The peer may be offline or unreachable."
    } else if (error.message?.includes("already connected")) {
      return "Already connected to this peer."
    }
    return error.message || "An unknown connection error occurred."
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      const wasVisible = isVisibleRef.current
      isVisibleRef.current = isVisible

      consoleLogWithIST("Page visibility changed", {
        isVisible,
        wasVisible,
        connectedPeers: connectionsRef.current.size,
        timestamp: new Date().toISOString(),
      })

      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }

      if (connectionKeepAliveRef.current) {
        clearInterval(connectionKeepAliveRef.current)
      }

      if (!isVisible) {
        // Tab is hidden - enter background mode
        backgroundModeRef.current = true

        // Send keep-alive messages more frequently to maintain connections
        connectionKeepAliveRef.current = setInterval(() => {
          connectionsRef.current.forEach((conn, peerId) => {
            if (conn && conn.open) {
              try {
                conn.send({
                  type: "keep-alive",
                  timestamp: Date.now(),
                  backgroundMode: true,
                  peerDistanceMode: true, // Added peer distance mode flag
                })
              } catch (error) {
                consoleLogWithIST("Keep-alive failed", {
                  peerId,
                  error: error instanceof Error ? error.message : String(error),
                })
              }
            }
          })
        }, 5000) // Increased from 2s to 5s for peer stability

        // Set a timeout to detect if we've been backgrounded too long
        visibilityTimeoutRef.current = setTimeout(() => {
          consoleLogWithIST("Tab backgrounded for extended period", {
            duration: 60000,
            maintainingConnections: true,
          })
        }, 60000)
      } else {
        // Tab is visible - exit background mode
        backgroundModeRef.current = false

        // Resume normal operation and check connection health
        connectionsRef.current.forEach((conn, peerId) => {
          if (conn && conn.open) {
            try {
              conn.send({
                type: "resume-active",
                timestamp: Date.now(),
                backgroundMode: false,
              })
              consoleLogWithIST("Sent resume-active signal", { peerId })
            } catch (error) {
              consoleLogWithIST("Resume signal failed", {
                peerId,
                error: error instanceof Error ? error.message : String(error),
              })
            }
          }
        })

        // Process any pending file transfers that may have been paused
        fileTransfersRef.current.forEach((transfer, id) => {
          if (transfer.status === "transferring") {
            setState((prev) => ({
              ...prev,
              incomingFiles: prev.incomingFiles.map((f) => (f.id === id ? { ...transfer } : f)),
            }))
          }
        })
      }
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from cache (back/forward navigation)
        consoleLogWithIST("Page restored from cache", {
          persisted: event.persisted,
          connectedPeers: connectionsRef.current.size,
        })

        // Check connection health after cache restoration
        setTimeout(() => {
          connectionsRef.current.forEach((conn, peerId) => {
            if (conn && conn.open) {
              try {
                conn.send({
                  type: "connection-check",
                  timestamp: Date.now(),
                  restored: true,
                })
              } catch (error) {
                consoleLogWithIST("Connection check failed after restore", {
                  peerId,
                  error: error instanceof Error ? error.message : String(error),
                })
              }
            }
          })
        }, 1000)
      }
    }

    const handlePageHide = (event: PageTransitionEvent) => {
      consoleLogWithIST("Page being hidden", {
        persisted: event.persisted,
        connectedPeers: connectionsRef.current.size,
      })

      try {
        // Only mark as a true unload/refresh if not persisted (not BFCache restore)
        if (!event.persisted) {
          isUnloadingRef.current = true

          const clientId =
            (typeof window !== "undefined" && (window as any).__nwClientId) ||
            (typeof window !== "undefined" && localStorage.getItem("nw_client_id")) ||
            "unknown"

          // On mobile, use pagehide to set the refresh flag so the reconnect dialog can show after reload
          connectedPeersDB
            .setRefreshFlag({
              clientId,
              hasRefreshed: true,
              timestamp: Date.now(),
            })
            .catch(() => {
              // silent fail
            })

          try {
            if (typeof window !== "undefined") {
              const payload = JSON.stringify({ clientId, timestamp: Date.now() })
              localStorage.setItem("nw_refresh_flag", payload)
            }
          } catch {
            // no-op
          }
        }
      } catch {
        // no-op
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("pageshow", handlePageShow)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("pageshow", handlePageShow)
      window.removeEventListener("pagehide", handlePageHide)

      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
      if (connectionKeepAliveRef.current) {
        clearInterval(connectionKeepAliveRef.current)
      }
    }
  }, [state.peerId]) // Add state.peerId as dependency

  const generateUniqueId = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    const timestamp = Date.now().toString(36).slice(-2).toUpperCase()

    result = timestamp

    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    if (usedIdsRef.current.has(result)) {
      return generateUniqueId()
    }

    usedIdsRef.current.add(result)
    return result
  }, [])

  const calculateSpeed = useCallback((bytes: number, timeMs: number): number => {
    if (timeMs <= 0) return 0
    return (bytes * 1000) / timeMs // bytes per second
  }, [])

  const updateSpeedMetrics = useCallback(
    (type: "send" | "receive", bytes: number) => {
      const now = Date.now()
      const tracking = speedTrackingRef.current

      if (type === "send") {
        if (tracking.sendStartTime === 0) {
          tracking.sendStartTime = now
          tracking.sendBytes = 0
          tracking.sendSpeeds.push(bytes * 8) // Estimate initial speed
        }
        tracking.sendBytes += bytes

        const elapsed = now - tracking.sendStartTime
        if (elapsed > 500) {
          // Calculate speed every 500ms for more responsive updates
          const speed = calculateSpeed(tracking.sendBytes, elapsed)
          tracking.sendSpeeds.push(speed)
          if (tracking.sendSpeeds.length > 20) tracking.sendSpeeds.shift() // Keep more readings for smoother average

          tracking.sendStartTime = now
          tracking.sendBytes = 0
        }
      } else {
        if (tracking.receiveStartTime === 0) {
          tracking.receiveStartTime = now
          tracking.receiveBytes = 0
          tracking.receiveSpeeds.push(bytes * 8) // Estimate initial speed
        }
        tracking.receiveBytes += bytes

        const elapsed = now - tracking.receiveStartTime
        if (elapsed > 500) {
          // Calculate speed every 500ms for more responsive updates
          const speed = calculateSpeed(tracking.receiveBytes, elapsed)
          tracking.receiveSpeeds.push(speed)
          if (tracking.receiveSpeeds.length > 20) tracking.receiveSpeeds.shift() // Keep more readings for smoother average

          tracking.receiveStartTime = now
          tracking.receiveBytes = 0
        }
      }
    },
    [calculateSpeed],
  )

  const getAverageSpeed = useCallback((speeds: number[]): number => {
    if (speeds.length === 0) return 0
    return speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
  }, [])

  const getCurrentSpeed = useCallback((speeds: number[]): number => {
    return speeds.length > 0 ? speeds[speeds.length - 1] : 0
  }, [])

  const updateAnalytics = useCallback(
    (updates: Partial<LiveAnalytics>) => {
      Object.assign(analyticsUpdateBatchRef.current, updates)

      if (analyticsUpdateTimeoutRef.current) {
        clearTimeout(analyticsUpdateTimeoutRef.current)
      }

      analyticsUpdateTimeoutRef.current = setTimeout(() => {
        const batchedUpdates = { ...analyticsUpdateBatchRef.current }
        analyticsUpdateBatchRef.current = {}

        const tracking = speedTrackingRef.current
        const currentSendSpeed = getCurrentSpeed(tracking.sendSpeeds)
        const currentReceiveSpeed = getCurrentSpeed(tracking.receiveSpeeds)
        const averageSendSpeed = getAverageSpeed(tracking.sendSpeeds)
        const averageReceiveSpeed = getAverageSpeed(tracking.receiveSpeeds)

        setState((prev) => ({
          ...prev,
          analytics: {
            ...prev.analytics,
            ...batchedUpdates,
            currentSendSpeed,
            currentReceiveSpeed,
            averageSendSpeed,
            averageReceiveSpeed,
            lastActivity: new Date(),
          },
        }))
      }, 50)
    },
    [getCurrentSpeed, getAverageSpeed],
  )

  const saveSessionData = useCallback(() => {
    console.log("[nw] Saving comprehensive session data", {
      peerId: state.peerId,
      connectedPeers: state.connectedPeers,
      chatMessagesCount: state.chatMessages.length,
      lastConnectedPeer: lastConnectedPeerRef.current,
      peerInfoSize: state.peerInfo.size,
    })

    if (state.peerId && currentUserNameRef.current) {
      try {
        sessionPersistence.updateSessionWithConnectionData({
          lastConnectedPeerId: lastConnectedPeerRef.current || undefined,
          chatMessages: state.chatMessages,
          analytics: state.analytics,
          peerInfo: state.peerInfo,
          connectionHistory: state.connectedPeers,
        })
        console.log("[nw] Session data saved successfully")
      } catch (error) {
        console.error("[nw] Failed to save session data", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }
  }, [state.peerId, state.connectedPeers, state.chatMessages, state.analytics, state.peerInfo])

  const initializePeer = useCallback(
    async (storedId?: string) => {
      setState((prev) => ({ ...prev, connectionStatus: "initializing" }))
      try {
        let peerId: string

        const sessionData = sessionPersistence.loadSession()

        console.log("[nw] Peer initialization context", {
          storedId,
          sessionExists: !!sessionData,
          sessionId: sessionData?.id,
        })

        if (storedId && !usedIdsRef.current.has(storedId)) {
          peerId = storedId
          console.log("[nw] Using provided peer ID:", storedId)
        } else {
          peerId = generateUniqueId()
          console.log("[nw] Generated new peer ID:", peerId)
        }

        usedIdsRef.current.add(peerId)

        const iceServers = [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
          { urls: "stun:stun.cloudflare.com:3478" },
          { urls: "stun:stun.stunprotocol.org:3478" },
        ]

        const peer = new Peer(peerId, {
          host: "0.peerjs.com",
          port: 443,
          path: "/",
          secure: true,
          config: { iceServers },
          debug: 0,
        })

        peer.on("open", (id) => {
          console.log("[nw] Peer connected with ID:", id)
          consoleLogWithIST("Peer connection opened", {
            peerId: id,
          })
          logPeerConnected(id)
          setState((prev) => ({
            ...prev,
            peer,
            peerId: id,
            connectionStatus: "ready",
            error: null,
          }))

          try {
            const existingSession = sessionPersistence.loadSession()
            if (existingSession && existingSession.id !== id) {
              sessionPersistence.updateSession(id, existingSession.name, existingSession.maxFilesPerTransfer)
              console.log("[nw] SessionPersistence: Synchronized session id with connected peer id", {
                oldId: existingSession.id,
                newId: id,
              })
            }
          } catch (e) {
            console.error("[nw] Failed to synchronize session id with peer id", {
              error: e instanceof Error ? e.message : "Unknown error",
            })
          }

          reconnectAttemptsRef.current = 0
        })

        peer.on("connection", (conn) => {
          console.log("[nw] Incoming peer connection from:", conn.peer)
          consoleLogWithIST("Incoming connection", {
            from: conn.peer,
          })
          setupConnection(conn)
        })

        peer.on("error", (err) => {
          console.error("[nw] usePeerConnection: Peer error", {
            error: err.message,
            type: err.type,
          })

          if (err.type === "unavailable-id") {
            console.log("[nw] ID unavailable, generating new one and retrying")

            if (peerRef.current) {
              peerRef.current.destroy()
              peerRef.current = null
            }

            usedIdsRef.current.delete(peerId)
            const newId = generateUniqueId()

            setState((prev) => ({
              ...prev,
              peerId: newId,
              connectionStatus: "connecting",
              error: null,
            }))

            setTimeout(() => {
              initializePeer(newId)
            }, 1000)

            return
          } else {
            setState((prev) => ({
              ...prev,
              error: `Connection error: ${err.message}`,
              connectionStatus: "error",
            }))
          }
        })

        peer.on("disconnected", () => {
          console.log("[nw] Peer disconnected")
          consoleLogWithIST("Peer disconnected")
          logPeerDisconnected(state.peerId || "unknown")
          setState((prev) => ({
            ...prev,
            connectionStatus: "disconnected",
          }))
          tryPeerReconnect()
        })

        peerRef.current = peer
      } catch (error) {
        console.error("[nw] usePeerConnection: Failed to initialize peer", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
        setState((prev) => ({
          ...prev,
          error: "Failed to initialize peer connection",
          connectionStatus: "error",
        }))
      }
    },
    [generateUniqueId, state.peerId], // Added state.peerId dependency
  )

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (analyticsIntervalRef.current) {
        clearInterval(analyticsIntervalRef.current)
      }
      if (analyticsUpdateTimeoutRef.current) {
        clearTimeout(analyticsUpdateTimeoutRef.current)
      }
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
      if (connectionKeepAliveRef.current) {
        clearInterval(connectionKeepAliveRef.current)
      }
      if (peerRef.current) {
        peerRef.current.destroy()
        peerRef.current = null
      }
      transferStatsRef.current.clear()
    }
  }, [])

  // Moved the beforeunload logic to the handlePageHide effect
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        isUnloadingRef.current = true

        const clientId =
          (typeof window !== "undefined" && (window as any).__nwClientId) ||
          (typeof window !== "undefined" && localStorage.getItem("nw_client_id")) ||
          "unknown"

        // Write the refresh flag for THIS client only
        connectedPeersDB
          .setRefreshFlag({
            clientId,
            hasRefreshed: true,
            timestamp: Date.now(),
          })
          .catch(() => {
            // silent fail on unload
          })

        try {
          if (typeof window !== "undefined") {
            const payload = JSON.stringify({ clientId, timestamp: Date.now() })
            localStorage.setItem("nw_refresh_flag", payload)
          }
        } catch {
          // no-op
        }

        if (peerRef.current) {
          peerRef.current.destroy()
        }
      } catch {
        // no-op
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  const initializeWithStoredId = useCallback(
    (storedId: string) => {
      consoleLogWithIST("Initializing with stored ID", {
        storedId,
        currentPeerId: state.peerId,
      })

      if (peerRef.current) {
        consoleLogWithIST("Destroying existing peer connection")
        peerRef.current.destroy()
        peerRef.current = null
      }

      connectionStartTimeRef.current = null
      if (analyticsIntervalRef.current) {
        clearInterval(analyticsIntervalRef.current)
      }

      setState((prev) => ({
        ...prev,
        peer: null,
        peerId: null,
        connectionStatus: "disconnected",
        error: null,
      }))

      initializePeer(storedId)
    },
    [initializePeer, state.peerId], // Added state.peerId dependency
  )

  const simpleConnectionMonitor = useSimpleConnectionMonitor(connectionsRef.current)

  const cleanupPeerConnection = useCallback(async (peerId: string) => {
    if (connectionLockRef.current.get(peerId)) {
      console.log(`[nw] Cleanup already in progress for peer: ${peerId}`)
      return
    }

    connectionLockRef.current.set(peerId, true)
    console.log(`[nw] Starting atomic cleanup for peer: ${peerId}`)

    try {
      // Remove from connections map first
      const conn = connectionsRef.current.get(peerId)
      connectionsRef.current.delete(peerId)

      // Clean up stored files with proper error handling and timeout
      try {
        const cleanupPromise = fileStorage.deleteFilesByPeer(peerId)
        await Promise.race([
          cleanupPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Cleanup timeout")), 5000)),
        ])
        console.log(`[nw] Successfully cleaned up files for peer: ${peerId}`)
      } catch (error) {
        console.error(`[nw] Failed to clean up files for disconnected peer ${peerId}:`, error)
      }

      // Clean up liveness tracking
      lastSeenRef.current.delete(peerId)

      // Update state atomically
      setState((prev) => {
        const newPeerInfo = new Map(prev.peerInfo)
        newPeerInfo.delete(peerId)

        const remainingPeers = prev.connectedPeers.filter((id) => id !== peerId)
        const disconnectionTime = new Date()

        const updatedConnectionHistory = prev.analytics.connectionHistory.map((connection) =>
          connection.peerId === peerId && connection.status === "connected"
            ? { ...connection, status: "disconnected" as const, disconnectedAt: disconnectionTime }
            : connection,
        )

        return {
          ...prev,
          connectedPeers: remainingPeers,
          peerInfo: newPeerInfo,
          isConnected: remainingPeers.length > 0,
          connectionStatus: remainingPeers.length > 0 ? "connected" : "ready",
          analytics: {
            ...prev.analytics,
            connectedPeersCount: Math.max(0, prev.analytics.connectedPeersCount - 1),
            connectionHistory: updatedConnectionHistory,
          },
        }
      })

      console.log(`[nw] Atomic cleanup completed for peer: ${peerId}`)
    } finally {
      connectionLockRef.current.delete(peerId)
    }
  }, [])

  const setupConnection = useCallback(
    (conn: DataConnection) => {
      if (connectionsRef.current.has(conn.peer)) {
        consoleLogWithIST("Connection already exists, closing duplicate", {
          peerId: conn.peer,
        })
        conn.close()
        return
      }

      consoleLogWithIST("Setting up new connection", {
        peerId: conn.peer,
      })

      connectionsRef.current.set(conn.peer, conn)
      transferEngine.setConnection(conn)

      conn.on("open", async () => {
        const connectionTime = new Date()
        console.log("[nw] Peer connection established with:", conn.peer)
        consoleLogWithIST("Connection established successfully", {
          peerId: conn.peer,
          connectionTime: connectionTime.toISOString(),
          currentUserName: currentUserNameRef.current,
        })

        lastConnectedPeerRef.current = conn.peer
        console.log("[nw] Updated last connected peer:", conn.peer)

        try {
          await connectedPeersDB.addPeer(conn.peer, undefined)
          console.log("[nw] ✓ Peer stored in IndexedDB for reconnection")
          console.log("[nw] ✓ Dialog will appear on next refresh")
        } catch (error) {
          console.error("[nw] Failed to store peer in IndexedDB:", error)
        }

        if (currentUserNameRef.current) {
          consoleLogWithIST("Sending user info to peer", {
            toPeerId: conn.peer,
            displayName: currentUserNameRef.current,
            myPeerId: peerRef.current?.id,
          })

          conn.send({
            type: "user-info",
            displayName: currentUserNameRef.current,
            peerId: peerRef.current?.id,
          })
        }

        setState((prev) => {
          const newPeerInfo = new Map(prev.peerInfo)
          newPeerInfo.set(conn.peer, {
            id: conn.peer,
            connectedAt: connectionTime,
          })

          consoleLogWithIST("Updated connection state", {
            peerId: conn.peer,
            totalConnectedPeers: prev.connectedPeers.length + 1,
          })

          return {
            ...prev,
            isConnected: true,
            connectionStatus: "connected",
            connectedPeers: [...prev.connectedPeers, conn.peer],
            peerInfo: newPeerInfo,
            error: null,
            analytics: {
              ...prev.analytics,
              connectedPeersCount: prev.analytics.connectedPeersCount + 1,
              connectionHistory: [
                ...prev.analytics.connectionHistory,
                {
                  peerId: conn.peer,
                  connectedAt: connectionTime,
                  status: "connected" as const,
                },
              ],
              lastActivity: connectionTime,
            },
          }
        })
        lastSeenRef.current.set(conn.peer, Date.now()) // track first seen

        setTimeout(() => {
          saveSessionData()
        }, 100)
      })

      conn.on("data", (data: any) => {
        lastSeenRef.current.set(conn.peer, Date.now())

        if (data.type === "health-check") {
          // Respond to health check
          try {
            conn.send({
              type: "health-check-response",
              timestamp: Date.now(),
              originalTimestamp: data.timestamp,
              peerId: conn.peer,
            })
          } catch (error) {
            console.warn(`[nw] Failed to respond to health check from ${conn.peer}:`, error)
          }
          return
        }

        if (data.type === "health-check-response") {
          // Handle health check response
          simpleConnectionMonitor.handleHealthCheckResponse(conn.peer, data.originalTimestamp)
          return
        }

        if (data.type === "fast-ping") {
          simpleConnectionMonitor.handleFastPingRequest(conn.peer, conn, data)
          return
        }

        if (data.type === "fast-ping-response") {
          simpleConnectionMonitor.handleFastPingResponse(conn.peer, data)
          return
        }

        if (data.type === "connection-heartbeat") {
          // Regular heartbeat - just acknowledge
          return
        }

        if (
          data.type === "heartbeat" ||
          data.type === "keep-alive" ||
          data.type === "resume-active" ||
          data.type === "connection-check"
        ) {
          return
        }

        if (data.type === "peer-leaving") {
          consoleLogWithIST("Peer is leaving", {
            peerId: conn.peer,
            reason: data.reason,
          })

          announcedDisconnectReasonRef.current.set(conn.peer, data.reason)

          // Mark manualğinde disconnects so we can skip DB removal on close
          if (data.reason === "manual-disconnect" || data.reason === "manual-disconnect-all") {
            manualDisconnectPeersRef.current.add(conn.peer)
          }

          cleanupPeerConnection(conn.peer)
          return
        }

        consoleLogWithIST("Data received from peer", {
          fromPeerId: conn.peer,
          dataType: data.type,
          dataSize: JSON.stringify(data).length,
        })

        // Handle non-file transfer data
        if (data.type === "user-info") {
          setState((prev) => {
            const newPeerInfo = new Map(prev.peerInfo)
            const existingInfo = newPeerInfo.get(conn.peer)
            newPeerInfo.set(conn.peer, {
              ...existingInfo,
              id: conn.peer,
              displayName: data.displayName,
              connectedAt: existingInfo?.connectedAt || new Date(),
            })

            return {
              ...prev,
              peerInfo: newPeerInfo,
            }
          })

          try {
            connectedPeersDB.addPeer(conn.peer, data.displayName)
          } catch (error) {
            console.error("[nw] Failed to update peer display name in IndexedDB:", error)
          }
        } else if (data.type === "chat-message") {
          const chatMessage: ChatMessage = {
            id: data.id,
            peerId: conn.peer,
            message: data.message,
            timestamp: new Date(data.timestamp),
            isOwn: false,
          }

          setState((prev) => ({
            ...prev,
            chatMessages: [...prev.chatMessages, chatMessage],
          }))
        }
        // File transfer data is handled by transfer engine automatically
      })

      conn.on("close", () => {
        const disconnectionTime = new Date()
        console.log("[nw] Peer disconnected:", conn.peer)
        consoleLogWithIST("Connection closed", {
          peerId: conn.peer,
          disconnectionTime: disconnectionTime.toISOString(),
        })

        lastSeenRef.current.delete(conn.peer) // cleanup liveness cache

        const announcedReason = announcedDisconnectReasonRef.current.get(conn.peer)
        const isSelfRefresh = isUnloadingRef.current === true

        if (announcedReason === undefined) {
          if (!isSelfRefresh) {
            try {
              connectedPeersDB.removePeer(conn.peer)
            } catch {}
          }
        } else {
          // If it was manual, clean up the marker; do not remove from DB per your requirement.
          if (manualDisconnectPeersRef.current.has(conn.peer)) {
            manualDisconnectPeersRef.current.delete(conn.peer)
          }
          // For any announced non-manual reasons (e.g., offline), do not remove from DB here.
        }
        announcedDisconnectReasonRef.current.delete(conn.peer)

        cleanupPeerConnection(conn.peer)
      })

      conn.on("error", (error) => {
        console.error("[nw] usePeerConnection: Connection error", {
          peerId: conn.peer,
          errorType: error.type,
          errorMessage: error.message,
        })

        lastSeenRef.current.delete(conn.peer) // cleanup liveness cache

        const announcedReason = announcedDisconnectReasonRef.current.get(conn.peer)
        const isSelfRefresh = isUnloadingRef.current === true

        if (announcedReason === undefined) {
          if (!isSelfRefresh) {
            try {
              connectedPeersDB.removePeer(conn.peer)
            } catch {}
          }
        } else {
          if (manualDisconnectPeersRef.current.has(conn.peer)) {
            manualDisconnectPeersRef.current.delete(conn.peer)
          }
        }
        announcedDisconnectReasonRef.current.delete(conn.peer)

        cleanupPeerConnection(conn.peer)

        const errorMessage = getErrorMessage(error)
        setState((prev) => ({
          ...prev,
          error: `Connection error with ${conn.peer}: ${errorMessage}`,
        }))
      })
    },
    [simpleConnectionMonitor, getErrorMessage, cleanupPeerConnection, saveSessionData, state.peerInfo], // Added state.peerInfo
  ) // Removed state.peerId from dependencies to avoid circular dependency

  const isReallyConnected = useCallback(
    (peerId?: string) => {
      if (peerId) {
        return simpleConnectionMonitor.isReallyConnected(peerId)
      }
      // Check if any peer is really connected
      return Array.from(connectionsRef.current.keys()).some((id) => simpleConnectionMonitor.isReallyConnected(id))
    },
    [simpleConnectionMonitor],
  )

  useEffect(() => {
    let reconcileTimeout: NodeJS.Timeout | null = null

    const debouncedReconcile = () => {
      if (reconcileTimeout) {
        clearTimeout(reconcileTimeout)
      }

      reconcileTimeout = setTimeout(() => {
        if (cleanupLockRef.current) return // Skip if global cleanup in progress

        const actualConnectedPeers = Array.from(connectionsRef.current.keys()).filter(
          (peerId) => !connectionLockRef.current.get(peerId) && isReallyConnected(peerId),
        )

        setState((prev) => {
          if (
            prev.connectedPeers.length !== actualConnectedPeers.length ||
            !prev.connectedPeers.every((id) => actualConnectedPeers.includes(id))
          ) {
            console.log(
              `[nw] Reconciling connection state. Was: ${prev.connectedPeers.length}, Now: ${actualConnectedPeers.length}`,
            )

            // Clean up peer info for disconnected peers
            const newPeerInfo = new Map(prev.peerInfo)
            prev.connectedPeers.forEach((peerId) => {
              if (!actualConnectedPeers.includes(peerId)) {
                newPeerInfo.delete(peerId)
              }
            })

            return {
              ...prev,
              connectedPeers: actualConnectedPeers,
              peerInfo: newPeerInfo,
              isConnected: actualConnectedPeers.length > 0,
              connectionStatus: actualConnectedPeers.length > 0 ? "connected" : "ready",
            }
          }
          return prev
        })
      }, 2000) // Debounce reconciliation
    }

    const reconcileInterval = setInterval(debouncedReconcile, 8000) // Less frequent reconciliation

    return () => {
      clearInterval(reconcileInterval)
      if (reconcileTimeout) {
        clearTimeout(reconcileTimeout)
      }
    }
  }, [isReallyConnected])

  const handleIncomingFile = (data: any) => {
    const fileTransfer: FileTransfer = {
      id: data.fileId,
      name: data.fileName,
      size: data.fileSize,
      type: "application/octet-stream",
      progress: 0,
      status: "transferring",
      peerId: "incoming",
      totalChunks: data.totalChunks,
      chunksReceived: 0,
      lastChunkTime: Date.now(),
      isStored: false,
    }

    setState((prev) => ({
      ...prev,
      incomingFiles: [...prev.incomingFiles, fileTransfer],
    }))

    updateAnalytics({
      totalFilesReceived: state.analytics.totalFilesReceived + 1,
      lastActivity: new Date(),
    })
  }

  const handleTransferProgress = (data: any) => {
    if (data.type === "sending") {
      setState((prev) => ({
        ...prev,
        outgoingFiles: prev.outgoingFiles.map((f) =>
          f.id === data.fileId
            ? { ...f, progress: data.progress, status: data.progress >= 100 ? "completed" : "transferring" }
            : f,
        ),
      }))
      updateSpeedMetrics("send", data.speed || 0)
    } else if (data.type === "receiving") {
      setState((prev) => ({
        ...prev,
        incomingFiles: prev.incomingFiles.map((f) =>
          f.id === data.fileId
            ? { ...f, progress: data.progress, status: data.progress >= 100 ? "completed" : "transferring" }
            : f,
        ),
      }))
      updateSpeedMetrics("receive", data.speed || 0)
    }
  }

  const handleTransferComplete = async (data: any) => {
    if (data.type === "receiving" && data.blob) {
      try {
        const senderId = data.senderId || data.peerId || "unknown"
        const senderInfo = state.peerInfo.get(senderId)
        const senderName = senderInfo?.displayName || `Peer ${senderId}`

        await fileHistoryPersistence.addReceivedFile({
          id: data.fileId,
          name: data.fileName,
          size: data.blob.size, // Use actual blob size for accurate file size
          type: data.blob.type || "application/octet-stream",
          blob: data.blob,
          peerId: senderId, // Keep peer ID
          peerName: senderName, // Add peer name
        })

        // Store in existing file storage for backward compatibility
        await fileStorage.storeFile({
          id: data.fileId,
          name: data.fileName,
          size: data.blob.size,
          type: data.blob.type || "application/octet-stream",
          blob: data.blob,
          timestamp: Date.now(),
          peerId: senderId,
        })

        console.log(`[nw] File received and stored: ${data.fileName}`)

        logFileReceived()

        setState((prev) => ({
          ...prev,
          incomingFiles: prev.incomingFiles.map((f) => (f.id === data.fileId ? { ...f, isStored: true } : f)),
        }))

        if (state.autoDownload) {
          const url = URL.createObjectURL(data.blob)
          const link = document.createElement("a")
          link.href = url
          link.download = data.fileName
          link.style.display = "none"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }

        updateAnalytics({
          totalDataReceived: state.analytics.totalDataReceived + data.blob.size,
          totalDataTransferred: state.analytics.totalDataTransferred + data.blob.size,
          successfulTransfers: state.analytics.successfulTransfers + 1,
          lastActivity: new Date(),
        })
      } catch (error) {
        console.error(`[nw] Failed to store received file:`, error)
        updateAnalytics({
          failedTransfers: state.analytics.failedTransfers + 1,
          lastActivity: new Date(),
        })
      }
    }
  }

  const handleFileReceived = (fileTransfer: FileTransfer) => {
    console.log(`[nw] File received: ${fileTransfer.name} (${formatBytes(fileTransfer.data.byteLength)})`)

    logFileReceived()

    setState((prev) => ({
      ...prev,
      incomingFiles: prev.incomingFiles.map((f) => (f.id === fileTransfer.id ? { ...f, status: "completed" } : f)),
    }))

    window.dispatchEvent(new CustomEvent("indexeddb-change"))

    if (state.autoDownload) {
      handleTransferComplete({
        type: "receiving",
        blob: new Blob([fileTransfer.data]),
        fileId: fileTransfer.id,
        fileName: fileTransfer.name,
      })
    }
  }

  const handleDataChannelMessage = useCallback(
    async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "file-data") {
          console.log(`[nw] File received: ${data.fileName} (${formatBytes(data.fileSize)})`)

          logFileReceived()

          try {
            const fileBlob = new Blob([data.fileData], { type: data.fileType })

            const senderId = data.senderId || "unknown"
            const senderInfo = state.peerInfo.get(senderId)
            const senderName = senderInfo?.displayName || `Peer ${senderId}`

            await fileHistoryPersistence.addReceivedFile({
              id: data.fileId,
              name: data.fileName,
              size: fileBlob.size,
              type: data.fileType || "application/octet-stream",
              blob: fileBlob,
              peerId: senderId,
              peerName: senderName,
            })

            await receivedFilesStorage.addReceivedFile({
              id: data.fileId,
              name: data.fileName,
              size: fileBlob.size,
              type: data.fileType || "application/octet-stream",
              blob: fileBlob,
              peerId: senderId,
            })

            await fileStorage.storeFile({
              id: data.fileId,
              name: data.fileName,
              size: fileBlob.size,
              type: data.fileType || "application/octet-stream",
              blob: fileBlob,
              timestamp: Date.now(),
              peerId: senderId,
            })

            window.dispatchEvent(new CustomEvent("indexeddb-change"))

            console.log(`[nw] File stored successfully: ${data.fileName}`)
          } catch (error) {
            console.error(`[nw] Failed to store file:`, error)
          }
        }
      } catch (error) {
        console.error(`[nw] Failed to parse data channel message:`, error)
      }
    },
    [state.peerInfo],
  )

  useEffect(() => {
    transferEngine.on("incoming-file", handleIncomingFile)
    transferEngine.on("progress", handleTransferProgress)
    transferEngine.on("complete", handleTransferComplete)
    transferEngine.on("file-received", handleFileReceived)

    return () => {
      transferEngine.off("incoming-file", handleIncomingFile)
      transferEngine.off("progress", handleTransferProgress)
      transferEngine.off("complete", handleTransferComplete)
      transferEngine.off("file-received", handleFileReceived)
    }
  }, [state.autoDownload, state.analytics, updateAnalytics, updateSpeedMetrics, state.peerInfo])

  const connectToPeer = useCallback(
    (targetPeerId: string) => {
      console.log("[nw] Connect to peer initiated", {
        targetPeerId,
        currentPeerId: state.peerId,
        peerInitialized: !!state.peer,
        connectionStatus: state.connectionStatus,
      })

      if (!state.peer) {
        console.error("[nw] usePeerConnection: Connect failed - peer not initialized")
        setState((prev) => ({ ...prev, error: "Peer not initialized. Please wait a moment and try again." }))
        return
      }

      if (!targetPeerId || targetPeerId.trim() === "") {
        console.error("[nw] usePeerConnection: Connect failed - empty target peer ID")
        setState((prev) => ({ ...prev, error: "Please enter a connection key." }))
        return
      }

      if (targetPeerId === state.peerId) {
        console.error("[nw] usePeerConnection: Connect failed - self connection attempt")
        setState((prev) => ({ ...prev, error: "Cannot connect to yourself! Please use a different connection key." }))
        return
      }

      const existingConnection = connectionsRef.current.get(targetPeerId)
      if (existingConnection && existingConnection.open) {
        console.log("[nw] usePeerConnection: Already connected to peer", targetPeerId)
        setState((prev) => ({ ...prev, error: `Already connected to peer ${targetPeerId}` }))
        return
      }

      if (targetPeerId.length !== 6) {
        console.error("[nw] usePeerConnection: Connect failed - invalid key length")
        setState((prev) => ({ ...prev, error: "Connection key must be exactly 6 characters long." }))
        return
      }

      if (!/^[A-Z0-9]{6}$/.test(targetPeerId)) {
        console.error("[nw] usePeerConnection: Connect failed - invalid key format")
        setState((prev) => ({ ...prev, error: "Connection key must contain only letters and numbers." }))
        return
      }

      // NOTE: This is intentionally local to the connectToPeer logic and does not change your broader logic.

      console.log("[nw] All validations passed, initiating connection", {
        targetPeerId,
      })

      setState((prev) => ({ ...prev, connectionStatus: "connecting", error: null }))

      try {
        ;(async () => {
          const waitForPeerReady = async (timeoutMs = 2000) => {
            const start = Date.now()
            while (Date.now() - start < timeoutMs) {
              const pr = peerRef.current as any
              if (pr && pr.id && !pr.destroyed) break
              await new Promise((r) => setTimeout(r, 50))
            }
          }

          await waitForPeerReady(2000)

          const conn = state.peer.connect(targetPeerId, {
            reliable: true,
            serialization: "binary",
          })

          console.log("[nw] Connection object created", {
            targetPeerId,
            connectionId: (conn as any).connectionId,
          })

          const baseOpenTimeout = 25000
          const netInfo: any = (typeof navigator !== "undefined" && (navigator as any).connection) || null
          const slowTypes = ["slow-2g", "2g", "3g"]
          const OPEN_TIMEOUT_MS =
            netInfo && slowTypes.includes(netInfo.effectiveType) ? baseOpenTimeout + 10000 : baseOpenTimeout

          let backupConn: any | null = null
          const clearBackupIfAny = () => {
            try {
              if (backupDialTimer) clearTimeout(backupDialTimer)
            } catch {}
          }

          const connectionTimeout = setTimeout(() => {
            // If neither primary nor backup opened, fail and cleanup
            const primaryOpen = (conn as any)?.open
            const backupOpen = (backupConn as any)?.open
            if (!primaryOpen && !backupOpen) {
              console.log("[nw] Connection timeout", {
                targetPeerId,
                timeoutDuration: OPEN_TIMEOUT_MS,
              })
              try {
                ;(conn as any)?.close?.()
              } catch {}
              try {
                ;(backupConn as any)?.close?.()
              } catch {}
              setState((prev) => ({
                ...prev,
                connectionStatus: connectionsRef.current.size > 0 ? "connected" : "error",
                error: `Connection to ${targetPeerId} timed out`,
              }))
            }
          }, OPEN_TIMEOUT_MS)

          // Fire a quick "backup dial" if the first one is still stuck on connecting after a short delay
          const backupDialDelay = 350 + Math.floor(Math.random() * 200)
          const backupDialTimer = setTimeout(() => {
            try {
              if ((conn as any)?.open || (conn as any)?.destroyed) return
              backupConn = state.peer.connect(targetPeerId, {
                reliable: true,
                serialization: "binary",
              })
              setupConnection(backupConn)

              // If backup wins, close primary
              backupConn.on("open", () => {
                try {
                  if (!(conn as any)?.open) (conn as any)?.close?.()
                } catch {}
                clearTimeout(connectionTimeout)
                clearBackupIfAny()
              })
              backupConn.on("error", () => {
                // backup errored; let primary continue
                clearBackupIfAny()
              })
            } catch {
              // ignore backup dial failures
            }
          }, backupDialDelay)

          conn.on("open", () => {
            console.log("[nw] Connection opened successfully", { targetPeerId })
            clearTimeout(connectionTimeout)
            clearBackupIfAny()
            try {
              // If primary wins, close backup if it exists and hasn't opened
              if (backupConn && !(backupConn as any)?.open) {
                ;(backupConn as any)?.close?.()
              }
            } catch {}
          })

          conn.on("error", (error) => {
            console.error("[nw] Connection error", {
              targetPeerId,
              error: (error as any).message,
              type: (error as any).type,
            })
            clearTimeout(connectionTimeout)
            clearBackupIfAny()

            let errorMessage = "Connection failed"
            if ((error as any).type === "peer-unavailable") {
              errorMessage = `Peer ${targetPeerId} is not available. They may be offline or the connection key may be incorrect.`
            } else if ((error as any).message?.includes("Could not connect to peer")) {
              errorMessage = `Could not connect to peer ${targetPeerId}. They may be behind a firewall.`
            } else {
              errorMessage = `Connection to ${targetPeerId} failed: ${(error as any).message}`
            }

            setState((prev) => ({
              ...prev,
              error: errorMessage,
              connectionStatus: connectionsRef.current.size > 0 ? "connected" : "ready",
            }))
          })

          setupConnection(conn)
        })().catch((error) => {
          // ensure errors inside the IIFE are handled since we aren't awaiting it
          console.error("[nw] Failed to create connection (async)", {
            targetPeerId,
            error: error instanceof Error ? error.message : String(error),
          })
          const errorMessage = getErrorMessage(error)
          setState((prev) => ({
            ...prev,
            error: `Failed to connect to peer ${targetPeerId}: ${errorMessage}`,
            connectionStatus: connectionsRef.current.size > 0 ? "connected" : "ready",
          }))
        })
      } catch (error) {
        // This catch block is now only for synchronous errors before the IIFE starts
        console.error("[nw] Failed to create connection (sync)", {
          targetPeerId,
          error: error instanceof Error ? error.message : String(error),
        })

        const errorMessage = getErrorMessage(error)
        setState((prev) => ({
          ...prev,
          error: `Failed to connect to peer ${targetPeerId}: ${errorMessage}`,
          connectionStatus: connectionsRef.current.size > 0 ? "connected" : "ready",
        }))
      }
    },
    [state.peer, state.peerId, setupConnection, getErrorMessage],
  )

  const sendFile = useCallback(
    async (file: File, targetPeerId?: string) => {
      if (!peerRef.current || connectionsRef.current.size === 0) {
        throw new Error("No peer connections available")
      }

      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      logFileShared()

      const connectionsToSend = targetPeerId
        ? [connectionsRef.current.get(targetPeerId)].filter(Boolean)
        : Array.from(connectionsRef.current.values())

      if (connectionsToSend.length === 0) {
        throw new Error("No active connections available for sending")
      }

      const promises = connectionsToSend.map(async (connection) => {
        if (!connection || connection.destroyed) {
          console.warn(`Connection to peer ${connection?.peer} is not available for sending`)
          return null
        }

        try {
          const transferEngineInstance = new (await import("@/lib/transfer-engine")).TransferEngine()
          transferEngineInstance.setConnection(connection)

          const sentFileId = await transferEngineInstance.sendFile(file, state.chunkSize)

          const fileTransfer: FileTransfer = {
            id: `${sentFileId}-${connection.peer}`, // Keep unique ID per peer
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: "pending",
            peerId: connection.peer,
            totalChunks: Math.ceil(file.size / state.chunkSize),
            chunksReceived: 0,
            lastChunkTime: Date.now(),
          }

          setState((prev) => ({
            ...prev,
            outgoingFiles: [...prev.outgoingFiles, fileTransfer],
          }))

          return fileTransfer
        } catch (error) {
          console.error(`Failed to send file to peer ${connection.peer}:`, error)
          // Update the specific file transfer status to error if it was created
          setState((prev) => ({
            ...prev,
            outgoingFiles: prev.outgoingFiles.map((f) =>
              f.id.startsWith(fileId) && f.peerId === connection.peer ? { ...f, status: "error" } : f,
            ),
          }))
          return null
        }
      })

      const results = await Promise.allSettled(promises)
      const successful = results.filter((result) => result.status === "fulfilled" && result.value !== null).length

      if (successful === 0) {
        throw new Error("Failed to send file to any peer")
      }

      updateAnalytics({
        totalFilesSent: state.analytics.totalFilesSent + successful,
        totalDataSent: state.analytics.totalDataSent + file.size * successful,
        totalDataTransferred: state.analytics.totalDataTransferred + file.size * successful,
      })
    },
    [state.chunkSize, state.analytics, updateAnalytics, state.connectedPeers, state.peerInfo],
  )

  const sendMessage = useCallback(
    (message: string) => {
      const connections = Array.from(connectionsRef.current.values())
      if (connections.length === 0) return

      const chatMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 15),
        peerId: state.peerId || "unknown",
        message,
        timestamp: new Date(),
        isOwn: true,
      }

      setState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, chatMessage],
      }))

      connections.forEach((conn) => {
        conn.send({
          type: "chat-message",
          id: chatMessage.id,
          message,
          timestamp: chatMessage.timestamp.toISOString(),
        })
      })
    },
    [state.peerId],
  )

  const downloadFile = useCallback(async (fileTransfer: FileTransfer) => {
    console.log("[nw] Download requested for file:", fileTransfer.name, "Status:", fileTransfer.status)

    if (fileTransfer.status !== "completed") {
      console.error("[nw] File not ready for download, status:", fileTransfer.status)
      throw new Error("File not ready for download")
    }

    let blob: Blob

    if (fileTransfer.data) {
      console.log("[nw] Using file data from memory")
      blob = new Blob([fileTransfer.data], { type: fileTransfer.type })
    } else if (fileTransfer.isStored) {
      console.log("[nw] Retrieving file from IndexedDB storage")
      try {
        const storedFile = await fileStorage.getFile(fileTransfer.id)
        if (!storedFile) {
          console.error("[nw] File not found in IndexedDB:", fileTransfer.id)
          throw new Error("File not found in storage")
        }
        blob = storedFile.blob
        console.log("[nw] File retrieved from IndexedDB successfully")
      } catch (error) {
        console.error("[nw] Failed to retrieve stored file:", error)
        throw new Error("Failed to retrieve file from storage")
      }
    } else {
      console.error("[nw] No file data available for download")
      throw new Error("File data not available")
    }

    console.log("[nw] Creating download link for:", fileTransfer.name)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileTransfer.name
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log("[nw] Download completed and cleanup done for:", fileTransfer.name)
    }, 100)
  }, [])

  const disconnectFromPeer = useCallback(
    async (peerId: string) => {
      if (connectionLockRef.current.get(peerId)) {
        console.log(`[nw] Disconnect already in progress for peer: ${peerId}`)
        return
      }

      console.log(`[nw] Starting disconnect from peer: ${peerId}`)

      const conn = connectionsRef.current.get(peerId)
      if (conn) {
        try {
          // Send notification with timeout protection
          const notificationPromise = new Promise<void>((resolve) => {
            try {
              conn.send({
                type: "peer-leaving",
                timestamp: Date.now(),
                reason: "manual-disconnect",
                peerId: state.peerId,
              })
              resolve()
            } catch (error) {
              console.warn(`[nw] Failed to send leaving notification to ${peerId}:`, error)
              resolve()
            }
          })

          await Promise.race([notificationPromise, new Promise((resolve) => setTimeout(resolve, 500))])

          if (conn.open) {
            const closePromise = new Promise<void>((resolve) => {
              conn.close()
              resolve()
            })
            await Promise.race([closePromise, new Promise((resolve) => setTimeout(resolve, 1000))])
          }
        } catch (error) {
          console.warn(`[nw] Error during disconnect notification to ${peerId}:`, error)
        }
      }

      try {
        console.log(`[nw] Removing peer ${peerId} from IndexedDB (manual disconnect)`)
        await connectedPeersDB.removePeer(peerId)
        console.log(`[nw] ✓ Peer removed from IndexedDB`)
        console.log(`[nw] ✓ Dialog will NOT show this peer on next refresh`)
      } catch (error) {
        console.error("[nw] Failed to remove peer from IndexedDB:", error)
      }

      if (lastConnectedPeerRef.current === peerId) {
        console.log(`[nw] Clearing session data for last connected peer: ${peerId}`)
        sessionPersistence.clearSession()
        lastConnectedPeerRef.current = null
      }

      await cleanupPeerConnection(peerId)
    },
    [state.peerId, cleanupPeerConnection],
  )

  const disconnect = useCallback(async () => {
    if (cleanupLockRef.current) {
      console.log(`[nw] Global disconnect already in progress`)
      return
    }

    cleanupLockRef.current = true
    console.log(`[nw] Starting global disconnect and cleanup`)

    try {
      const notificationPromises = Array.from(connectionsRef.current.entries()).map(async ([peerId, conn]) => {
        if (conn && conn.open) {
          try {
            const notifyPromise = new Promise<void>((resolve) => {
              conn.send({
                type: "peer-leaving",
                timestamp: Date.now(),
                reason: "manual-disconnect-all",
                peerId: state.peerId,
              })
              setTimeout(() => {
                if (conn.open) conn.close()
                resolve()
              }, 100)
            })

            await Promise.race([notifyPromise, new Promise((resolve) => setTimeout(resolve, 500))])
          } catch (error) {
            console.warn(`[nw] Failed to notify peer ${peerId} of disconnect:`, error)
          }
        }
      })

      await Promise.race([
        Promise.allSettled(notificationPromises),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ])

      try {
        const cleanupPromise = fileStorage.deleteFilesByPeer(state.peerId || "unknown")
        await Promise.race([
          cleanupPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Global cleanup timeout")), 3000)),
        ])
        console.log(`[nw] Cleaned up stored files for peer: ${state.peerId}`)
      } catch (error) {
        console.error(`[nw] Failed to clean up stored files:`, error)
      }

      try {
        console.log(`[nw] Clearing all peers from IndexedDB (manual disconnect all)`)
        await connectedPeersDB.clearAll()
        await connectedPeersDB.clearRefreshFlag()
        console.log(`[nw] ✓ All peers cleared from IndexedDB`)
        console.log(`[nw] ✓ Refresh flag cleared`)
        console.log(`[nw] ✓ Dialog will NOT appear on next refresh`)

        // </CHANGE> also clear localStorage fallback flag to keep state consistent
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("nw_refresh_flag")
          }
        } catch {
          // no-op
        }
      } catch (error) {
        console.error("[nw] Failed to clear IndexedDB:", error)
      }

      console.log(`[nw] Clearing all session data due to manual disconnect`)
      sessionPersistence.clearSession()
      lastConnectedPeerRef.current = null

      if (state.peer) {
        state.peer.destroy()
        console.log(`[nw] Peer connection destroyed`)
      }

      connectionsRef.current.clear()
      lastSeenRef.current.clear()
      connectionLockRef.current.clear()

      setState((prev) => ({
        ...prev,
        peer: null,
        isConnected: false,
        peerId: "",
        connectionStatus: "disconnected",
        connectedPeers: [],
        peerInfo: new Map(),
        incomingFiles: [],
        outgoingFiles: [],
        chatMessages: [],
        error: null,
      }))

      console.log(`[nw] Global disconnection completed, state reset`)
    } finally {
      cleanupLockRef.current = false
    }
  }, [state.peer, state.peerId])

  const clearTransfers = useCallback(() => {
    setState((prev) => ({
      ...prev,
      incomingFiles: [],
      outgoingFiles: [],
    }))
  }, [])

  const updateChunkSize = useCallback((size: number) => {
    setState((prev) => ({ ...prev, chunkSize: size }))
  }, [])

  const updateAutoDownload = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, autoDownload: enabled }))
  }, [])

  const getSessionHistory = useCallback(() => {
    const sessionData = sessionPersistence.loadSession()
    const currentAnalytics = state.analytics

    return {
      currentSession: sessionData,
      connectionHistory: currentAnalytics.connectionHistory,
      totalConnections: currentAnalytics.connectedPeersCount,
      filesTransferred: currentAnalytics.totalFilesSent + currentAnalytics.totalFilesReceived,
      totalDataTransferred: currentAnalytics.totalDataTransferred,
      sessionStartTime: connectionStartTimeRef.current,
      uptime: connectionStartTimeRef.current ? Date.now() - connectionStartTimeRef.current.getTime() : 0,
    }
  }, [state.analytics])

  useEffect(() => {
    if (state.connectedPeers.length > 0) {
      lastConnectedPeerRef.current = state.connectedPeers[state.connectedPeers.length - 1]
      saveSessionData()
    }
  }, [state.connectedPeers, saveSessionData])

  useEffect(() => {
    if (state.chatMessages.length > 0) {
      saveSessionData()
    }
  }, [state.chatMessages, saveSessionData])

  useEffect(() => {
    const handleOnline = () => {
      consoleLogWithIST("Browser back online")
      tryPeerReconnect()
      // nudge existing connections
      connectionsRef.current.forEach((conn) => {
        if (conn && conn.open) {
          try {
            conn.send({ type: "connection-check", timestamp: Date.now(), restored: false })
          } catch {}
        }
      })
    }

    const handleOffline = () => {
      consoleLogWithIST("Browser went offline")
      // Best-effort notify peers
      connectionsRef.current.forEach((conn) => {
        if (conn && conn.open) {
          try {
            conn.send({
              type: "peer-leaving",
              timestamp: Date.now(),
              reason: "offline",
              peerId: state.peerId,
            })
          } catch {}
        }
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [state.peerId, tryPeerReconnect])

  useEffect(() => {
    if (livenessIntervalRef.current) {
      clearInterval(livenessIntervalRef.current)
    }

    livenessIntervalRef.current = setInterval(() => {
      if (cleanupLockRef.current) return // Skip if global cleanup in progress

      const now = Date.now()
      const peersToCleanup: string[] = []

      connectionsRef.current.forEach((conn, peerId) => {
        // Skip if connection already closed or cleanup in progress
        if (!conn || !conn.open || connectionLockRef.current.get(peerId)) return

        const last = lastSeenRef.current.get(peerId) ?? now
        const elapsed = now - last

        // Soft probe after 20s of silence (increased from 15s)
        if (elapsed > 20000 && elapsed < 30000) {
          try {
            conn.send({ type: "health-check", timestamp: now })
          } catch (error) {
            console.warn(`[nw] Health check failed for peer ${peerId}:`, error)
          }
        }

        // Consider stale after 30s of complete silence (increased from 25s)
        if (elapsed >= 30000) {
          console.log(`[nw] Peer considered stale: ${peerId}, silent for ${elapsed}ms`)
          peersToCleanup.push(peerId)
        }
      })

      // Cleanup stale peers sequentially to avoid race conditions
      peersToCleanup.forEach(async (peerId) => {
        try {
          const conn = connectionsRef.current.get(peerId)
          if (conn && conn.open) {
            conn.close()
          }
          await cleanupPeerConnection(peerId)
        } catch (error) {
          console.error(`[nw] Error cleaning up stale peer ${peerId}:`, error)
        }
      })
    }, 8000) // Increased interval for better stability

    return () => {
      if (livenessIntervalRef.current) {
        clearInterval(livenessIntervalRef.current)
        livenessIntervalRef.current = null
      }
    }
  }, [cleanupPeerConnection])

  // Use the simpleConnectionMonitor hook here
  // const simpleConnectionMonitor = useSimpleConnectionMonitor(connectionsRef.current)

  // Replaced complex fast connection monitor with simple connection monitor
  // The cleanupPeerConnection function was duplicated here and is now removed.

  return {
    ...state,
    connectToPeer,
    sendFile,
    sendMessage,
    downloadFile,
    disconnect,
    clearTransfers,
    updateChunkSize,
    updateAutoDownload,
    initializeWithStoredId,
    setCurrentUserName,
    getSessionHistory,
    disconnectFromPeer,
    isReallyConnected, // Export enhanced connection validation
    simpleConnectionMonitor, // Export simple connection monitor
    handleDataChannelMessage,
  }
}
