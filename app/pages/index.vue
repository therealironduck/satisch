<template>
  <main class="flex flex-1 items-center justify-center">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-mdi-cube-outline" class="text-3xl text-amber-400" />
          <span class="text-xl font-bold tracking-tight">satisch.</span>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <h1 class="text-2xl font-bold">Plan factories, together.</h1>
        <p class="text-sm text-neutral-400">
          A realtime planner for ambitious build runs. Sign in to pick up where your save left off.
        </p>
        <UButton color="neutral" block @click="signIn">
          <template #leading>
            <UIcon name="i-mdi-google" />
          </template>
          Continue with Google
        </UButton>
      </div>

      <template #footer>
        <p class="text-center text-xs text-neutral-400">Copright © 2026 Jordan Kniest</p>
      </template>
    </UCard>
  </main>
</template>

<script setup lang="ts">
const client = useSupabaseClient();

async function signIn() {
  if (import.meta.client) {
    await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/confirm",
      },
    });
  }
}
</script>
