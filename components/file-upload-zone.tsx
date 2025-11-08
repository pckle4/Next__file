"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  File,
  CloudUpload,
  Sparkles,
  Zap,
  Shield,
  Lock,
  ShieldCheck,
  Activity,
  CalendarDays,
  Tags,
  BadgeInfo,
  HardDrive,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getFileMetadata, formatFullTimestamp } from "@/utils/ist-time"
import { AnimatedIcon, kindFromFilename } from "@/components/animated-icon"

interface FileWithPreview extends File {
  id: string
  preview?: string
  metadata?: any
}

interface FileUploadZoneProps {
  onFileSelect: (files: FileWithPreview[]) => void
  selectedFiles: FileWithPreview[]
  onRemoveFile: (fileId: string) => void
  isTransferring: boolean
  transferProgress: number
  maxFiles: number
  className?: string
  selectedFileIds?: string[]
  onFileSelectionChange?: (fileIds: string[]) => void
  showCheckboxes?: boolean
}

const getFileIcon = (file: File) => {
  const type = file.type.toLowerCase()
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("video/")) return Video
  if (type.startsWith("audio/")) return Music
  if (type.includes("zip") || type.includes("rar") || type.includes("7z")) return Archive
  if (type.includes("text") || type.includes("document")) return FileText
  return File
}

const getFileTypeColor = (file: File) => {
  const type = file.type.toLowerCase()
  if (type.startsWith("image/")) return "bg-blue-100 text-blue-700 border-blue-300"
  if (type.startsWith("video/")) return "bg-purple-100 text-purple-700 border-purple-300"
  if (type.startsWith("audio/")) return "bg-green-100 text-green-700 border-green-300"
  if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
    return "bg-orange-100 text-orange-700 border-orange-300"
  if (type.includes("text")) return "bg-gray-100 text-gray-700 border-gray-300"
  if (type.includes("pdf")) return "bg-red-100 text-red-700 border-red-300"
  return "bg-slate-100 text-slate-700 border-slate-300"
}

const getFileTypeDescription = (file: File) => {
  const type = file.type.toLowerCase()
  const extension = file.name.split(".").pop()?.toUpperCase() || "FILE"

  if (type.startsWith("image/")) return `${extension} Image`
  if (type.startsWith("video/")) return `${extension} Video`
  if (type.startsWith("audio/")) return `${extension} Audio`
  if (type.includes("zip") || type.includes("rar") || type.includes("7z")) return `${extension} Archive`
  if (type.includes("text")) return `${extension} Text`
  if (type.includes("pdf")) return "PDF Document"
  if (type.includes("document") || type.includes("word")) return `${extension} Document`
  if (type.includes("sheet") || type.includes("excel")) return `${extension} Spreadsheet`
  if (type.includes("presentation") || type.includes("powerpoint")) return `${extension} Presentation`
  return `${extension} File`
}

