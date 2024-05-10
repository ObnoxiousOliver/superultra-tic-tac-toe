import { defineStore } from "pinia";
import { ref } from "vue";
import { GlobalBoard } from "../server/models/TicTacToe";
import router from "../router";

export interface GameSession {
  roomCode: string
  player: "x" | "o"
  clientId: string
  game?: {
    board: GlobalBoard
    currentPlayer: "x" | "o"
    activeBoards: number[]
    winner?: "x" | "o" | "draw" | null
  }
}

export const useOnline = defineStore('online', () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL as string
  
  const gameSession = ref<GameSession | null>(null)

  async function createRoom() {
    const res = await fetch(`${serverUrl}/createRoom`, {
      method: 'POST'
    })


    if (!res.ok) {
      throw new Error('Failed to create room')
    }

    subscribeToRoom(res)
  }

  async function joinRoom(_: string, roomCode: string) {
    const res = await fetch(`${serverUrl}/joinRoom/${roomCode}`, {
      method: 'POST'
    })

    if (!res.ok) {
      throw new Error('Failed to join room')
    }

    await subscribeToRoom(res)
  }

    async function subscribeToRoom(res: Response) {
    if (!res.body) {
      throw new Error('Failed to create room')
    }

    // const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
    //   if (event.type === 'event') {
    //     const data = JSON.parse(event.data)

    //     console.log('Received event:', data)

    //     switch (data.type) {
    //       case 'joined':
    //         gameSession.value = {
    //           roomCode: data.payload.roomCode,
    //           clientId: data.payload.clientId,
    //           player: data.payload.player
    //         }

    //         router.push(`/room/${data.payload.roomCode}`)
    //         break
    //       case 'state':
    //         if (!gameSession.value) {
    //           throw new Error('Game session not found')
    //         }

    //         gameSession.value.game = {
    //           board: data.payload.board,
    //           currentPlayer: data.payload.currentPlayer,
    //           activeBoards: data.payload.activeBoards
    //         }
    //         break
    //       case 'win':
    //         if (!gameSession.value?.game) {
    //           throw new Error('Game session not found')
    //         }

    //         if (data.payload === 'x' || data.payload === 'o') {
    //           gameSession.value.game.winner = data.payload
    //         } else {
    //           throw new Error('Invalid winner')
    //         }
    //         break
    //       case 'draw':
    //         if (!gameSession.value?.game) {
    //           throw new Error('Game session not found')
    //         }

    //         gameSession.value.game.winner = 'draw'
    //         break
    //       default:
    //         console.log('Unknown event:', data)
    //     }
    //   } else if (event.type === 'reconnect-interval') {
    //     console.log('We should set reconnect interval to %d milliseconds', event.value)
    //   }
    // })

    const resJson = await res.json()

    const ws = new WebSocket(`${serverUrl.replace('http', 'ws')}/room/${resJson.roomCode}?clientId=${resJson.clientId}`)
    ws.addEventListener('message', (event) => {
      console.log('Received event:', event.data)
      const data = JSON.parse(event.data)
        console.log('Received event:', data)

        switch (data.type) {
          case 'joined':
            gameSession.value = {
              roomCode: data.payload.roomCode,
              clientId: data.payload.clientId,
              player: data.payload.player
            }

            router.push(`/room/${data.payload.roomCode}`)
            break
          case 'state':
            if (!gameSession.value) {
              throw new Error('Game session not found')
            }

            gameSession.value.game = {
              board: data.payload.board,
              currentPlayer: data.payload.currentPlayer,
              activeBoards: data.payload.activeBoards
            }
            break
          case 'win':
            if (!gameSession.value?.game) {
              throw new Error('Game session not found')
            }

            if (data.payload === 'x' || data.payload === 'o') {
              gameSession.value.game.winner = data.payload
            } else {
              throw new Error('Invalid winner')
            }
            break
          case 'draw':
            if (!gameSession.value?.game) {
              throw new Error('Game session not found')
            }

            gameSession.value.game.winner = 'draw'
            break
          default:
            console.log('Unknown event:', data)
        }
    })
    ws.addEventListener('close', () => {
      gameSession.value = null
    })
  }

  async function takeTurn(boardIndex: number, fieldIndex: number) {
    if (!gameSession.value) {
      throw new Error('Game session not found')
    }

    const res = await fetch(`${serverUrl}/room/${gameSession.value.roomCode}/taketurn?clientId=${gameSession.value.clientId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        boardIndex,
        fieldIndex
      })
    })

    if (!res.ok) {
      throw new Error('Failed to take turn')
    }
  }

  async function leaveRoom() {
    if (!gameSession.value) {
      return
    }

    const res = await fetch(`${serverUrl}/room/${gameSession.value?.roomCode}/leave?clientId=${gameSession.value?.clientId}`, {
      method: 'POST'
    })

    if (!res.ok) {
      throw new Error('Failed to leave room')
    }

    gameSession.value = null
  }

  return {
    createRoom,
    joinRoom,
    takeTurn,
    leaveRoom,
    gameSession
  }
})
