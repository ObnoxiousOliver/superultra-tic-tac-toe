<template>
  <div :class="['tictactoe-board', {
    active: active,
    x: currentPlayer === 'x',
    o: currentPlayer === 'o'
  }]">
    <button
      :class="['tictactoe-board__field', {
        'tictactoe-board__field--taken': board.fields[i]
      }]"
      v-for="(_, i) in 9"
      :key="i"
      @click="emit('takeTurn', i)"
    >
      <transition name="tictactoe-board__player-mark">
        <XIcon class="tictactoe-board__player-mark" v-if="board.fields[i] === 'x'" />
        <OIcon class="tictactoe-board__player-mark" v-else-if="board.fields[i] === 'o'" />
      </transition>
    </button>

    <transition name="tictactoe-board__overlay">
      <div v-if="board.winner" class="tictactoe-board__overlay">
        <XIcon
          v-if="board.winner === 'x'"
          class="tictactoe-board__winner-icon"
          :width="0.7"
        />
        <OIcon
          v-if="board.winner === 'o'"
          class="tictactoe-board__winner-icon"
          :width="0.7"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { Board } from '../server/models/TicTacToe'
import OIcon from './OIcon.vue';
import XIcon from './XIcon.vue';

defineProps<{
  board: Board
  active: boolean
  currentPlayer: 'x' | 'o'
}>()

const emit = defineEmits<{
  takeTurn: [number]
}>()
</script>

<style scoped lang="scss">
  @function unit ($value) {
    @return min(1vw * $value, 1vh * $value);
  }
  
.tictactoe-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: unit(.75);
  position: relative;
  overflow: hidden;

  background: #fff2;
  padding: unit(1);
  border-radius: unit(3);
  border: unit(0.25) solid #fff1;

  transition: background-color .15s, border-color .15s;

  &__field {
    display: block;
    position: relative;
    appearance: none;
    border: none;
    background: #0004;
    border-radius: unit(0.5);
    border: unit(0.25) solid #0002;
    transition: .15s;

    &:nth-child(1) {
      border-top-left-radius: unit(2);
    }
    &:nth-child(3) {
      border-top-right-radius: unit(2);
    }
    &:nth-child(7) {
      border-bottom-left-radius: unit(2);
    }
    &:nth-child(9) {
      border-bottom-right-radius: unit(2);
    }
  }

  &__player-mark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    height: 70%;

    &-enter-active {
      animation: place .3s;

      @keyframes place {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.6);
          animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
        }
        30% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.1);
          animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
        }
      }
    }

    &-leave-active {
      transition: opacity .2s, transform .2s;
    }

    &-leave-to {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000a;
    backdrop-filter: blur(.25rem);

    &-enter-active {
      transition: opacity .5s;

      .tictactoe-board__winner-icon {
        animation: placeWinner .5s;

        @keyframes placeWinner {
          0% {
            transform: scale(2);
            animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
          }
          60% {
            transform: scale(1);
            animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          80% {
            transform: scale(1.1);
            animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
          }
          100% {
            transform: scale(1);
          }
        }
      }
    }

    &-enter-from {
      opacity: 0;

      .tictactoe-board__winner-icon {
        transform: scale(4);
        opacity: 0;
      }
    }

    &-leave-active {
      transition: opacity .3s;
    }

    &-leave-to {
      opacity: 0;
    }
  }

  &__winner-icon {
    width: 70%;
    height: 70%;
  }

  &.active {
    background: #fff4;

    &.x {
      border-color: #fda;
      box-shadow:
        0 0 unit(1) #f8a4,       0 0 unit(2) #f644,       0 0 unit(4) #f224,
        0 0 unit(1) #f8a4 inset, 0 0 unit(2) #f644 inset, 0 0 unit(4) #f224 inset;
    }

    &.o {
      border-color: #aff;
      box-shadow:
        0 0 unit(1) #8af4,       0 0 unit(2) #48f4,       0 0 unit(4) #35f4,
        0 0 unit(1) #8af4 inset, 0 0 unit(2) #48f4 inset, 0 0 unit(4) #35f4 inset;
    }

    .tictactoe-board__field {
      cursor: pointer;
    
      &:hover:not(.tictactoe-board__field--taken) {
        background: #1112;
      }

      &:active:not(.tictactoe-board__field--taken) {
        transform: scale(.9);
      }
    }
  }
}
</style>