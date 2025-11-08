export interface ChatMessage {
  id: string
  peerId: string
  message: string
  timestamp: Date
  isOwn: boolean
}
