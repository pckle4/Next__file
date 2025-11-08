import { EventEmitter } from "events"

export interface TransferEvent {
  type: "progress" | "complete" | "error" | "chunk-sent" | "chunk-received" | "speed-update" | "incoming-file"
  data: any
}

export interface ChunkData {
  index: number
  data: ArrayBuffer
  fileId: string
  totalChunks: number
  fileName: string
  fileSize: number
  senderId?: string
}

export interface ChunkAck {
  type: "chunk-ack"
  chunkIndex: number
  fileId: string
  receivedChunks: number
  bytesReceived: number
  totalChunks: number
}

interface FileCompleteAck {
  type: "file-complete-ack"
  fileId: string
  verified?: boolean // reserved for future checksum verification
}

export class TransferEngine extends EventEmitter {
  private connection: any = null
  private sendingFiles = new Map<
    string,
    {
      file: File
      chunks: ArrayBuffer[]
      currentChunk: number
      totalChunks: number
      startTime: number
      bytesSent: number // kept for compatibility (not used for speed)
      isWaitingForAck: boolean
      ackedChunks: number
      bytesAcked: number
      awaitingFinalAck: boolean
    }
  >()

  private receivingFiles = new Map<
    string,
    {
      fileName: string
      fileSize: number
      chunks: Map<number, ArrayBuffer>
      totalChunks: number
      receivedChunks: number
      startTime: number
      bytesReceived: number
    }
  >()

  constructor() {
    super()
    this.setMaxListeners(100)
  }

  setConnection(connection: any) {
    this.connection = connection

    this.connection.on("data", (data: any) => {
      this.handleIncomingData(data)
    })
  }

  private handleIncomingData(data: any) {
    if (data.type === "chunk-ack") {
      this.handleChunkAck(data as ChunkAck)
    } else if (data.type === "file-chunk") {
      this.handleFileChunk(data as ChunkData)
    } else if (data.type === "file-complete-ack") {
      const ack = data as FileCompleteAck
      this.completeSending(ack.fileId)
    }
  }

  private handleChunkAck(ack: ChunkAck) {
    const transfer = this.sendingFiles.get(ack.fileId)
    if (!transfer) return

    transfer.isWaitingForAck = false
    transfer.ackedChunks = Math.max(transfer.ackedChunks, ack.receivedChunks)
    transfer.bytesAcked = Math.max(transfer.bytesAcked, ack.bytesReceived)

    const progress = (transfer.ackedChunks / transfer.totalChunks) * 100
    const speed = this.calculateSpeed(transfer.bytesAcked, transfer.startTime)
    this.emit("progress", {
      type: "sending",
      fileId: ack.fileId,
      progress,
      speed,
      fileName: transfer.file.name,
    })

    this.sendNextChunk(ack.fileId)
  }

  private handleFileChunk(chunk: ChunkData) {
    let receiving = this.receivingFiles.get(chunk.fileId)

    if (!receiving) {
      this.emit("incoming-file", {
        fileId: chunk.fileId,
        fileName: chunk.fileName,
        fileSize: chunk.fileSize,
        totalChunks: chunk.totalChunks,
      })

      receiving = {
        fileName: chunk.fileName,
        fileSize: chunk.fileSize,
        chunks: new Map(),
        totalChunks: chunk.totalChunks,
        receivedChunks: 0,
        startTime: Date.now(),
        bytesReceived: 0,
      }
      this.receivingFiles.set(chunk.fileId, receiving)
    }

    receiving.chunks.set(chunk.index, chunk.data)
    receiving.receivedChunks++
    receiving.bytesReceived += chunk.data.byteLength

    this.connection.send({
      type: "chunk-ack",
      chunkIndex: chunk.index,
      fileId: chunk.fileId,
      receivedChunks: receiving.receivedChunks,
      bytesReceived: receiving.bytesReceived,
      totalChunks: receiving.totalChunks,
    })

    const progress = (receiving.receivedChunks / receiving.totalChunks) * 100
    const speed = this.calculateSpeed(receiving.bytesReceived, receiving.startTime)

    this.emit("progress", {
      type: "receiving",
      fileId: chunk.fileId,
      progress,
      speed,
      fileName: receiving.fileName,
    })

    if (receiving.receivedChunks === receiving.totalChunks) {
      this.completeFileReceiving(chunk.fileId)
    }
  }

