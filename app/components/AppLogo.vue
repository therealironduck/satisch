<template>
  <div class="flex items-center gap-2">
    <div class="brand-mark relative shrink-0 bg-amber-400" :class="sizeClass" />
    <span class="text-lg font-bold text-white"> satisch<span class="text-amber-400">.</span> </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: "sm" | "md" }>(), { size: "md" });

const sizeClass = computed(() => (props.size === "sm" ? "size-7" : "size-8"));
</script>
