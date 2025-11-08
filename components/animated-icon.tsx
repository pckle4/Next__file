"use client"

import { cn } from "@/lib/utils"
import { ImageIcon, Video, Music, Archive, FileText, File } from "lucide-react"

export type FileKind = "image" | "video" | "audio" | "archive" | "document" | "other"

export function AnimatedIcon({
  kind,
  className,
  size = 18,
}: {
  kind: FileKind
  className?: string
  size?: number
}) {
  const common = "animate-pulse drop-shadow-sm"
  switch (kind) {
    case "image":
      return <ImageIcon className={cn(common, "text-[hsl(var(--chart-2))]", className)} width={size} height={size} />
    case "video":
      return <Video className={cn(common, "text-[hsl(var(--chart-5))]", className)} width={size} height={size} />
    case "audio":
      return <Music className={cn(common, "text-[hsl(var(--accent))]", className)} width={size} height={size} />
    case "archive":
      return <Archive className={cn(common, "text-[hsl(var(--chart-4))]", className)} width={size} height={size} />
    case "document":
      return <FileText className={cn(common, "text-[hsl(var(--primary))]", className)} width={size} height={size} />
    default:
      return (
        <File className={cn(common, "text-[hsl(var(--muted-foreground))]", className)} width={size} height={size} />
      )
  }
}

export function kindFromFilename(name: string, mime: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase()
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(ext || ""))
    return "image"
  if (mime.startsWith("video/") || ["mp4", "avi", "mov", "mkv", "webm"].includes(ext || "")) return "video"
  if (mime.startsWith("audio/") || ["mp3", "wav", "flac", "aac", "ogg"].includes(ext || "")) return "audio"
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext || "")) return "archive"
  if (["pdf", "doc", "docx", "txt", "md", "rtf", "ppt", "pptx", "xls", "xlsx"].includes(ext || "")) return "document"
  return "other"
}
