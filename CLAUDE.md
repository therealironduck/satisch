# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Satisch is an online [Satisfactory](https://www.satisfactorygame.com/) factory planner with planned realtime multiplayer support. Built with Nuxt 4 + Nuxt UI, SSR disabled (SPA mode), with the index route prerendered.

## Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run preview      # Preview production build
bun run typecheck    # Run vue-tsc type checking
bun run lint         # Lint with oxlint
bun run lint:fix     # Lint and auto-fix
bun run fmt          # Format with oxfmt
bun run fmt:check    # Check formatting without writing
```

## Architecture

- **Framework**: Nuxt 4 with `app/` source directory (Nuxt 4 layout)
- **UI**: `@nuxt/ui` v4 (Tailwind CSS v4 based), primary color `amber`, neutral `slate`
- **Modules**: `@nuxt/ui`, `@nuxt/a11y`, `@nuxt/hints`, `@nuxt/image`, `@nuxt/scripts`
- **Rendering**: SSR disabled; index route is prerendered
- **Tooling**: oxlint (with eslint, typescript, unicorn, vue plugins; type-aware) + oxfmt for formatting

App entry is `app/app.vue`, pages live in `app/pages/`, components in `app/components/`. Global CSS at `assets/css/main.css`. App-level Nuxt UI config (colors, tokens) is in `app/app.config.ts`.

<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/002-savefile-management/plan.md`.

<!-- SPECKIT END -->
