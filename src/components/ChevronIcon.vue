<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    :stroke-width="width"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M6 3l5 5 -5 5" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  width?: number
}>(), {
  width: 1.5
})
</script>