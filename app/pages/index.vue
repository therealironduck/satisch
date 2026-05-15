<template>
  <main class="relative grid min-h-dvh place-items-center overflow-hidden bg-neutral-950">
    <!-- radial-gradient: no standard Tailwind utility for ellipse sizing/position -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,oklch(22%_0.012_240),transparent)]"
    />
    <div class="bg-grid" />

    <UCard
      class="relative z-10 w-96 animate-fadein shadow-2xl"
      :ui="{
        root: 'bg-gradient-to-b from-neutral-800 to-neutral-900 ring-0 border border-neutral-700/60 rounded-xl overflow-visible',
        body: 'px-8 pt-9 pb-7',
      }"
    >
      <div
        class="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent"
      />

      <div class="mb-7 flex items-center gap-2.5">
        <div class="brand-mark relative size-7 shrink-0 bg-amber-400" />
        <span class="text-lg font-semibold tracking-tight text-neutral-50">
          satisch<span class="text-amber-400">.</span>
        </span>
      </div>

      <h1 class="mb-1.5 text-2xl font-semibold tracking-tight text-neutral-50">
        Plan factories, together.
      </h1>
      <p class="mb-7 text-sm leading-relaxed text-neutral-400">
        A realtime planner for ambitious build runs. Sign in to pick up where your save left off.
      </p>

      <button
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-white bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70"
        :disabled="loading"
        @click="signIn"
      >
        <!-- Google G logo: OAuth provider brand asset, no MDI equivalent (constitution §IV exception) -->
        <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.69 4.4-5.35 4.4a6.13 6.13 0 1 1 0-12.26c1.74 0 2.9.74 3.57 1.37l2.43-2.34A9.4 9.4 0 0 0 12 2.5 9.5 9.5 0 1 0 21.45 12c0-.31-.04-.62-.1-.9Z"
          />
          <path
            fill="#34A853"
            d="M3.07 7.6 5.7 9.53A6.13 6.13 0 0 1 12 5.87c1.74 0 2.9.74 3.57 1.37l2.43-2.34A9.4 9.4 0 0 0 12 2.5C8.06 2.5 4.66 4.7 3.07 7.6Z"
          />
          <path
            fill="#FBBC05"
            d="M12 21.5c2.55 0 4.7-.84 6.27-2.28l-2.99-2.45c-.82.57-1.92.97-3.28.97a6.12 6.12 0 0 1-5.77-4.04L3.2 16.04A9.5 9.5 0 0 0 12 21.5Z"
          />
          <path
            fill="#EA4335"
            d="M3.2 16.04 6.23 13.7a6.1 6.1 0 0 1-.36-2.7l-3.04-2.4A9.46 9.46 0 0 0 2.5 12c0 1.49.32 2.9.7 4.04Z"
          />
        </svg>
        {{ loading ? "Signing in…" : "Continue with Google" }}
      </button>
    </UCard>

    <div
      class="absolute bottom-6 left-6 flex items-center gap-2 font-mono text-xs tracking-wider text-neutral-600 uppercase"
    >
      Copyright © 2026 Jordan Kniest
    </div>
  </main>
</template>

<script setup lang="ts">
const loading = ref(false);
const client = useSupabaseClient();

async function signIn() {
  if (!import.meta.client) return;
  loading.value = true;
  try {
    await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/confirm",
      },
    });
  } finally {
    loading.value = false;
  }
}
</script>
