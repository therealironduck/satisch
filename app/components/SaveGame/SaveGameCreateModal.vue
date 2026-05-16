<template>
  <UModal v-model:open="open" title="New save game">
    <template #body>
      <div class="flex flex-col gap-4">
        <LazyUAlert
          v-if="createError"
          color="error"
          variant="soft"
          :description="createError"
          icon="i-mdi-alert-circle-outline"
        />

        <LazyUInput
          v-model="name"
          placeholder="Save game name"
          leading-icon="i-mdi-folder-outline"
          :maxlength="80"
          autofocus
          @keyup.enter="submit"
        />

        <div class="flex flex-col gap-2">
          <p class="text-sm text-neutral-400">Color</p>
          <LazySaveGameColorPicker v-model="color" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="ghost" @click="cancel" />
        <UButton
          label="Create"
          color="primary"
          :disabled="!name.trim()"
          :loading="submitting"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { SaveGameColor } from "~/types/saveGame";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  created: [];
}>();

const open = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const { create, error } = useSaveGames();

const name = ref("");
const color = ref<SaveGameColor>("amber");
const submitting = ref(false);
const createError = ref<string | null>(null);

watch(open, (val) => {
  if (!val) {
    name.value = "";
    color.value = "amber";
    createError.value = null;
    submitting.value = false;
  }
});

async function submit() {
  if (!name.value.trim()) return;

  submitting.value = true;
  createError.value = null;

  await create({ name: name.value.trim(), color: color.value });

  submitting.value = false;

  if (error.value) {
    createError.value = error.value;
    return;
  }

  emit("created");
  open.value = false;
}

function cancel() {
  open.value = false;
}
</script>