  async sendFile(file: File, chunkSize: number = 64 * 1024): Promise<string> {
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const totalChunks = Math.ceil(file.size / chunkSize)

    const chunks: ArrayBuffer[] = []
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      const arrayBuffer = await this.readChunkAsArrayBuffer(chunk)
      chunks.push(arrayBuffer)
    }

    this.sendingFiles.set(fileId, {
      file,
      chunks,
      currentChunk: 0,
      totalChunks,
      startTime: Date.now(),
      bytesSent: 0,
      isWaitingForAck: false,
      ackedChunks: 0,
      bytesAcked: 0,
      awaitingFinalAck: false,
    })

    this.sendNextChunk(fileId)

    return fileId
  }

  private sendNextChunk(fileId: string) {
    const transfer = this.sendingFiles.get(fileId)
    if (!transfer || transfer.isWaitingForAck) return

    if (transfer.currentChunk >= transfer.totalChunks) {
      transfer.awaitingFinalAck = true
      return
    }

    const chunkData: ChunkData = {
      type: "file-chunk",
      index: transfer.currentChunk,
      data: transfer.chunks[transfer.currentChunk],
      fileId,
      totalChunks: transfer.totalChunks,
      fileName: transfer.file.name,
      fileSize: transfer.file.size,
      senderId: this.connection?.peer || "unknown",
    }

    this.connection.send(chunkData)

    transfer.bytesSent += chunkData.data.byteLength
    transfer.currentChunk++
    transfer.isWaitingForAck = true
  }

  private readChunkAsArrayBuffer(chunk: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(chunk)
    })
  }

  private calculateSpeed(bytes: number, startTime: number): number {
    const elapsed = (Date.now() - startTime) / 1000
    return elapsed > 0 ? bytes / elapsed : 0
  }

  private completeSending(fileId: string) {
    const transfer = this.sendingFiles.get(fileId)
    if (transfer) {
      this.emit("complete", {
        type: "sending",
        fileId,
        fileName: transfer.file.name,
      })
      this.sendingFiles.delete(fileId)
    }
  }

  private completeFileReceiving(fileId: string) {
    const receiving = this.receivingFiles.get(fileId)
    if (!receiving) return

    const sortedChunks = Array.from(receiving.chunks.entries())
      .sort(([a], [b]) => a - b)
      .map(([, chunk]) => chunk)

    const blob = new Blob(sortedChunks, {
      type: this.detectMimeType(receiving.fileName),
    })

    this.connection?.send({
      type: "file-complete-ack",
      fileId,
    })

    this.emit("complete", {
      type: "receiving",
      fileId,
      fileName: receiving.fileName,
      blob,
      senderId: this.connection?.peer || "unknown",
    })

    this.receivingFiles.delete(fileId)
  }

  private detectMimeType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase()
    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      csv: "text/csv",
      json: "application/json",
      xml: "application/xml",
      zip: "application/zip",
      rar: "application/x-rar-compressed",
      "7z": "application/x-7z-compressed",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      webp: "image/webp",
      svg: "image/svg+xml",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      wmv: "video/x-ms-wmv",
      flv: "video/x-flv",
      webm: "video/webm",
    }

    return mimeTypes[extension || ""] || "application/octet-stream"
  }

  getTransferStats() {
    return {
      sending: Array.from(this.sendingFiles.entries()).map(([fileId, transfer]) => ({
        fileId,
        fileName: transfer.file.name,
        progress: (transfer.ackedChunks / transfer.totalChunks) * 100,
        speed: this.calculateSpeed(transfer.bytesAcked, transfer.startTime),
      })),
      receiving: Array.from(this.receivingFiles.entries()).map(([fileId, receiving]) => ({
        fileId,
        fileName: receiving.fileName,
        progress: (receiving.receivedChunks / receiving.totalChunks) * 100,
        speed: this.calculateSpeed(receiving.bytesReceived, receiving.startTime),
      })),
    }
  }
}

export const transferEngine = new TransferEngine()
