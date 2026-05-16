<template>
  <aside class="flex w-56 flex-col border-r border-neutral-800 bg-neutral-950 py-4">
    <nav class="flex flex-1 flex-col gap-1 px-2">
      <p class="px-2 pb-1 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
        Workspace
      </p>

      <button
        :class="[
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-800 hover:text-white',
          activeFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-300',
        ]"
        @click="$emit('filter-change', 'all')"
      >
        <UIcon name="i-mdi-folder-outline" class="h-4 w-4 shrink-0" />
        <span class="flex-1 text-left">All saves</span>
        <UBadge :label="String(saves.length)" color="neutral" variant="subtle" size="xs" />
      </button>

      <button
        :class="[
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-800 hover:text-white',
          activeFilter === 'owned' ? 'bg-neutral-800 text-white' : 'text-neutral-300',
        ]"
        @click="$emit('filter-change', 'owned')"
      >
        <UIcon name="i-mdi-cube-outline" class="h-4 w-4 shrink-0" />
        <span class="flex-1 text-left">Owned by me</span>
        <UBadge :label="String(ownedCount)" color="neutral" variant="subtle" size="xs" />
      </button>

      <button
        :class="[
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-800 hover:text-white',
          activeFilter === 'shared' ? 'bg-neutral-800 text-white' : 'text-neutral-300',
        ]"
        @click="$emit('filter-change', 'shared')"
      >
        <UIcon name="i-mdi-account-multiple-outline" class="h-4 w-4 shrink-0" />
        <span class="flex-1 text-left">Shared with me</span>
        <UBadge :label="String(sharedCount)" color="neutral" variant="subtle" size="xs" />
      </button>

      <!--
      <p class="mt-4 px-2 pb-1 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
        Library
      </p>

      <button
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-500 hover:bg-neutral-800"
        disabled
      >
        <UIcon name="i-mdi-book-outline" class="h-4 w-4 shrink-0" />
        <span class="flex-1 text-left">Recipe catalog</span>
      </button>

      <button
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-500 hover:bg-neutral-800"
        disabled
      >
        <UIcon name="i-mdi-flask-outline" class="h-4 w-4 shrink-0" />
        <span class="flex-1 text-left">Blueprints</span>
      </button>
      -->
    </nav>

    <!--
    <div class="border-t border-neutral-800 px-2 pt-2">
      <button
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
      >
        <UIcon name="i-mdi-cog-outline" class="h-4 w-4 shrink-0" />
        <span>Settings</span>
      </button>
    </div>
    -->
  </aside>
</template>

<script setup lang="ts">
import type { SaveGame } from "~/types/saveGame";

const props = defineProps<{
  saves: SaveGame[];
  activeFilter: "all" | "owned" | "shared";
  userId: string;
}>();

defineEmits<{
  "filter-change": [value: "all" | "owned" | "shared"];
}>();

const ownedCount = computed(() => props.saves.filter((s) => s.owner_id === props.userId).length);
const sharedCount = computed(() => props.saves.filter((s) => s.owner_id !== props.userId).length);
</script>
