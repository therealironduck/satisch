<template>
  <UModal v-model:open="open" title="Rename save game">
    <template #body>
      <div class="flex flex-col gap-4">
        <UAlert
          v-if="validationError"
          color="error"
          variant="soft"
          :description="validationError"
          icon="i-mdi-alert-circle-outline"
        />
        <UInput
          v-model="name"
          placeholder="Save game name"
          :maxlength="80"
          autofocus
          @keyup.enter="submit"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="ghost" @click="cancel" />
        <UButton label="Rename" color="primary" :disabled="!name.trim()" @click="submit" />
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
  confirm: [newName: string];
  cancel: [];
}>();

const open = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const name = ref(props.save.name);
const validationError = ref<string | null>(null);

watch(
  () => props.save.name,
  (val) => {
    name.value = val;
  },
);

watch(open, (val) => {
  if (val) {
    name.value = props.save.name;
    validationError.value = null;
  }
});

function submit() {
  if (!name.value.trim()) {
    validationError.value = "Name cannot be empty.";
    return;
  }
  emit("confirm", name.value.trim());
}

function cancel() {
  emit("cancel");
  open.value = false;
}
</script>
