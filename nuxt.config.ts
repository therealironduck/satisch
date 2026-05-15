// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/a11y",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxtjs/supabase",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],
  ssr: false,

  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  experimental: {
    viteEnvironmentApi: true,
  },
});
