export default defineAppConfig({
  ui: {
    colors: {
      primary: "amber",
      neutral: "slate",
    },
    card: {
      slots: {
        root: "rounded-xl bg-neutral-900 ring-neutral-700/50",
        body: "p-6 sm:p-8",
        header: "px-6 py-4 sm:px-8",
        footer: "px-6 py-4 sm:px-8",
      },
    },
  },
});
