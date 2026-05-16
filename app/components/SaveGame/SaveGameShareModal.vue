<template>
  <UModal
    :open="open"
    :title="'Share “' + save.name + '”'"
    @update:open="$emit('update:open', $event)"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <form v-if="isOwner" class="flex flex-col gap-3" @submit.prevent="onInvite">
          <div class="flex gap-2">
            <UInput
              v-model="emailInput"
              class="flex-1"
              placeholder="Email address"
              type="email"
              :disabled="composable.loading.value"
            />
            <UButton
              type="submit"
              label="Add"
              :disabled="!emailInput.trim() || composable.loading.value"
              :loading="composable.loading.value"
            />
          </div>

          <UAlert
            v-if="inviteError"
            color="error"
            variant="soft"
            :description="inviteError"
            icon="i-mdi-alert-circle-outline"
          />
        </form>

        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between rounded-md px-2 py-1.5">
            <div class="flex items-center gap-2 text-sm text-white">
              <UIcon name="i-mdi-account-outline" class="h-4 w-4 shrink-0 text-neutral-400" />
              <span>{{ isOwner ? "You" : "Owner" }}</span>
            </div>
            <UBadge label="OWNER" color="warning" variant="subtle" size="xs" />
          </div>

          <div
            v-for="collaborator in composable.collaborators.value"
            :key="collaborator.id"
            class="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-neutral-800"
          >
            <div class="flex flex-col text-sm">
              <span class="text-white">{{ collaborator.email }}</span>
              <span class="text-xs text-neutral-400"
                >Added {{ relativeDate(collaborator.added_at) }}</span
              >
            </div>

            <UButton
              v-if="isOwner"
              icon="i-mdi-close"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Remove collaborator"
              :loading="removingId === collaborator.id"
              @click="onRemove(collaborator.id)"
            />

            <UButton
              v-else-if="collaborator.user_id === currentUserId"
              icon="i-mdi-exit-to-app"
              color="neutral"
              variant="ghost"
              size="xs"
              label="Leave"
              :loading="removingId === collaborator.id"
              @click="onLeave(collaborator.id)"
            />
          </div>

          <p
            v-if="composable.collaborators.value.length === 0"
            class="px-2 py-2 text-sm text-neutral-500"
          >
            No collaborators yet
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton
          label="Close"
          color="neutral"
          variant="outline"
          @click="$emit('update:open', false)"
        />
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
}>();

const user = useSupabaseUser();
const currentUserId = computed(() => user.value?.sub ?? "");
const isOwner = computed(() => props.save.owner_id === currentUserId.value);

const { refetch: refetchSaves } = useSaveGames();

const saveGameId = computed(() => props.save.id);
const composable = useSaveGameCollaborators(saveGameId);

const emailInput = ref("");
const inviteError = ref<string | null>(null);
const removingId = ref<string | null>(null);

async function onInvite() {
  inviteError.value = null;
  const err = await composable.invite(emailInput.value.trim());
  if (err) {
    inviteError.value = err;
  } else {
    emailInput.value = "";
  }
}

async function onRemove(collaboratorId: string) {
  removingId.value = collaboratorId;
  await composable.remove(collaboratorId);
  removingId.value = null;
}

async function onLeave(collaboratorId: string) {
  removingId.value = collaboratorId;
  await composable.leave(collaboratorId);
  removingId.value = null;
  emit("update:open", false);
  void refetchSaves();
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
</script>
