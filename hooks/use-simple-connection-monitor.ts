"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { DataConnection } from "peerjs"

export interface SimpleConnectionState {
  peerId: string
  isConnected: boolean
  lastPingTime?: number
  lastPongTime?: number
  pingLatency?: number
}

export function useSimpleConnectionMonitor(connections: Map<string, DataConnection>) {
  const [connectionStates, setConnectionStates] = useState<Map<string, SimpleConnectionState>>(new Map())
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconcileIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // clear any existing intervals before setting new ones
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current)
    }
    if (reconcileIntervalRef.current) {
      clearInterval(reconcileIntervalRef.current)
    }

    // Health check every 5 seconds
    healthCheckIntervalRef.current = setInterval(() => {
      connections.forEach((connection, peerId) => {
        if (connection && !connection.destroyed && connection.open) {
          try {
            connection.send({
              type: "health-check",
              timestamp: Date.now(),
              peerId: peerId,
            })
            setConnectionStates((prev) => {
              const updated = new Map(prev)
              const current = updated.get(peerId) || { peerId, isConnected: false }
              updated.set(peerId, { ...current, lastPingTime: Date.now() })
              return updated
            })
          } catch {
            setConnectionStates((prev) => {
              const updated = new Map(prev)
              updated.delete(peerId)
              return updated
            })
          }
        } else {
          setConnectionStates((prev) => {
            const updated = new Map(prev)
            updated.delete(peerId)
            return updated
          })
        }
      })
    }, 5000)

    // Reconcile connection states every 10 seconds
    reconcileIntervalRef.current = setInterval(() => {
      setConnectionStates((prev) => {
        const updated = new Map(prev)
        const now = Date.now()
        let hasChanges = false

        updated.forEach((state, peerId) => {
          const connection = connections.get(peerId)
          const timeSinceLastPing = state.lastPingTime ? now - state.lastPingTime : Number.POSITIVE_INFINITY
          const timeSinceLastPong = state.lastPongTime ? now - state.lastPongTime : Number.POSITIVE_INFINITY

          if (timeSinceLastPing > 15000 && timeSinceLastPong > 15000) {
            updated.delete(peerId)
            hasChanges = true
          } else if (!connection || connection.destroyed || !connection.open) {
            updated.delete(peerId)
            hasChanges = true
          }
        })

        return hasChanges ? updated : prev
      })
    }, 10000)

    return () => {
      if (healthCheckIntervalRef.current) clearInterval(healthCheckIntervalRef.current)
      if (reconcileIntervalRef.current) clearInterval(reconcileIntervalRef.current)
    }
    // Only recreate when the connections map identity changes (prevents overlapping timers)
  }, [connections])

  const getConnectionState = useCallback(
    (peerId: string): SimpleConnectionState | null => {
      return connectionStates.get(peerId) || null
    },
    [connectionStates],
  )

  const isReallyConnected = useCallback(
    (peerId: string): boolean => {
      const state = connectionStates.get(peerId)
      const connection = connections.get(peerId)

      return !!(state?.isConnected && connection?.open && !connection.destroyed && connection.readyState === "open")
    },
    [connectionStates, connections],
  )

  const handleHealthCheckResponse = useCallback((peerId: string, timestamp: number) => {
    setConnectionStates((prev) => {
      const updated = new Map(prev)
      const current = updated.get(peerId)
      if (current) {
        const latency = current.lastPingTime ? Date.now() - current.lastPingTime : 0
        updated.set(peerId, {
          ...current,
          lastPongTime: Date.now(),
          pingLatency: latency,
        })
      }
      return updated
    })
  }, [])

  return {
    connectionStates,
    getConnectionState,
    isReallyConnected,
    handleHealthCheckResponse,
  }
}
