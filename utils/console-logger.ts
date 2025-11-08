import { getISTTimestamp } from "@/utils/ist-time"

export const logPeerConnected = (peerId: string) => {
  console.log(`[${getISTTimestamp()}] Peer connected: ${peerId}`)
}

export const logPeerDisconnected = (peerId: string) => {
  console.log(`[${getISTTimestamp()}] Peer disconnected: ${peerId}`)
}

export const logFileShared = () => {
  console.log(`[${getISTTimestamp()}] File shared`)
}

export const logFileReceived = () => {
  console.log(`[${getISTTimestamp()}] File received`)
}
