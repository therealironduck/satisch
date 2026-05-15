<template>
  <main class="flex flex-1 items-center justify-center">
    <h1 class="sr-only">Signing in…</h1>
    <UIcon name="i-mdi-refresh" class="animate-spin text-4xl text-amber-400" />
  </main>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const code = route.query.code as string | undefined;
  if (code) {
    await client.auth.exchangeCodeForSession(code);
  }
  await router.push("/dashboard");
});
</script>
