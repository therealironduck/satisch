<template>
  <UModal v-model:open="open" title="Delete save game">
    <template #body>
      <p class="text-sm text-neutral-300">
        Delete <strong>«{{ save.name }}»</strong>? This cannot be undone.
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="ghost" @click="cancel" />
        <UButton label="Delete" color="error" @click="confirm" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { SaveGame } from "~/types/saveGame";

const props = defineProps<{
  open: boolean;
  save: SaveGame;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  confirm: [];
  cancel: [];
}>();

const open = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

function confirm() {
  emit("confirm");
  open.value = false;
}

function cancel() {
  emit("cancel");
  open.value = false;
}
</script>
