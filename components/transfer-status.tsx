"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  X,
  ArrowDown,
  ArrowUp,
  Activity,
  Wifi,
  Loader2,
  Calendar,
  Hash,
} from "lucide-react"
import type { FileTransfer } from "@/hooks/use-peer-connection"
import { useCallback } from "react"
import { formatFullTimestamp } from "@/utils/ist-time"

interface TransferStatusProps {
  incomingFiles: FileTransfer[]
  outgoingFiles: FileTransfer[]
  onDownloadFile: (fileTransfer: FileTransfer) => void
  onClearTransfers: () => void
  autoDownload?: boolean
  downloadingFiles?: Set<string>
}

export function TransferStatus({
  incomingFiles,
  outgoingFiles,
  onDownloadFile,
  onClearTransfers,
  autoDownload = false,
  downloadingFiles = new Set(),
}: TransferStatusProps) {
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
      exe: "EXE",
      js: "JS",
      ts: "TS",
      html: "HTML",
      css: "CSS",
      json: "JSON",
    }
    return typeMap[extension] || extension.toUpperCase()
  }

  const getStatusIcon = (status: FileTransfer["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "transferring":
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: FileTransfer["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-200/50"
      case "error":
        return "bg-red-500/10 text-red-600 border-red-200/50"
      case "transferring":
        return "bg-blue-500/10 text-blue-600 border-blue-200/50"
      default:
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200/50"
    }
  }

  const handleDownload = useCallback(
    (file: FileTransfer) => {
      try {
        if (file.status !== "completed") {
          return
        }

        let blob: Blob | null = null

        if (file.file && file.file instanceof File) {
          blob = file.file
        } else if (file.data) {
          if (file.data instanceof ArrayBuffer) {
            blob = new Blob([file.data])
          } else if (file.data instanceof Uint8Array) {
            blob = new Blob([file.data])
          } else {
            blob = new Blob([file.data])
          }
        }

        if (!blob) {
          onDownloadFile(file)
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = file.name
        link.style.display = "none"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      } catch (error) {
        onDownloadFile(file)
      }
    },
    [onDownloadFile],
  )

  const handleFileSelection = (fileId: string, checked: boolean) => {}

  const downloadSelectedFiles = () => {}

  const downloadAllFiles = () => {
    const filesToDownload = incomingFiles.filter((file) => file.status === "completed")

    filesToDownload.forEach((file, index) => {
      setTimeout(() => handleDownload(file), 100 * index)
    })
  }

  const handleClearTransfers = () => {
    onClearTransfers()
  }

  const hasTransfers = incomingFiles.length > 0 || outgoingFiles.length > 0
  const activeTransfers = [...incomingFiles, ...outgoingFiles].filter((f) => f.status === "transferring")

  if (!hasTransfers) {
    return null
  }

  const getAccentColor = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || ""
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return "text-blue-500"
    if (["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv"].includes(ext)) return "text-rose-500"
    if (["mp3", "wav", "flac", "aac", "ogg", "wma"].includes(ext)) return "text-emerald-500"
    if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) return "text-amber-500"
    if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "text-amber-500"
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
  }

  const getExtension = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase() : "—")

  return (
    <div className="space-y-4">
      {activeTransfers.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">
                  {activeTransfers.length} active transfer{activeTransfers.length > 1 ? "s" : ""}
                </span>
              </div>
              <Wifi className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {incomingFiles.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-md border border-white/10 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowDown className="h-5 w-5 text-primary" />
                Incoming Files
                <Badge variant="secondary" className="text-sm">
                  {incomingFiles.length}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={downloadAllFiles} className="h-8 px-3 text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingFiles.map((file) => {
              const accent = getAccentColor(file.name)
              const ext = getExtension(file.name)
              const receivedText = file.timestamp
                ? formatFullTimestamp(new Date(file.timestamp))
                : formatFullTimestamp(new Date())

              return (
                <div
                  key={file.id}
                  className="group rounded-xl border border-white/10 bg-background/40 backdrop-blur-md px-3 py-3 sm:px-4 sm:py-3 hover:bg-background/60 transition-colors"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <FileText
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${accent} transition-transform duration-200 group-hover:scale-110`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Hash className={`h-3 w-3 ${accent}`} />
                          {ext}
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
                          Received: {receivedText}
                        </span>
                      </div>

                      {file.status === "transferring" && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-1" />
                          <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                            {file.progress.toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`rounded-full border px-2 py-1 text-[10px] sm:text-xs ${getStatusColor(file.status)}`}
                      >
                        {getStatusIcon(file.status)}
                      </div>
                      {file.status === "completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleDownload(file)}
                          disabled={downloadingFiles.has(file.id)}
                          className="h-8 px-3 text-xs sm:text-sm"
                          title="Download file"
                        >
                          {downloadingFiles.has(file.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Download className={`h-4 w-4 mr-2 ${accent}`} />
                          )}
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {outgoingFiles.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-md border border-white/10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUp className="h-5 w-5 text-accent" />
              Outgoing Files
              <Badge variant="secondary" className="text-sm">
                {outgoingFiles.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outgoingFiles.map((file) => {
              const accent = getAccentColor(file.name)
              const ext = getExtension(file.name)
              const lastMod =
                file.file && file.file instanceof File && file.file.lastModified
                  ? new Date(file.file.lastModified)
                  : null
              const lastModText = lastMod ? formatFullTimestamp(lastMod) : "Unknown"
              const sentText = file.timestamp
                ? formatFullTimestamp(new Date(file.timestamp))
                : formatFullTimestamp(new Date())

              return (
                <div
                  key={file.id}
                  className="group rounded-xl border border-white/10 bg-background/40 backdrop-blur-md px-3 py-3 sm:px-4 sm:py-3 hover:bg-background/60 transition-colors"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <FileText
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${accent} transition-transform duration-200 group-hover:scale-110`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Hash className={`h-3 w-3 ${accent}`} />
                          {ext}
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
                          Sent: {sentText}
                        </span>
                      </div>

                      {file.status === "transferring" && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-1" />
                          <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                            {file.progress.toFixed(1)}% sent
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <div
                        className={`rounded-full border px-2 py-1 text-[10px] sm:text-xs ${getStatusColor(file.status)}`}
                      >
                        {getStatusIcon(file.status)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/50 backdrop-blur-sm border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <span>Total: {incomingFiles.length + outgoingFiles.length}</span>
              <span className="text-green-600">
                Completed:{" "}
                {incomingFiles.filter((f) => f.status === "completed").length +
                  outgoingFiles.filter((f) => f.status === "completed").length}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearTransfers}
              className="h-8 px-3 text-sm text-destructive hover:bg-destructive/10 bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
