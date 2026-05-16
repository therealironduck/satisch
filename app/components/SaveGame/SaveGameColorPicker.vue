<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="color in SAVE_GAME_COLOR_PALETTE"
      :key="color.name"
      type="button"
      :class="[
        'h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-neutral-900 transition-all',
        color.bgClass,
        modelValue === color.name ? color.ringClass : 'ring-transparent',
      ]"
      :aria-label="color.label"
      :aria-pressed="modelValue === color.name"
      @click="emit('update:modelValue', color.name)"
    />
  </div>
</template>

<script setup lang="ts">
import type { SaveGameColor } from "~/types/saveGame";

import { SAVE_GAME_COLOR_PALETTE } from "~/types/saveGame";

defineProps<{
  modelValue: SaveGameColor;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: SaveGameColor];
}>();
</script>
