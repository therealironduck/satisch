<template>
  <header class="flex h-14 items-center gap-4 border-b border-neutral-800 bg-neutral-950 px-4">
    <AppLogo />

    <div class="flex-1">
      <!--
      <UInput
        placeholder="Search saves..."
        :ui="{ base: 'max-w-sm' }"
        leading-icon="i-mdi-magnify"
        readonly
      />
      -->
    </div>

    <UAvatar v-if="user" :src="avatarUrl" :alt="initials" size="sm" />
  </header>
</template>

<script setup lang="ts">
const user = useSupabaseUser();

const avatarUrl = computed(() => user.value?.user_metadata?.avatar_url as string | undefined);

const initials = computed(() => {
  const fullName = user.value?.user_metadata?.full_name as string | undefined;
  if (fullName) {
    return fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return (user.value?.email?.[0] ?? "U").toUpperCase();
});
</script>
