<template>
  <div class="global-board">
    <TicTacToe
      class="global-board__board"
      v-for="(_, i) in 9"
      :key="i"
      :board="board[i]"
      :active="activeBoards.includes(i)"
      :currentPlayer="currentPlayer"
      @takeTurn="(fieldIndex) => emit('takeTurn', i, fieldIndex)"
    />
  </div>
</template>

<script setup lang="ts">
import { GlobalBoard } from '../server/models/TicTacToe';
import TicTacToe from './TicTacToe.vue';

defineProps<{
  board: GlobalBoard
  activeBoards: number[]
  currentPlayer: 'x' | 'o'
}>();

const emit = defineEmits<{
  takeTurn: [number, number]
}>();
</script>

<style scoped lang="scss">
.global-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .5rem;
  aspect-ratio: 1;
}
</style>