<template>
  <div class="flex flex-col gap-3">
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="h-14 animate-pulse rounded-lg bg-neutral-800" />
    </template>

    <LazyUAlert
      v-else-if="error"
      color="error"
      variant="soft"
      :description="error"
      icon="i-mdi-alert-circle-outline"
    />

    <template v-else-if="saves.length > 0">
      <DashboardSaveCard v-for="save in saves" :key="save.id" :save="save" />
    </template>

    <div v-else class="flex flex-col items-center justify-center py-16 text-neutral-500">
      <UIcon name="i-mdi-folder-outline" class="mb-3 h-10 w-10" />
      <p class="text-sm">No saves yet — create your first one</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SaveGame } from "~/types/saveGame";

defineProps<{
  saves: SaveGame[];
  loading: boolean;
  error: string | null;
}>();
</script>
