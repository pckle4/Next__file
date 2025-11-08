export type FileMetadata = {
  name: string
  sizeBytes: number
  mimeType: string
  extension: string | null
  sha256Hex?: string
  imageWidth?: number
  imageHeight?: number
  lastModified?: number
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer)
  const bytes = new Uint8Array(digest)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function computeFileMetadata(file: File): Promise<FileMetadata> {
  const base: FileMetadata = {
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
    extension: file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : null,
    lastModified: file.lastModified,
  }

  // Compute checksum
  const buf = await file.arrayBuffer()
  const sha = await sha256Hex(buf)

  const meta: FileMetadata = { ...base, sha256Hex: sha }

  // Attempt lightweight image dimension read
  if (meta.mimeType.startsWith("image/")) {
    try {
      const blobUrl = URL.createObjectURL(file)
      const img = new Image()
      img.crossOrigin = "anonymous"
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject()
        img.src = blobUrl
      })
      meta.imageWidth = img.naturalWidth
      meta.imageHeight = img.naturalHeight
      URL.revokeObjectURL(blobUrl)
    } catch {
      // ignore dimension failures
    }
  }

  return meta
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
