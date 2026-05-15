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
  // @nuxtjs/supabase's plugin calls getSession() on startup, which may auto-exchange
  // the PKCE code before this handler runs — check for an existing session first.
  const {
    data: { session },
  } = await client.auth.getSession();
  if (session) {
    await router.replace("/dashboard");
    return;
  }

  const code = route.query.code as string | undefined;
  if (!code) {
    await router.replace("/");
    return;
  }

  try {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      await router.replace("/");
      return;
    }
  } catch {
    await router.replace("/");
    return;
  }

  await router.replace("/dashboard");
});
</script>
