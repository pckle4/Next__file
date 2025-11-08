"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Download,
  Trash2,
  X,
  Users,
  ImageIcon,
  Video,
  Music,
  Archive,
  File,
  FileSpreadsheet,
  Presentation,
  Code,
  Calendar,
  Hash,
  Activity,
  Clock,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { fileHistoryPersistence } from "@/lib/file-history-persistence"
import { formatFullTimestamp } from "@/utils/ist-time"

interface ReceivedFile {
  id: string
  name: string
  size: number
  type: string
  blob?: Blob
  timestamp: number
  peerId: string
  peerName?: string
}

interface ReceivedFilesPanelProps {
  className?: string
}

const getFileIcon = (fileName: string, isIncoming = true) => {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  // Slightly different colors for incoming vs outgoing files
  const colorVariant = isIncoming ? "500" : "600"

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
    case "bmp":
    case "ico":
      return <ImageIcon className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-${colorVariant}`} />
    case "mp4":
    case "avi":
    case "mov":
    case "mkv":
    case "webm":
    case "flv":
    case "wmv":
      return <Video className={`h-4 w-4 sm:h-5 sm:w-5 text-purple-${colorVariant}`} />
    case "mp3":
    case "wav":
    case "flac":
    case "aac":
    case "ogg":
    case "wma":
      return <Music className={`h-4 w-4 sm:h-5 sm:w-5 text-green-${colorVariant}`} />
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
    case "bz2":
      return <Archive className={`h-4 w-4 sm:h-5 sm:w-5 text-orange-${colorVariant}`} />
    case "pdf":
      return <FileText className={`h-4 w-4 sm:h-5 sm:w-5 text-red-${colorVariant}`} />
    case "doc":
    case "docx":
    case "txt":
    case "rtf":
    case "odt":
      return <FileText className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-${colorVariant}`} />
    case "xls":
    case "xlsx":
    case "csv":
    case "ods":
      return <FileSpreadsheet className={`h-4 w-4 sm:h-5 sm:w-5 text-emerald-${colorVariant}`} />
    case "ppt":
    case "pptx":
    case "odp":
      return <Presentation className={`h-4 w-4 sm:h-5 sm:w-5 text-orange-${colorVariant}`} />
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
    case "json":
    case "xml":
    case "py":
    case "java":
    case "cpp":
    case "c":
    case "php":
    case "rb":
    case "go":
    case "rs":
      return <Code className={`h-4 w-4 sm:h-5 sm:w-5 text-cyan-${colorVariant}`} />
    default:
      return <File className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-${colorVariant}`} />
  }
}

const getAccentColor = (fileName: string, isIncoming = true) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  const base = (() => {
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return "text-blue-500"
    if (["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv"].includes(ext)) return "text-rose-500"
    if (["mp3", "wav", "flac", "aac", "ogg", "wma"].includes(ext)) return "text-emerald-500"
    if (["zip", "rar", "7z", "tar", "gz", "bz2", "xls", "xlsx", "csv", "ods"].includes(ext)) return "text-amber-500"
    if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "html",
        "css",
        "json",
        "xml",
        "py",
        "java",
        "cpp",
        "c",
        "php",
        "rb",
        "go",
        "rs",
      ].includes(ext)
    )
      return "text-emerald-500"
    if (ext === "pdf") return "text-rose-500"
    return "text-gray-500"
  })()
  // Slightly deeper shade for outgoing-like variants if needed
  return isIncoming ? base : base
}

const getExtension = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase() : "—")

export function ReceivedFilesPanel({ className }: ReceivedFilesPanelProps) {
  const [files, setFiles] = useState<ReceivedFile[]>([])
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortOrder, setSortOrder] = useState<"new" | "old">("new")

  useEffect(() => {
    loadFiles()
    const interval = setInterval(loadFiles, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadFiles = async () => {
    try {
      const storedFiles = await fileHistoryPersistence.getReceivedFiles()
      setFiles(storedFiles)
    } catch (error) {
      console.warn("Failed to load received files:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "unknown"
    const typeMap: { [key: string]: string } = {
      pdf: "PDF",
      doc: "DOC",
      docx: "DOCX",
      txt: "TXT",
      jpg: "JPG",
      jpeg: "JPEG",
      png: "PNG",
      gif: "GIF",
      mp4: "MP4",
      mp3: "MP3",
      zip: "ZIP",
      rar: "RAR",
    }
    return typeMap[extension] || extension.toUpperCase()
  }

  const formatTimestamp = (timestamp: number) => {
    return formatFullTimestamp(new Date(timestamp))
  }

  const handleDownload = async (file: ReceivedFile) => {
    setDownloadingFiles((prev) => new Set(prev).add(file.id))

    try {
      await fileHistoryPersistence.downloadFile(file.id)
    } catch (error) {
      console.warn("Failed to download file:", error)
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(file.id)
        return newSet
      })
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileHistoryPersistence.deleteFile(fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (error) {
      console.warn("Failed to delete file:", error)
    }
  }

  const handleClearAll = async () => {
    try {
      await fileHistoryPersistence.clearAllFiles()
      setFiles([])
    } catch (error) {
      console.warn("Failed to clear all files:", error)
    }
  }

  const getPeerColor = (peerId: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
    ]

    let hash = 0
    for (let i = 0; i < peerId.length; i++) {
      hash = ((hash << 5) - hash + peerId.charCodeAt(i)) & 0xffffffff
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const formatPeerId = (peerId: string, peerName?: string) => {
    if (peerId === "unknown") return "Unknown"
    return peerId.length > 8 ? `${peerId.substring(0, 8)}...` : peerId
  }

  const displayLimit = 50
  const sortedFiles = [...files].sort((a, b) =>
    sortOrder === "new" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
  )
  const displayedFiles = sortedFiles.slice(0, displayLimit)
  const hasMoreFiles = sortedFiles.length > displayLimit

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            File History
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {files.length}
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {files.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="h-8 px-3 text-xs sm:text-sm text-destructive hover:bg-destructive/10 bg-transparent"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayedFiles.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
            <p className="text-xs sm:text-sm">No files received yet</p>
            <p className="text-xs mt-1">Files will appear here when received from peers</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedFiles.map((file) => {
              const accent = getAccentColor(file.name, true)
              const expiryText = formatFullTimestamp(new Date(file.timestamp + 24 * 60 * 60 * 1000)) // +24h
              const isDownloading = downloadingFiles.has(file.id)

              return (
                <div
                  key={file.id}
                  className="group p-3 border border-white/10 rounded-xl bg-background/40 backdrop-blur-md hover:bg-background/60 transition-colors flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex rounded-lg bg-background/50 p-2 border border-white/10">
                      {getFileIcon(file.name, true) /* colored by type already */}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Hash className={`h-3 w-3 ${accent}`} />
                          {getExtension(file.name)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileText className={`h-3 w-3 ${accent}`} />
                          {getFileType(file.name)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Activity className={`h-3 w-3 ${accent}`} />
                          {formatFileSize(file.size)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className={`h-3 w-3 ${accent}`} />
                          Received: {formatFullTimestamp(new Date(file.timestamp))}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className={`h-3 w-3 ${accent}`} />
                          Expires: {expiryText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {file.peerName && (
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPeerColor(file.peerId)}`}
                      >
                        <Users className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-[10rem]">{file.peerName}</span>
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPeerColor(file.peerId)} ${file.peerName ? "opacity-75" : ""}`}
                    >
                      ID: {formatPeerId(file.peerId)}
                    </span>

                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(file)}
                        disabled={isDownloading}
                        className="h-8 px-3 text-xs font-medium bg-primary hover:bg-primary/90 transition-all hover:shadow-md disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin flex-shrink-0" />
                        ) : (
                          <Download className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        )}
                        <span className="whitespace-nowrap">{isDownloading ? "Downloading..." : "Download"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all"
                      >
                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <>
            {displayedFiles.map((file) => {
              const accent = getAccentColor(file.name, true)
              const expiryText = formatFullTimestamp(new Date(file.timestamp + 24 * 60 * 60 * 1000)) // +24h
              const isDownloading = downloadingFiles.has(file.id)

              return (
                <div
                  key={file.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-white/10 rounded-xl bg-background/40 backdrop-blur-md hover:bg-background/60 transition-colors"
                >
                  <span className="inline-flex rounded-lg bg-background/50 p-2 border border-white/10 flex-shrink-0">
                    {getFileIcon(file.name, true)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Hash className={`h-3 w-3 ${accent}`} />
                        {getExtension(file.name)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className={`h-3 w-3 ${accent}`} />
                        {getFileType(file.name)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Activity className={`h-3 w-3 ${accent}`} />
                        {formatFileSize(file.size)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className={`h-3 w-3 ${accent}`} />
                        Received: {formatTimestamp(file.timestamp)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className={`h-3 w-3 ${accent}`} />
                        Expires: {expiryText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={isDownloading}
                      className="flex-1 sm:flex-initial h-9 px-4 text-sm font-medium bg-primary hover:bg-primary/90 transition-all hover:shadow-md disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                          <span className="whitespace-nowrap">Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="whitespace-nowrap">Download</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="h-9 px-3 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
            {hasMoreFiles && (
              <div className="text-center py-3 text-sm text-muted-foreground border-t border-border/50">
                Showing {displayLimit} of {sortedFiles.length} files.
                <span className="text-xs block mt-1">Older files are hidden to improve performance</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
