"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Users,
  Send,
  Plus,
  User,
  X,
  WifiOff,
  Info,
  ChevronDown,
  FileImage,
  FileVideo,
  FileText,
  File,
  Trash2,
  Zap,
  Archive,
  Music,
  Code,
  Database,
  Presentation,
  Sheet,
  BadgeInfo,
  CalendarDays,
  HardDrive,
} from "lucide-react"
import { toast as showToast } from "@/hooks/use-toast"
import { AppFooter } from "@/components/app-footer"
import { NavigationMenu } from "@/components/navigation-menu"
import { usePeerConnection } from "@/hooks/use-peer-connection"
import { NameModal } from "@/components/name-modal"
import CreateFileModal from "@/components/create-file-modal"
import { FileUploadZone } from "@/components/file-upload-zone"
import FloatingSettingsBubble from "@/components/floating-settings-bubble"
import { sessionPersistence } from "@/lib/session-persistence"
import { fileStorage } from "@/lib/file-storage"
import { fileHistoryPersistence } from "@/lib/file-history-persistence"
import ConnectionHub from "@/components/connection-hub"
import { TransferStatus } from "@/components/transfer-status"
import { ConnectionStatus } from "@/components/connection-status"
import { FeatureDashboard } from "@/components/feature-dashboard"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { profilePersistence } from "@/lib/profile-persistence" // import profile-persistence for stable identity store

interface FileWithPreview extends File {
  id: string
  preview?: string
}