export function FileUploadZone({
  onFileSelect,
  selectedFiles,
  onRemoveFile,
  isTransferring,
  transferProgress,
  maxFiles,
  className,
  selectedFileIds = [],
  onFileSelectionChange,
  showCheckboxes = false,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createFileWithPreview = useCallback(async (file: File): Promise<FileWithPreview> => {
    try {
      const fileWithPreview = file as FileWithPreview
      fileWithPreview.id = Math.random().toString(36).substr(2, 9)

      const metadata = getFileMetadata(file)
      ;(fileWithPreview as any).metadata = {
        ...metadata,
        uploadTime: Date.now(),
        extUpper: file.name.split(".").pop()?.toUpperCase() || "FILE",
      }

      if (file.type.startsWith("image/")) {
        try {
          const preview = URL.createObjectURL(file)
          fileWithPreview.preview = preview
        } catch (error) {}
      }
      return fileWithPreview
    } catch (error) {
      throw error
    }
  }, [])

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      try {
        const fileArray = Array.from(files)
        const remainingSlots = maxFiles - selectedFiles.length

        if (fileArray.length > remainingSlots) {
          fileArray.splice(remainingSlots)
        }

        const filesWithPreviews = await Promise.all(fileArray.map(createFileWithPreview))

        const newFilesList = [...selectedFiles, ...filesWithPreviews]

        onFileSelect(newFilesList)
      } catch (error) {}
    },
    [selectedFiles, maxFiles, onFileSelect, createFileWithPreview],
  )

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        handleFileSelect(files)
      }
      event.target.value = ""
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragOver(false)
      const files = event.dataTransfer.files
      if (files) {
        handleFileSelect(files)
      }
    },
    [handleFileSelect],
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileCheckboxChange = useCallback(
    (fileId: string, checked: boolean) => {
      if (!onFileSelectionChange) return

      if (checked) {
        onFileSelectionChange([...selectedFileIds, fileId])
      } else {
        onFileSelectionChange(selectedFileIds.filter((id) => id !== fileId))
      }
    },
    [selectedFileIds, onFileSelectionChange],
  )

  const handleSelectAllFiles = useCallback(() => {
    if (!onFileSelectionChange) return

    const allFileIds = selectedFiles.map((file) => file.id)
    onFileSelectionChange(allFileIds)
  }, [selectedFiles, onFileSelectionChange])

  const handleDeselectAllFiles = useCallback(() => {
    if (!onFileSelectionChange) return

    onFileSelectionChange([])
  }, [onFileSelectionChange])

  return (
    <div className={cn("space-y-6", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-500 cursor-pointer group overflow-hidden",
          "bg-card/50 backdrop-blur-sm",
          isDragOver
            ? "border-primary/60 bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20"
            : selectedFiles.length > 0
              ? "border-accent/40 hover:border-accent/60 hover:bg-accent/5"
              : "border-border/40 hover:border-primary/40 hover:bg-primary/5",
          isTransferring && "pointer-events-none opacity-60",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isTransferring && fileInputRef.current?.click()}
      >
        <div className="relative space-y-2 sm:space-y-4">
          <div
            className={cn(
              "mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 relative overflow-hidden",
              "bg-background/50 border border-border/30",
              isDragOver
                ? "bg-primary/20 text-primary border-primary/40 shadow-lg shadow-primary/20"
                : "text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30",
            )}
          >
            {isDragOver ? (
              <CloudUpload className="h-6 w-6 sm:h-8 sm:w-8 animate-bounce" />
            ) : (
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 transition-transform duration-300 group-hover:scale-110" />
            )}
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <h3
                className={cn(
                  "text-base sm:text-lg font-bold transition-colors duration-300",
                  isDragOver ? "text-primary" : "text-foreground group-hover:text-primary",
                )}
              >
                {isDragOver ? "Drop your files here!" : "Upload your files"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length}/${maxFiles} files selected`
                  : `Drag & drop up to ${maxFiles} files or click to browse`}
              </p>
            </div>

            <div className="hidden sm:flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-card border border-border rounded-full hover-lift group">
                <Sparkles className="h-3 w-3" />
                <span className="text-xs font-medium">Any file type</span>
              </div>
              <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-card border border-border rounded-full hover-lift group">
                <Zap className="h-3 w-3" />
                <span className="text-xs font-medium">No size limit</span>
              </div>
              <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-card border border-border rounded-full hover-lift group">
                <Shield className="h-3 w-3" />
                <span className="text-xs font-medium">Secure transfer</span>
              </div>
              <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-card border border-border rounded-full hover-lift group">
                <Lock className="h-3 w-3" />
                <span className="text-xs font-medium">Encrypted</span>
              </div>
              <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-card border border-border rounded-full hover-lift group">
                <ShieldCheck className="h-3 w-3 animate-pulse" />
                <span className="text-xs font-medium">Private by design</span>
              </div>
              <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-card border border-border rounded-full hover-lift group">
                <Activity className="h-3 w-3 animate-pulse" />
                <span className="text-xs font-medium">Low latency</span>
              </div>
            </div>
          </div>

          {selectedFiles.length === 0 && (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover-scale text-xs sm:text-sm font-semibold px-4 sm:px-6 py-1.5 sm:py-2 h-auto"
              disabled={isTransferring}
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Choose Files
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={isTransferring}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-foreground bg-white/10 dark:bg-neutral-900/30 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/15">
              Selected Files
            </h3>
            <div className="flex items-center gap-2">
              {showCheckboxes && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={
                      selectedFileIds.length === selectedFiles.length ? handleDeselectAllFiles : handleSelectAllFiles
                    }
                    className="text-xs bg-transparent"
                  >
                    {selectedFileIds.length === selectedFiles.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    {selectedFileIds.length} selected
                  </Badge>
                </div>
              )}
              <Badge className="bg-white/10 text-foreground border-white/20 px-3 py-1 backdrop-blur-md">
                {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar bg-white/6 dark:bg-neutral-900/15 backdrop-blur-xl p-2 rounded-xl border border-white/10">
            {selectedFiles.map((file, index) => {
              const name = file.name.toLowerCase()
              const type = file.type.toLowerCase()
              const ext = (file.name.split(".").pop() || "").toUpperCase()
              const lastMod = file.lastModified ? new Date(file.lastModified) : null
              const lastModText = lastMod ? formatFullTimestamp(lastMod) : "Unknown"

              const uploadedAt = (file as any).metadata?.uploadTime ? new Date((file as any).metadata.uploadTime) : null
              const uploadedText = uploadedAt ? formatFullTimestamp(uploadedAt) : "Just now"

              const accent = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext.toLowerCase())
                ? "text-sky-400"
                : ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "pdf"].includes(ext.toLowerCase())
                  ? "text-rose-400"
                  : ["mp3", "wav", "flac", "aac", "ogg", "wma", "js", "ts", "jsx", "tsx", "py", "java"].includes(
                        ext.toLowerCase(),
                      )
                    ? "text-emerald-400"
                    : ["zip", "rar", "7z", "xls", "xlsx", "csv", "sql", "db", "ppt", "pptx"].includes(ext.toLowerCase())
                      ? "text-amber-400"
                      : "text-zinc-400"

              const tone = type.startsWith("image/")
                ? "from-sky-500/18 to-sky-600/10 border-sky-400/25"
                : type.startsWith("video/") || type.includes("pdf")
                  ? "from-rose-500/18 to-rose-600/10 border-rose-400/25"
                  : type.startsWith("audio/") || /\\.(mp3|wav|js|ts|jsx|tsx|py|java)$/i.test(name)
                    ? "from-emerald-500/18 to-emerald-600/10 border-emerald-400/25"
                    : /\\.(zip|rar|7z|xls|xlsx|csv|sql|db|ppt|pptx)$/i.test(name)
                      ? "from-amber-500/18 to-amber-600/10 border-amber-400/25"
                      : "from-zinc-500/15 to-zinc-600/10 border-zinc-400/20"

              const animatedKind = kindFromFilename(file.name, file.type || "application/octet-stream")

              return (
                <Card
                  key={file.id}
                  className={cn(
                    "bg-white/10 dark:bg-neutral-900/25 bg-clip-padding backdrop-blur-xl border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.28)] transition-all duration-300 hover-lift overflow-hidden group",
                    isTransferring && "opacity-75",
                  )}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <CardContent className="p-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border", tone)}>
                        <AnimatedIcon
                          kind={animatedKind}
                          size={18}
                          className="group-hover:rotate-6 transition-transform"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm break-words text-foreground/95 group-hover:text-foreground tracking-tight line-clamp-1"
                          title={file.name}
                        >
                          {file.name}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-foreground/70">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 ring-1 ring-white/10">
                            <BadgeInfo className={`h-3 w-3 ${accent}`} />
                            {ext || "FILE"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 ring-1 ring-white/10">
                            <Tags className={`h-3 w-3 ${accent}`} />
                            {file.type || "application/octet-stream"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 ring-1 ring-white/10">
                            <CalendarDays className={`h-3 w-3 ${accent}`} />
                            Uploaded: {uploadedText}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 ring-1 ring-white/10">
                            <CalendarDays className={`h-3 w-3 ${accent}`} />
                            Last modified: {lastModText}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 ring-1 ring-white/10">
                            <HardDrive className={`h-3 w-3 ${accent}`} />
                            {formatFileSize(file.size)}
                          </span>
                        </div>

                        {isTransferring && (
                          <div className="mt-1.5">
                            <div className="bg-white/10 rounded-full p-0.5 ring-1 ring-white/10">
                              <Progress value={transferProgress} className="h-1.5" />
                            </div>
                            <p className="text-xs text-foreground/70 font-medium mt-0.5">
                              {transferProgress.toFixed(0)}% transferred
                            </p>
                          </div>
                        )}
                      </div>

                      {!isTransferring && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveFile(file.id)
                            if (file.preview) {
                              URL.revokeObjectURL(file.preview)
                            }
                          }}
                          className="hover:bg-rose-500/15 hover:text-rose-400 hover-scale p-1.5 text-foreground/70 group/button flex-shrink-0 rounded-full ring-1 ring-transparent hover:ring-rose-400/25"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="bg-white/8 dark:bg-neutral-900/20 rounded-xl p-3 sm:p-4 border border-white/10 backdrop-blur-xl hover-lift">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Archive className="h-4 w-4 text-amber-400" />
                Total size:
              </span>
              <span className="text-base font-bold text-foreground">
                {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
