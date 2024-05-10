import { Game } from "./models/Game"
import { GlobalBoard } from "./models/TicTacToe"
import { Client } from "./Client"

export class Room {
  public roomCode: string
  public game: Game | null = null
  public clients: Client[] = []

  constructor(
    roomCode: string,
  ) {
    this.roomCode = roomCode
  }

  createGame(
    onNextTurn: (board: GlobalBoard, player: "x" | "o", activeBoards: number[]) => void,
    onWin: (winner: "x" | "o" | "draw" | null) => void) {

    if (this.game) {
      this.game.destroy()
    }

    this.game = new Game()

    this.game.onNextTurn(onNextTurn)
    this.game.onWin(onWin)
  }

  addClient(client: Client) {
    const connectedClient = this.clients.find(c => c.id === client.id)

    if (connectedClient) {
      connectedClient.ws = client.ws
      connectedClient.id = client.id

      console.log('Client connected:', connectedClient.id)

      this.sendToClient(connectedClient, {
        type: 'joined',
        payload: {
          roomCode: this.roomCode,
          clientId: connectedClient.id,
          player: connectedClient.player
        }
      })

      if (this.game) {
        this.sendToClients({
          type: 'state',
          payload: {
            board: this.game.getBoard(),
            currentPlayer: this.game.getCurrentPlayer(),
            activeBoards: this.game.getActiveBoards()
          }
        })
      }

      return true
    }

    if (this.clients.length >= 2) return false
    if (client.room !== this.roomCode) return false

    if (this.clients.length === 1) {
      client.player = this.clients[0]?.player === 'x' ? 'o' : 'x'
    }

    this.clients.push(client)
    this.sendToClient(client, {
      type: 'joined',
      payload: {
        roomCode: this.roomCode,
        clientId: client.id,
        player: client.player
      }
    })

    if (this.clients.length === 2) {
      this.startGame()
    }
    return true
  }

  disconnectClient(client: Client) {
    this.clients = this.clients.filter(c => c.id !== client.id)

    client.ws?.close(1000, 'Disconnected')

    if (this.clients.length > 0 && this.game) {
      this.sendToClients({ type: 'error', payload: 'Opponent disconnected' })
    }
  }

  takeTurn(client: Client, boardIndex: number, fieldIndex: number) {
    if (!this.game) return

    console.log('Client took turn:', client.id, boardIndex, fieldIndex)
    const player = this.game.getCurrentPlayer()

    if (client.player !== player) {
      this.sendToClient(client, { type: 'error', payload: 'Not your turn' })
      return
    }

    const success = this.game.takeTurn(boardIndex, fieldIndex)

    if (!success) {
      this.sendToClient(client, { type: 'error', payload: 'Invalid move' })
      return
    }
  }

  startGame() {
    if (this.game) return

    this.createGame(
      (board, currentPlayer, activeBoards) => {
        this.sendToClients({
          type: 'state',
          payload: {
            board,
            currentPlayer,
            activeBoards
          }
        })
      },
      winner => {
        if (winner === 'draw') {
          this.sendToClients({ type: 'draw' })
        } else {
          this.sendToClients({ type: 'win', payload: winner })
        }
      }
    )
  }

  sendToClients(data: {
    type: 'joined' | 'state' | 'win' | 'draw' | 'error' ,
    payload?: any
  }) {
    this.clients.forEach(client => {
      client.ws?.send(JSON.stringify(data))
    })
  }

  sendToClient(client: Client, data: {
    type: 'joined' | 'state' | 'win' | 'draw' | 'error' ,
    payload?: any
  }) {
    client.ws?.send(JSON.stringify(data))
  }

  static codeRoomCodeCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  static roomCodeLength = 6

  static generateRoomCode(): string {
    let code = ''

    for (let i = 0; i < Room.roomCodeLength; i++) {
      code += Room.codeRoomCodeCharacters
        .charAt(Math.floor(Math.random() * Room.codeRoomCodeCharacters.length))
    }

    return code
  }

  static createRoom(): Room {
    return new Room(Room.generateRoomCode())
  }
}