"use client"

import { useState, useEffect, useCallback } from "react"
import { transferEngine } from "@/lib/transfer-engine"

interface TransferUIState {
  activeTransfers: Map<
    string,
    {
      fileId: string
      fileName: string
      progress: number
      speed: number
      type: "sending" | "receiving"
      startTime: number
    }
  >
  completedTransfers: Array<{
    fileId: string
    fileName: string
    type: "sending" | "receiving"
    completedAt: number
    blob?: Blob
  }>
  totalSpeed: {
    sending: number
    receiving: number
  }
}

export function useTransferUI() {
  const [uiState, setUIState] = useState<TransferUIState>({
    activeTransfers: new Map(),
    completedTransfers: [],
    totalSpeed: { sending: 0, receiving: 0 },
  })

  useEffect(() => {
    let animationFrame: number
    let lastUpdate = 0
    const UPDATE_INTERVAL = 1000 / 30

    const updateUI = (timestamp: number) => {
      if (timestamp - lastUpdate >= UPDATE_INTERVAL) {
        const stats = transferEngine.getTransferStats()

        setUIState((prev) => {
          const newActiveTransfers = new Map()
          let sendingSpeed = 0
          let receivingSpeed = 0

          stats.sending.forEach((transfer) => {
            newActiveTransfers.set(transfer.fileId, {
              ...transfer,
              type: "sending" as const,
              startTime: prev.activeTransfers.get(transfer.fileId)?.startTime || Date.now(),
            })
            sendingSpeed += transfer.speed
          })

          stats.receiving.forEach((transfer) => {
            newActiveTransfers.set(transfer.fileId, {
              ...transfer,
              type: "receiving" as const,
              startTime: prev.activeTransfers.get(transfer.fileId)?.startTime || Date.now(),
            })
            receivingSpeed += transfer.speed
          })

          return {
            ...prev,
            activeTransfers: newActiveTransfers,
            totalSpeed: {
              sending: sendingSpeed,
              receiving: receivingSpeed,
            },
          }
        })

        lastUpdate = timestamp
      }

      animationFrame = requestAnimationFrame(updateUI)
    }

    animationFrame = requestAnimationFrame(updateUI)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  useEffect(() => {
    const handleProgress = (data: any) => {}

    const handleComplete = (data: any) => {
      setUIState((prev) => {
        const newCompleted = [
          ...prev.completedTransfers,
          {
            fileId: data.fileId,
            fileName: data.fileName,
            type: data.type,
            completedAt: Date.now(),
            blob: data.blob,
          },
        ]

        const newActiveTransfers = new Map(prev.activeTransfers)
        newActiveTransfers.delete(data.fileId)

        return {
          ...prev,
          activeTransfers: newActiveTransfers,
          completedTransfers: newCompleted,
        }
      })
    }

    transferEngine.on("progress", handleProgress)
    transferEngine.on("complete", handleComplete)

    return () => {
      transferEngine.off("progress", handleProgress)
      transferEngine.off("complete", handleComplete)
    }
  }, [])

  const startFileTransfer = useCallback(async (file: File, chunkSize?: number) => {
    const fileId = await transferEngine.sendFile(file, chunkSize)

    setUIState((prev) => {
      const newActiveTransfers = new Map(prev.activeTransfers)
      newActiveTransfers.set(fileId, {
        fileId,
        fileName: file.name,
        progress: 0,
        speed: 0,
        type: "sending",
        startTime: Date.now(),
      })

      return {
        ...prev,
        activeTransfers: newActiveTransfers,
      }
    })

    return fileId
  }, [])

  const downloadCompletedFile = useCallback(
    (fileId: string) => {
      const completed = uiState.completedTransfers.find((t) => t.fileId === fileId)
      if (completed?.blob) {
        const url = URL.createObjectURL(completed.blob)
        const a = document.createElement("a")
        a.href = url
        a.download = completed.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    },
    [uiState.completedTransfers],
  )

  const clearCompletedTransfer = useCallback((fileId: string) => {
    setUIState((prev) => ({
      ...prev,
      completedTransfers: prev.completedTransfers.filter((t) => t.fileId !== fileId),
    }))
  }, [])

  return {
    activeTransfers: Array.from(uiState.activeTransfers.values()),
    completedTransfers: uiState.completedTransfers,
    totalSpeed: uiState.totalSpeed,
    startFileTransfer,
    downloadCompletedFile,
    clearCompletedTransfer,
  }
}
