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

  supabase: {
    redirect: true,
    useSsrCookies: false,
    redirectOptions: {
      login: "/",
      callback: "/confirm",
      exclude: ["/confirm"],
    },
    // persistSession defaults to true in @nuxtjs/supabase — sessions persist for 7 days (set in Supabase dashboard: Authentication → Settings → JWT Expiry = 604800s)
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
  },

  app: {
    head: {
      htmlAttrs: { lang: "en", class: "dark" },
      title: "Satisch",
    },
  },

  compatibilityDate: "2025-01-15",

  experimental: {
    viteEnvironmentApi: true,
  },
});
