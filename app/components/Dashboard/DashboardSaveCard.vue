<template>
  <div class="rounded-lg border border-neutral-800 bg-neutral-900">
    <div class="flex items-center gap-3 px-4 py-3">
      <div :class="['h-4 w-4 shrink-0 rounded', colorMeta?.bgClass ?? 'bg-neutral-400']" />

      <span class="flex-1 truncate font-medium text-white">{{ save.name }}</span>

      <UBadge
        :label="isOwner ? 'OWNER' : 'SHARED'"
        :color="isOwner ? 'warning' : 'neutral'"
        variant="outline"
        size="xs"
      />

      <UButton
        icon="i-mdi-share-variant-outline"
        label="Share"
        color="neutral"
        variant="ghost"
        size="xs"
        @click.stop="showShare = true"
      />

      <UDropdownMenu v-if="isOwner" :items="menuItems">
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-mdi-dots-horizontal"
          aria-label="More options"
          @click.stop
        />
      </UDropdownMenu>

      <button
        class="text-neutral-400 hover:text-white"
        :aria-label="expanded ? 'Collapse' : 'Expand'"
        @click="expanded = !expanded"
      >
        <UIcon
          name="i-mdi-chevron-right"
          :class="['h-5 w-5 transition-transform duration-200', expanded ? 'rotate-90' : '']"
        />
      </button>
    </div>

    <div
      v-if="expanded"
      class="border-t border-neutral-800 px-4 py-6 text-center text-sm text-neutral-500"
    >
      No factories yet
    </div>

    <LazySaveGameRenameModal
      v-if="showRename"
      v-model:open="showRename"
      :save="save"
      @confirm="onRename"
      @cancel="showRename = false"
    />

    <LazySaveGameDeleteModal
      v-if="showDelete"
      v-model:open="showDelete"
      :save="save"
      @confirm="onDelete"
      @cancel="showDelete = false"
    />

    <LazySaveGameShareModal v-if="showShare" v-model:open="showShare" :save="save" />
  </div>
</template>

<script setup lang="ts">
import type { SaveGame } from "~/types/saveGame";

import { SAVE_GAME_COLOR_PALETTE } from "~/types/saveGame";

const props = defineProps<{
  save: SaveGame;
  userId: string;
}>();

const expanded = ref(false);
const showRename = ref(false);
const showDelete = ref(false);
const showShare = ref(false);

const { rename, remove } = useSaveGames();
const toast = useToast();

const isOwner = computed(() => !!props.userId && props.save.owner_id === props.userId);
const colorMeta = computed(() => SAVE_GAME_COLOR_PALETTE.find((c) => c.name === props.save.color));

const menuItems = computed(() => {
  if (!isOwner.value) return [];
  return [
    [
      {
        label: "Rename",
        icon: "i-mdi-pencil-outline",
        onSelect: () => {
          showRename.value = true;
        },
      },
      {
        label: "Delete",
        icon: "i-mdi-trash-can-outline",
        color: "error" as const,
        onSelect: () => {
          showDelete.value = true;
        },
      },
    ],
  ];
});

async function onRename(newName: string) {
  showRename.value = false;
  await rename(props.save.id, newName);
  toast.add({ title: "Save renamed", color: "success" });
}

async function onDelete() {
  await remove(props.save.id);
  toast.add({ title: "Save deleted", color: "success" });
}
</script>