export default function FileShareApp() {
  const [connectKey, setConnectKey] = useState<string>("")
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [selectedPeer, setSelectedPeer] = useState<string>("all")
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [displayName, setDisplayName] = useState<string>("")
  const [showNameModal, setShowNameModal] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [myId, setMyId] = useState<string>("")
  const [myName, setMyName] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)
  const [maxFilesPerTransfer, setMaxFilesPerTransfer] = useState<number>(() => {
    return 10
  })
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false)
  const [isAdvancedOptionsExpanded, setIsAdvancedOptionsExpanded] = useState(false)
  const [isFileHistoryExpanded, setIsFileHistoryExpanded] = useState(false)
  const [fileHistoryCount, setFileHistoryCount] = useState(0)
  const [fileHistoryManuallyCollapsed, setFileHistoryManuallyCollapsed] = useState(false)
  const [isFileDetailsExpanded, setIsFileDetailsExpanded] = useState(false)

  const {
    peerId,
    isConnected,
    connectionStatus,
    connectedPeers,
    peerInfo,
    error,
    incomingFiles,
    outgoingFiles,
    chunkSize,
    autoDownload,
    analytics,
    chatMessages,
    connectToPeer,
    sendFile,
    sendMessage,
    downloadFile,
    disconnect,
    disconnectFromPeer, // Added disconnectFromPeer to destructuring
    clearTransfers,
    updateChunkSize,
    updateAutoDownload,
    initializeWithStoredId,
    setCurrentUserName,
    fastConnectionMonitor, // Get fast connection monitor from hook
  } = usePeerConnection()

  const toast = {
    success: (message: string, _opts?: any) => showToast({ title: message }),
    error: (message: string, _opts?: any) => showToast({ title: message, variant: "destructive" }),
  }

  const handleSendMessage = useCallback(
    (message: string) => {
      if (message.trim() && isConnected) {
        sendMessage(message.trim())
        toast.success("Message sent!", {
          duration: 1500,
          position: "bottom-right",
        })
      }
    },
    [sendMessage, isConnected],
  )

  useEffect(() => {
    // Suppress ResizeObserver loop errors which are non-critical
    const resizeObserverErrorHandler = (e: ErrorEvent) => {
      if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
        e.stopImmediatePropagation()
      }
    }

    window.addEventListener("error", resizeObserverErrorHandler)

    return () => {
      window.removeEventListener("error", resizeObserverErrorHandler)
    }
  }, [])

  useEffect(() => {
    if (isInitialized) return

    const initializeStorage = async () => {
      try {
        console.log("[nw] Initializing file storage on app startup")
        await fileStorage.init()
        console.log("[nw] File storage initialization complete")

        console.log("[nw] Starting file history persistence system")
        fileHistoryPersistence.startPeriodicCleanup()
        console.log("[nw] File history persistence system started")
      } catch (error) {
        console.error("[nw] Failed to initialize file storage:", error)
      }
    }

    const profile = profilePersistence.loadProfile()
    if (profile && profile.id && profile.name) {
      setMyId(profile.id)
      setMyName(profile.name)
      setDisplayName(profile.name)
      setShowNameModal(false)

      try {
        const saved = sessionPersistence.loadSession()
        if (saved && saved.id === profile.id && saved.name === profile.name) {
          setMaxFilesPerTransfer(saved.maxFilesPerTransfer || 10)
        } else {
          // Initialize session store for this profile so future changes persist
          sessionPersistence.saveSession(profile.id, profile.name, maxFilesPerTransfer)
          // Try namespaced sessionStorage as a fallback (used by FloatingSettingsBubble)
          try {
            const nsKey = `fileTransferSettings:${profile.id}:${profile.name.replace(/[:]/g, "_")}`
            const raw = sessionStorage.getItem(nsKey) || sessionStorage.getItem("fileTransferSettings")
            if (raw) {
              const parsed = JSON.parse(raw)
              if (typeof parsed.maxFilesPerTransfer === "number") {
                setMaxFilesPerTransfer(parsed.maxFilesPerTransfer)
              }
            }
          } catch {}
        }
      } catch {}

      setIsInitialized(true)

      initializeWithStoredId(profile.id)
      setCurrentUserName(profile.name)

      initializeStorage()

      toast.success(`Welcome back ${profile.name}! Your connection key is ${profile.id}`, {
        duration: 3000,
        position: "bottom-right",
      })
      return
    }

    const sessionData = sessionPersistence.loadSession()

    if (sessionData && sessionData.id && sessionData.name) {
      setMyId(sessionData.id)
      setMyName(sessionData.name)
      setDisplayName(sessionData.name)
      setMaxFilesPerTransfer(sessionData.maxFilesPerTransfer || 10)
      setShowNameModal(false)
      setIsInitialized(true)

      // Migrate identity from session to profile for resilience
      profilePersistence.saveProfile(sessionData.id, sessionData.name)

      initializeWithStoredId(sessionData.id)
      setCurrentUserName(sessionData.name)

      initializeStorage()

      toast.success(`Welcome back ${sessionData.name}! Your connection key is ${sessionData.id}`, {
        duration: 3000,
        position: "bottom-right",
      })
    } else {
      setShowNameModal(true)
      setIsInitialized(true)
      initializeStorage()
    }
  }, [isInitialized, initializeWithStoredId, setCurrentUserName])

  const handleNameSubmit = useCallback(
    (name: string) => {
      const sessionData = sessionPersistence.createNewSession(name, maxFilesPerTransfer)

      setMyId(sessionData.id)
      setMyName(sessionData.name)
      setDisplayName(sessionData.name)
      setMaxFilesPerTransfer(sessionData.maxFilesPerTransfer)
      setShowNameModal(false)

      profilePersistence.saveProfile(sessionData.id, sessionData.name)

      initializeWithStoredId(sessionData.id)
      setCurrentUserName(sessionData.name)

      toast.success(`Welcome ${sessionData.name}! Your connection key is ${sessionData.id}`, {
        duration: 4000,
        position: "bottom-right",
      })
    },
    [initializeWithStoredId, setCurrentUserName, maxFilesPerTransfer],
  )

  const copyKey = useCallback(async () => {
    console.log("[nw] Copy key button clicked")
    if (!peerId) {
      console.log("[nw] No peer ID available to copy")
      toast.error("No connection key available to copy", {
        duration: 3000,
        position: "bottom-right",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(peerId)
      setCopyFeedback(true)
      console.log("[nw] Connection key copied to clipboard:", peerId)

      toast.success("Connection key copied to clipboard!", {
        duration: 2000,
        position: "bottom-right",
      })

      setTimeout(() => {
        setCopyFeedback(false)
      }, 2000)
    } catch (error) {
      console.log("[nw] Failed to copy connection key:", error)
      toast.error("Failed to copy connection key to clipboard", {
        duration: 3000,
        position: "bottom-right",
      })
    }
  }, [peerId])

  const handleConnect = useCallback(() => {
    console.log("[nw] Connect button clicked with key:", connectKey)
    if (!connectKey.trim()) {
      console.log("[nw] Empty connection key provided")
      return
    }

    console.log("[nw] Attempting to connect to peer:", connectKey.trim())
    connectToPeer(connectKey)
    setConnectKey("")
  }, [connectKey, connectToPeer])

  const handleRegenerateKey = useCallback(() => {
    if (connectedPeers.length > 0) {
      return
    }

    const sessionData = sessionPersistence.createNewSession(myName)

    profilePersistence.saveProfile(sessionData.id, myName)

    initializeWithStoredId(sessionData.id)
    setMyId(sessionData.id)

    toast.success(`New connection key generated: ${sessionData.id}`, {
      duration: 3000,
      position: "bottom-right",
    })
  }, [connectedPeers, initializeWithStoredId, myName, myId])

  const handleFileSelect = useCallback((files: FileWithPreview[]) => {
    try {
      console.log("[nw] Files selected:", files.length)
      setSelectedFiles(files)
    } catch (error) {
      console.log("[nw] Error selecting files:", error)
      toast.error("Failed to select files. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      })
    }
  }, [])

  const handleRemoveFile = useCallback((fileId: string) => {
    try {
      setSelectedFiles((prev) => {
        const updatedFiles = prev.filter((file) => file.id !== fileId)
        return updatedFiles
      })
    } catch (error) {
      toast.error("Failed to remove file. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      })
    }
  }, [])

  const clearSelectedFiles = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    setSelectedFiles((prevFiles) => {
      prevFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      setSelectedFileIds([]) // Clear selection after resending
      return []
    })
  }, [])

  const handleSendFiles = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      console.log("[nw] Send files button clicked")

      if (selectedFiles.length === 0) {
        console.log("[nw] No files selected for sending")
        toast.error("Please select files to send.", {
          duration: 3000,
          position: "bottom-right",
        })
        return
      }

      if (!isConnected) {
        console.log("[nw] Not connected to any peers")
        toast.error("Please connect to a peer first.", {
          duration: 3000,
          position: "bottom-right",
        })
        return
      }

      try {
        const targetPeer = selectedPeer === "all" ? undefined : selectedPeer

        // Validate that the selected peer is actually connected
        if (targetPeer && !connectedPeers.includes(targetPeer)) {
          console.log("[nw] Selected peer is not connected:", targetPeer)
          toast.error("Selected peer is no longer connected. Please select a different peer.", {
            duration: 3000,
            position: "bottom-right",
          })
          // Reset to "all" if selected peer is disconnected
          setSelectedPeer("all")
          return
        }

        console.log("[nw] Sending files:", selectedFiles.length, "out of", selectedFiles.length, "total files")
        console.log("[nw] Target peer:", targetPeer || "all peers")
        console.log("[nw] Connected peers:", connectedPeers)

        for (const file of selectedFiles) {
          console.log("[nw] Sending file:", file.name, "size:", file.size, "to peer:", targetPeer || "all")
          await sendFile(file, targetPeer)
        }

        clearSelectedFiles()

        const targetDescription =
          selectedPeer === "all"
            ? `${connectedPeers.length} peer${connectedPeers.length > 1 ? "s" : ""}`
            : `peer ${selectedPeer}`

        console.log("[nw] Successfully sent", selectedFiles.length, "files to", targetDescription)
        toast.success(
          `Successfully sent ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} to ${targetDescription}`,
          {
            duration: 4000,
            position: "bottom-right",
          },
        )
      } catch (err) {
        console.log("[nw] Error sending files:", err)
        toast.error("Failed to send files. Please try again.", {
          duration: 3000,
          position: "bottom-right",
        })
      }
    },
    [selectedFiles, isConnected, sendFile, clearSelectedFiles, connectedPeers, selectedPeer, setSelectedPeer],
  )

  const handleDownloadFile = useCallback(
    async (fileTransfer: any) => {
      try {
        console.log("[nw] Download file button clicked for:", fileTransfer.name)
        console.log("[nw] File transfer details:", {
          id: fileTransfer.id,
          name: fileTransfer.name,
          size: fileTransfer.size,
          type: fileTransfer.type,
          fromPeer: fileTransfer.fromPeer,
        })

        setDownloadingFiles((prev) => new Set(prev).add(fileTransfer.id))

        downloadFile(fileTransfer)
        console.log("[nw] Download initiated for:", fileTransfer.name)

        toast.success(`Downloading ${fileTransfer.name}`, {
          duration: 2000,
          position: "bottom-right",
        })

        setTimeout(() => {
          setDownloadingFiles((prev) => {
            const newSet = new Set(prev)
            newSet.delete(fileTransfer.id)
            console.log("[nw] Download completed for:", fileTransfer.name)
            return newSet
          })
        }, 2000)
      } catch (err) {
        console.log("[nw] Error downloading file:", fileTransfer.name, "Error:", err)
        setDownloadingFiles((prev) => {
          const newSet = new Set(prev)
          newSet.delete(fileTransfer.id)
          return newSet
        })
        toast.error("Failed to download file", {
          duration: 3000,
          position: "bottom-right",
        })
      }
    },
    [downloadFile, peerInfo],
  )

  const handleSendFileToPeer = useCallback(
    async (file: File, targetPeerId: string) => {
      try {
        await sendFile(file, targetPeerId)
      } catch (error) {
        throw error
      }
    },
    [sendFile],
  )

  const handleFileCreated = useCallback((file: File) => {
    const fileWithPreview = file as FileWithPreview
    fileWithPreview.id = Math.random().toString(36).substr(2, 9)

    setSelectedFiles((prev) => [...prev, fileWithPreview])

    toast.success(`${file.name} has been added to your selection.`, {
      duration: 3000,
      position: "bottom-right",
    })
  }, [])

  const handleResendSelectedFiles = useCallback(async () => {
    const filesToResend = selectedFiles.filter((file) => selectedFileIds.includes(file.id))

    if (filesToResend.length === 0) {
      toast.error("No files selected for resending.", {
        duration: 3000,
        position: "bottom-right",
      })
      return
    }

    if (!isConnected) {
      toast.error("Please connect to a peer first.", {
        duration: 3000,
        position: "bottom-right",
      })
      return
    }

    try {
      console.log("[nw] Resending selected files:", filesToResend.length)
      const targetPeer = selectedPeer === "all" ? undefined : selectedPeer

      for (const file of filesToResend) {
        await sendFile(file, targetPeer)
      }

      setSelectedFileIds([]) // Clear selection after resending

      const targetDescription =
        selectedPeer === "all"
          ? `${connectedPeers.length} peer${connectedPeers.length > 1 ? "s" : ""}`
          : `peer ${selectedPeer}`

      toast.success(
        `Successfully resent ${filesToResend.length} file${filesToResend.length > 1 ? "s" : ""} to ${targetDescription}`,
        {
          duration: 4000,
          position: "bottom-right",
        },
      )
    } catch (err) {
      console.log("[nw] Error resending files:", err)
      toast.error("Failed to resend files. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      })
    }
  }, [selectedFiles, selectedFileIds, isConnected, sendFile, connectedPeers.length, selectedPeer])

  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    const checkFileHistory = async () => {
      try {
        const storedFiles = await fileHistoryPersistence.getReceivedFiles()
        const fileCount = storedFiles.length
        setFileHistoryCount(fileCount)

        if (fileCount > 0 && !isFileHistoryExpanded && !fileHistoryManuallyCollapsed) {
          setIsFileHistoryExpanded(true)
        }
        if (fileCount === 0) {
          setFileHistoryManuallyCollapsed(false)
        }
      } catch (error) {
        console.warn("Failed to check file history:", error)
      }
    }

    // Check immediately and then periodically
    checkFileHistory()
    const interval = setInterval(checkFileHistory, 5000)
    return () => clearInterval(interval)
  }, [isFileHistoryExpanded, fileHistoryManuallyCollapsed])

  const handleFileHistoryToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const isOpen = e.currentTarget.open
    setIsFileHistoryExpanded(isOpen)

    // If user is closing it manually, remember this preference
    if (!isOpen && fileHistoryCount > 0) {
      setFileHistoryManuallyCollapsed(true)
    }
  }

  useEffect(() => {
    if (error && error !== lastError) {
      setLastError(error)
      toast.error(error, {
        duration: 4000,
        position: "bottom-right",
      })
    }
  }, [error, lastError])

  useEffect(() => {
    // Reset selected peer to "all" if the currently selected peer disconnects
    if (selectedPeer !== "all" && !connectedPeers.includes(selectedPeer)) {
      console.log("[nw] Selected peer disconnected, resetting to 'all':", selectedPeer)
      setSelectedPeer("all")
    }
  }, [connectedPeers, selectedPeer])

  const DisabledFeature = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="opacity-50 cursor-not-allowed pointer-events-none">{children}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const handleEndAllConnections = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      disconnect()
      toast.success("All connections have been ended.", {
        duration: 3000,
        position: "bottom-right",
      })
    },
    [disconnect],
  )

  const handleConnectionStatusDisconnect = useCallback(
    (peerId?: string) => {
      if (peerId) {
        // Disconnect specific peer
        disconnectFromPeer(peerId)
      } else {
        // Disconnect from all peers
        disconnect()
      }
    },
    [disconnectFromPeer, disconnect],
  )

  const handleMaxFilesPerTransferChange = useCallback(
    (value: number) => {
      setMaxFilesPerTransfer(value)

      sessionPersistence.updateSession(myId, myName, value)

      // Keep sessionStorage for backward compatibility
      try {
        const currentSettings = JSON.parse(sessionStorage.getItem("fileTransferSettings") || "{}")
        const updatedSettings = { ...currentSettings, maxFilesPerTransfer: value }
        sessionStorage.setItem("fileTransferSettings", JSON.stringify(updatedSettings))
      } catch (error) {
        console.error("Failed to save maxFilesPerTransfer to session:", error)
      }
    },
    [myId, myName],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedFiles.length > 0) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault()
          handleSendFiles()
        } else if (e.key === "Escape") {
          e.preventDefault()
          clearSelectedFiles()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedFiles, handleSendFiles, clearSelectedFiles])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing session...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <TooltipProvider>
        <NameModal
          isOpen={showNameModal}
          onClose={() => setShowNameModal(false)}
          onSave={handleNameSubmit}
          initialName={displayName}
        />

        <CreateFileModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onFileCreated={handleFileCreated}
        />

        <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
          <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-filter supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* fix brand logo path to an existing asset */}
                {/* swap placeholder logo for provided brand logo */}
                
              </div>

              <NavigationMenu />
            </div>
          </header>

          <main className="flex-1 container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto space-y-3">
              {/* Full-width connection status box at top of content */}
              <div className="animate-slide-up">
                <ConnectionStatus
                  isConnected={isConnected}
                  connectionStatus={connectionStatus}
                  connectedPeers={connectedPeers}
                  onDisconnect={(peerId?: string) => {
                    if (peerId) disconnectFromPeer(peerId)
                  }}
                />
              </div>

              {/* Steps Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Step 1: Connect */}
                <Card
                  role="region"
                  aria-labelledby="step1-title"
                  aria-describedby="step1-desc step1-help"
                  className="animate-slide-up hover-lift-subtle"
                >
                  <CardHeader className="text-center md:text-left pb-2 sm:pb-3">
                    <div className="flex items-center justify-center md:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CardTitle id="step1-title" className="text-sm sm:text-base lg:text-lg">
                          Step 1: Connect
                        </CardTitle>
                        <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] sm:text-xs">
                          Required
                        </Badge>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="About connecting"
                            className="p-1 rounded-md border border-transparent hover:border-border"
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="end" className="max-w-[260px]">
                          Use your 6-character key to connect. You can copy or regenerate your key anytime.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <CardDescription id="step1-desc" className="text-xs sm:text-sm">
                      Share your connection key or enter a 6-character key to connect.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ConnectionHub
                      peerId={peerId}
                      isConnected={isConnected}
                      connectionStatus={connectionStatus}
                      connectedPeers={connectedPeers}
                      peerInfo={peerInfo}
                      error={error}
                      displayName={displayName}
                      connectKey={connectKey}
                      onConnectKeyChange={setConnectKey}
                      onConnect={handleConnect}
                      onCopyKey={copyKey}
                      onRegenerateKey={handleRegenerateKey}
                      onConnectToPeer={connectToPeer}
                    />
                  </CardContent>
                </Card>

                {/* Step 2: File Upload */}
                <Card
                  role="region"
                  aria-labelledby="step2-title"
                  aria-describedby="step2-desc"
                  className="animate-scale-in hover-lift-subtle border-2 border-black/80 dark:border-white/80"
                >
                  <CardHeader className="text-center md:text-left pb-2 sm:pb-3">
                    <div className="flex items-center justify-center md:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CardTitle id="step2-title" className="text-sm sm:text-base lg:text-lg">
                          Step 2: Choose Files
                        </CardTitle>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="About file selection"
                              className="p-1 rounded-md border border-transparent hover:border-border"
                            >
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start" className="max-w-[260px]">
                            Drag & drop or browse to add files. You can create a file first if you need a placeholder.
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="hidden sm:flex">
                        <Button
                          onClick={() => setShowCreateModal(true)}
                          className="text-xs sm:text-sm py-1 sm:py-2 h-7 sm:h-9 hover-scale-subtle"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Create File
                        </Button>
                      </div>
                    </div>
                    <CardDescription id="step2-desc" className="text-xs sm:text-sm">
                      Drag & drop or browse. Up to {maxFilesPerTransfer} files per transfer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mb-2 sm:mb-3">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground mb-1">
                        <span aria-live="polite">
                          Files selected: {selectedFiles.length} / {maxFilesPerTransfer}
                        </span>
                      </div>
                      <Progress
                        aria-label="Selected files progress"
                        value={Math.min(
                          100,
                          Math.round((selectedFiles.length / Math.max(1, maxFilesPerTransfer)) * 100),
                        )}
                        className="h-1.5"
                      />
                    </div>

                    <div className="mb-2 sm:mb-3 flex sm:hidden justify-start">
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="text-xs sm:text-sm py-1 sm:py-2 h-7 sm:h-9 w-[50%] hover-scale-subtle transition-all duration-200 group relative overflow-hidden"
                        aria-label="Create File"
                      >
                        <div className="absolute inset-0 bg-destructive/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-300 ease-out"></div>
                        <Plus className="h-4 w-4 sm:h-4.5 sm:w-4.5 relative z-10" />
                        <span className="hidden sm:inline ml-2 relative z-10 font-medium">Create</span>
                      </Button>
                    </div>

                    <div className="min-h-[50px] sm:min-h-[60px] lg:min-h-[80px]">
                      <FileUploadZone
                        onFileSelect={handleFileSelect}
                        selectedFiles={selectedFiles}
                        onRemoveFile={handleRemoveFile}
                        isTransferring={false}
                        transferProgress={0}
                        maxFiles={maxFilesPerTransfer}
                        showCheckboxes={false}
                        selectedFileIds={selectedFileIds}
                        onFileSelectionChange={setSelectedFileIds}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedFiles.length > 0 && (
                <div className="fixed bottom-2 left-0 w-full md:bottom-4 z-40">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-primary/40"></div>
                  </div>

                  <div className="px-2 sm:px-4 pb-1 sm:pb-2">
                    <div className="bg-card border-2 border-primary/20 rounded-xl shadow-xl p-2 sm:p-3 min-w-0 overflow-hidden relative">
                      <div className="absolute inset-x-4 top-0 h-1 bg-primary/30 rounded-b-full" />

                      <div className="mb-2 sm:mb-2.5 mt-1">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1 bg-primary/10 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 border border-primary/30">
                              <Archive className="h-3 w-3 text-primary" />
                              <span className="text-[10px] sm:text-xs font-semibold text-primary">
                                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5 border border-border/30">
                              {(() => {
                                const types = {
                                  images: selectedFiles.filter((f) => f.type.startsWith("image/")).length,
                                  videos: selectedFiles.filter((f) => f.type.startsWith("video/")).length,
                                  docs: selectedFiles.filter(
                                    (f) => f.type.includes("pdf") || f.type.includes("document"),
                                  ).length,
                                  other: 0,
                                }
                                types.other = selectedFiles.length - types.images - types.videos - types.docs

                                return (
                                  <>
                                    {types.images > 0 && (
                                      <span className="flex items-center gap-0.5">
                                        <FileImage className="h-2.5 w-2.5 text-blue-500" />
                                        {types.images}
                                      </span>
                                    )}
                                    {types.videos > 0 && (
                                      <span className="flex items-center gap-0.5">
                                        <FileVideo className="h-2.5 w-2.5 text-rose-500" />
                                        {types.videos}
                                      </span>
                                    )}
                                    {types.docs > 0 && (
                                      <span className="flex items-center gap-0.5">
                                        <FileText className="h-2.5 w-2.5 text-amber-500" />
                                        {types.docs}
                                      </span>
                                    )}
                                    {types.other > 0 && (
                                      <span className="flex items-center gap-0.5">
                                        <File className="h-2.5 w-2.5 text-muted-foreground" />
                                        {types.other}
                                      </span>
                                    )}
                                  </>
                                )
                              })()}
                            </div>

                            <div className="text-[10px] text-muted-foreground bg-blue-500/10 rounded-md px-1.5 py-0.5 border border-blue-500/20">
                              <HardDrive className="inline h-2.5 w-2.5 mr-0.5 text-blue-500" />
                              {(selectedFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)}{" "}
                              MB
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFileDetailsExpanded(!isFileDetailsExpanded)}
                            className="h-6 w-6 p-0 hover:bg-primary/10 rounded-full border border-transparent hover:border-primary/30 transition-all duration-200"
                            aria-label={isFileDetailsExpanded ? "Hide file details" : "Show file details"}
                          >
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                                isFileDetailsExpanded ? "rotate-180 text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                        </div>

                        {isConnected && (
                          <div className="hidden sm:flex mb-2 pb-2 border-b border-border/50">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 bg-green-500/10 rounded-md px-1.5 py-0.5 border border-green-500/20">
                                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-medium text-green-600">
                                  {connectedPeers.length} peer{connectedPeers.length !== 1 ? "s" : ""}
                                </span>
                              </div>

                              <div className="hidden lg:flex items-center gap-1 text-[10px] text-muted-foreground bg-amber-500/10 rounded-md px-1.5 py-0.5 border border-amber-500/20">
                                <Zap className="h-2.5 w-2.5 text-amber-500" />
                                <span>
                                  ~
                                  {Math.ceil(
                                    selectedFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024) / 2,
                                  )}
                                  s
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {isFileDetailsExpanded && (
                          <div
                            className="space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent transition-all duration-300 ease-out mb-2"
                            style={{
                              maxHeight: selectedFiles.length > 3 ? "120px" : "auto",
                              minHeight: selectedFiles.length > 0 ? "40px" : "0px",
                            }}
                          >
                            <div id="file-selection-status" className="sr-only" aria-live="polite">
                              {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected. Sending to{" "}
                              {selectedPeer === "all" ? `all peers (${connectedPeers.length})` : "selected peer"}.
                            </div>

                            <ul role="list" aria-describedby="file-selection-status" className="space-y-1.5">
                              {selectedFiles.map((file, index) => {
                                const getGlassTone = (f: File) => {
                                  const type = f.type.toLowerCase()
                                  const name = f.name.toLowerCase()
                                  if (type.startsWith("image/"))
                                    return "from-sky-500/18 to-sky-600/10 border-sky-400/25"
                                  if (type.startsWith("video/"))
                                    return "from-rose-500/18 to-rose-600/10 border-rose-400/25"
                                  if (type.startsWith("audio/") || name.endsWith(".mp3") || name.endsWith(".wav"))
                                    return "from-emerald-500/18 to-emerald-600/10 border-emerald-400/25"
                                  if (type.includes("pdf")) return "from-rose-500/18 to-rose-600/10 border-rose-400/25"
                                  if (/\.(zip|rar|7z)$/i.test(name))
                                    return "from-amber-500/18 to-amber-600/10 border-amber-400/25"
                                  if (/\.(js|ts|jsx|tsx|py|java)$/i.test(name))
                                    return "from-emerald-500/18 to-emerald-600/10 border-emerald-400/25"
                                  if (/\.(sql|db)$/i.test(name))
                                    return "from-amber-500/18 to-amber-600/10 border-amber-400/25"
                                  if (/\.(ppt|pptx)$/i.test(name))
                                    return "from-amber-500/18 to-amber-600/10 border-amber-400/25"
                                  if (/\.(xls|xlsx|csv)$/i.test(name))
                                    return "from-amber-500/18 to-amber-600/10 border-amber-400/25"
                                  return "from-zinc-500/15 to-zinc-600/10 border-zinc-400/20"
                                }

                                const getIcon = (f: File) => {
                                  const type = f.type.toLowerCase()
                                  const name = f.name.toLowerCase()
                                  if (type.startsWith("image/"))
                                    return (
                                      <FileImage className="h-5 w-5 text-sky-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  if (type.startsWith("video/"))
                                    return (
                                      <FileVideo className="h-5 w-5 text-rose-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  if (type.startsWith("audio/") || /\.(mp3|wav)$/i.test(name))
                                    return (
                                      <Music className="h-5 w-5 text-emerald-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  if (type.includes("pdf"))
                                    return (
                                      <FileText className="h-5 w-5 text-rose-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  if (/\.(zip|rar|7z)$/i.test(name))
                                    return (
                                      <Archive className="h-5 w-5 text-amber-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  if (/\.(js|ts|jsx|tsx|py|java)$/i.test(name))
                                    return (
                                      <Code className="h-5 w-5 text-emerald-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  if (/\.(sql|db)$/i.test(name))
                                    return (
                                      <Database className="h-5 w-5 text-amber-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  if (/\.(ppt|pptx)$/i.test(name))
                                    return (
                                      <Presentation className="h-5 w-5 text-amber-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  if (/\.(xls|xlsx|csv)$/i.test(name))
                                    return (
                                      <Sheet className="h-5 w-5 text-amber-400 group-hover:rotate-6 transition-transform" />
                                    )
                                  return (
                                    <File className="h-5 w-5 text-zinc-400 group-hover:rotate-6 transition-transform" />
                                  )
                                }

                                const ext = (file.name.split(".").pop() || "").toUpperCase()
                                const uploadTime = new Date()
                                const uploadTimeText = `${uploadTime.toLocaleDateString()} • ${uploadTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`

                                return (
                                  <li
                                    key={file.id}
                                    role="listitem"
                                    aria-label={`${file.name}, ${ext || "FILE"}, ${(file.size / 1024).toFixed(1)} KB, uploaded ${uploadTimeText}`}
                                    className={`flex items-center justify-between bg-white/10 dark:bg-neutral-900/25 bg-clip-padding backdrop-blur-xl border ${getGlassTone(file)} rounded-lg px-2 py-1.5 group hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-200 opacity-0 animate-fade-in`}
                                    style={{
                                      animationDelay: `${Math.min(index * 50, 300)}ms`,
                                      animationFillMode: "forwards",
                                    }}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div className="flex-shrink-0 p-1 rounded-md bg-white/10 backdrop-blur-sm ring-1 ring-white/10">
                                        {getIcon(file)}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div
                                          className="text-xs font-semibold truncate text-foreground/95 tracking-tight"
                                          title={file.name}
                                        >
                                          {file.name}
                                        </div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-foreground/70">
                                          <span className="inline-flex items-center gap-0.5 bg-white/8 px-1.5 py-0.5 rounded-full ring-1 ring-white/10">
                                            <BadgeInfo className="h-2.5 w-2.5" />
                                            {ext || "FILE"}
                                          </span>
                                          <span className="inline-flex items-center gap-0.5 bg-white/8 px-1.5 py-0.5 rounded-full ring-1 ring-white/10">
                                            <HardDrive className="h-2.5 w-2.5" />
                                            {(file.size / 1024).toFixed(1)} KB
                                          </span>
                                          <span className="hidden md:inline-flex items-center gap-0.5 bg-white/8 px-1.5 py-0.5 rounded-full ring-1 ring-white/10">
                                            <CalendarDays className="h-2.5 w-2.5" />
                                            {uploadTimeText}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveFile(file.id)
                                      }}
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-rose-500/15 hover:text-rose-400 rounded-full hover:scale-105 ring-1 ring-transparent hover:ring-rose-400/25"
                                      aria-label={`Remove ${file.name}`}
                                      title={`Remove ${file.name}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}

                        <div
                          className="flex items-center justify-between gap-2"
                          tabIndex={0}
                          aria-label="File actions: send or clear selection"
                          onKeyDown={(e) => {
                            // Respect system preferences to avoid surprise actions while composing
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                              if (isConnected && selectedFiles.length > 0) {
                                e.preventDefault()
                                handleSendFiles()
                              }
                            } else if (e.key === "Escape") {
                              if (selectedFiles.length > 0) {
                                e.preventDefault()
                                clearSelectedFiles()
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <label className="text-[10px] font-medium items-center gap-1 hidden lg:flex text-muted-foreground">
                              <Users className="h-3 w-3 text-primary" />
                              To:
                            </label>
                            <Select value={selectedPeer} onValueChange={setSelectedPeer}>
                              <SelectTrigger className="border border-border/50 bg-background/80 hover:bg-accent hover:text-accent-foreground h-7 sm:h-8 text-[10px] sm:text-xs w-[90px] sm:w-[110px] md:w-[130px] hover-scale-subtle transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl">
                                <SelectItem value="all" className="hover:bg-accent/80 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <Users className="h-3 w-3 text-primary" />
                                      <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                                    </div>
                                    <span className="text-xs font-medium">All ({connectedPeers.length})</span>
                                  </div>
                                </SelectItem>
                                {connectedPeers.map((peer) => (
                                  <SelectItem key={peer} value={peer} className="hover:bg-accent/80 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <div className="relative">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                                      </div>
                                      <span className="text-xs font-medium">{peer.slice(0, 8)}...</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            {!isConnected ? (
                              <div
                                className="flex items-center gap-1.5 bg-destructive/10 rounded-md px-2 py-1 border border-destructive/20 animate-pulse"
                                role="status"
                                aria-live="polite"
                              >
                                <WifiOff className="h-3 w-3 text-destructive animate-pulse" />
                                <span className="text-[10px] sm:text-xs font-medium text-destructive">
                                  Not connected
                                </span>
                              </div>
                            ) : (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        onClick={handleSendFiles}
                                        disabled={selectedFiles.length === 0}
                                        aria-disabled={selectedFiles.length === 0}
                                        title={
                                          selectedFiles.length === 0
                                            ? "Select files to enable Send"
                                            : `Send ${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`
                                        }
                                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl h-7 sm:h-8 text-[10px] sm:text-xs px-3 sm:px-4 shrink-0 hover-scale-subtle transition-all duration-200 font-semibold border border-green-500/20 relative overflow-hidden group"
                                        aria-label={`Send ${selectedFiles.length} files to ${selectedPeer === "all" ? "all peers" : "selected peer"}`}
                                      >
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
                                        <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 relative z-10" />
                                        <span className="relative z-10">Send {selectedFiles.length}</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-popover text-popover-foreground border border-border shadow-lg"
                                    >
                                      <p>
                                        Send files to {selectedPeer === "all" ? "all connected peers" : "selected peer"}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">Shortcut: Ctrl/Cmd+Enter</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        onClick={clearSelectedFiles}
                                        disabled={selectedFiles.length === 0}
                                        aria-disabled={selectedFiles.length === 0}
                                        title={
                                          selectedFiles.length === 0 ? "No files selected" : "Clear all selected files"
                                        }
                                        variant="outline"
                                        className="hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 bg-background/80 backdrop-blur-sm h-7 sm:h-8 px-2 sm:px-3 shrink-0 hover-scale-subtle transition-all duration-200 border-border/50 group relative overflow-hidden"
                                        aria-label="Clear all selected files"
                                      >
                                        <div className="absolute inset-0 bg-destructive/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-300 ease-out"></div>
                                        <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 relative z-10" />
                                        <span className="hidden sm:inline ml-1 relative z-10 font-medium text-[10px] sm:text-xs">
                                          Clear
                                        </span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-popover text-popover-foreground border border-border shadow-lg"
                                    >
                                      <p>Remove all selected files</p>
                                      <p className="text-xs text-muted-foreground mt-1">Shortcut: Escape</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mt-1 px-1">
                          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full"></div>
                          <div className="text-center mt-0.5" role="status" aria-live="polite">
                            <span className="text-[10px] text-muted-foreground/80">
                              {selectedFiles.length > 0 ? "Ready to transfer • Click send" : "No files selected"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <FeatureDashboard
                chatMessages={chatMessages}
                connectedPeers={connectedPeers}
                peerInfo={peerInfo}
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
                currentUserId={peerId}
                analytics={analytics}
                peerId={peerId}
                displayName={displayName}
                onSendFile={handleSendFileToPeer}
                onDisconnectPeer={disconnectFromPeer}
                fileHistoryCount={fileHistoryCount}
              />

              <div className="animate-slide-up">
                <TransferStatus
                  incomingFiles={incomingFiles}
                  outgoingFiles={outgoingFiles}
                  onDownloadFile={(fileTransfer) => {
                    downloadFile(fileTransfer)
                  }}
                  onClearTransfers={() => {
                    clearTransfers()
                  }}
                  downloadingFiles={downloadingFiles}
                />
              </div>
            </div>
          </main>

          <AppFooter />
        </div>

        {selectedFiles.length === 0 && (
          <FloatingSettingsBubble
            chunkSize={chunkSize}
            autoDownload={autoDownload}
            maxFilesPerTransfer={maxFilesPerTransfer}
            onChunkSizeChange={updateChunkSize}
            onAutoDownloadChange={updateAutoDownload}
            onMaxFilesPerTransferChange={handleMaxFilesPerTransferChange}
          />
        )}
      </TooltipProvider>

      <div className="sr-only" role="status" aria-live="polite">
        {isConnected && connectedPeers.length > 0
          ? `Connected to ${connectedPeers.length} ${connectedPeers.length > 1 ? "peers" : "peer"}`
          : "Disconnected"}
      </div>
    </>
  )
}
