<template>
  <div class="flex h-screen flex-col bg-neutral-950 text-white">
    <DashboardHeader />

    <div class="flex flex-1 overflow-hidden">
      <DashboardSidebar :saves="saves" />

      <main class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto max-w-3xl">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold">Welcome back, {{ firstName }}</h1>
              <p class="mt-0.5 text-sm text-neutral-400">
                {{ saves.length }} {{ saves.length === 1 ? "save" : "saves" }}
              </p>
            </div>

            <UButton
              label="New save game"
              icon="i-mdi-plus"
              color="primary"
              @click="showCreate = true"
            />
          </div>

          <DashboardSaveList :saves="saves" :loading="loading" :error="error" />
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

const firstName = computed(() => {
  const fullName = user.value?.user_metadata?.full_name as string | undefined;
  if (fullName) return fullName.split(" ")[0];
  return user.value?.email?.split("@")[0] ?? "there";
});
</script>
