import { WebSocket } from 'ws'

export interface Client {
  id: string
  room: string
  ws?: WebSocket
  player: "x" | "o"
}