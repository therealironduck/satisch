<template>
  <UContainer as="main" class="py-12">
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <h1 class="text-3xl font-bold">Hello, {{ firstName }}!</h1>
        <UBadge v-if="user?.email" color="primary" variant="subtle">
          {{ user.email }}
        </UBadge>
      </div>
      <p class="text-neutral-400">Coming soon — your factory planner goes here.</p>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const user = useSupabaseUser();

const firstName = computed(() => {
  const fullName = user.value?.user_metadata?.full_name as string | undefined;
  if (fullName) return fullName.split(" ")[0];
  return user.value?.email?.split("@")[0] ?? "there";
});
</script>
