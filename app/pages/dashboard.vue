<template>
  <div class="flex h-screen flex-col bg-neutral-950 text-white">
    <DashboardHeader />

    <div class="flex flex-1 overflow-hidden">
      <DashboardSidebar
        :saves="saves"
        :active-filter="activeFilter"
        :user-id="userId"
        @filter-change="activeFilter = $event"
      />

      <main class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto max-w-3xl">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold">Welcome back, {{ firstName }}</h1>
              <p class="mt-0.5 text-sm text-neutral-400">
                {{ filteredSaves.length }} {{ filteredSaves.length === 1 ? "save" : "saves" }}
              </p>
            </div>

            <UButton
              label="New save game"
              icon="i-mdi-plus"
              color="primary"
              @click="showCreate = true"
            />
          </div>

          <DashboardSaveList
            :saves="filteredSaves"
            :loading="loading"
            :error="error"
            :active-filter="activeFilter"
            :user-id="userId"
          />
        </div>
      </main>
    </div>

    <SaveGameCreateModal v-model:open="showCreate" @created="showCreate = false" />
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const { saves, loading, error } = useSaveGames();
const showCreate = ref(false);
const activeFilter = ref<"all" | "owned" | "shared">("all");

const userId = computed(() => user.value?.sub ?? "");

const firstName = computed(() => {
  const fullName = user.value?.user_metadata?.full_name as string | undefined;
  if (fullName) return fullName.split(" ")[0];
  return user.value?.email?.split("@")[0] ?? "there";
});

const filteredSaves = computed(() => {
  const uid = userId.value;
  if (!uid) return saves.value;
  if (activeFilter.value === "owned") return saves.value.filter((s) => s.owner_id === uid);
  if (activeFilter.value === "shared") return saves.value.filter((s) => s.owner_id !== uid);
  return saves.value;
});
</script>
