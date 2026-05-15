# Implementation Plan: Google OAuth Authentication

**Branch**: `001-google-oauth-auth` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/001-google-oauth-auth/spec.md`

## Summary

Implement Google OAuth login using the already-installed `@nuxtjs/supabase` module (v2.0.8). The app's root (`/`) becomes a branded login screen matching the approved design. All routes are protected by the module's built-in auth redirect middleware configured in `nuxt.config.ts`. After authentication, users always land on a new `/dashboard` placeholder page. A `/confirm` page handles the OAuth PKCE callback from Supabase/Google and exchanges the code for a session. Sessions persist for 7 days (configured in Supabase dashboard, auto-refreshed by the module).

## Technical Context

**Language/Version**: TypeScript / Vue 3 / Nuxt 4.4  
**Primary Dependencies**: `@nuxtjs/supabase` 2.0.8 (already installed), `@nuxt/ui` v4 (already installed)  
**Storage**: Supabase Auth (platform-managed `auth.users` — no custom migrations required for this feature)  
**Testing**: None configured (oxlint + `vue-tsc` type-checking only)  
**Target Platform**: Web, SPA (SSR disabled, `ssr: false`)  
**Project Type**: Web application (SPA mode)  
**Performance Goals**: Full sign-in flow under 30 seconds; OAuth error recovery under 3 seconds  
**Constraints**: SSR disabled; index route prerendered as static HTML; all auth logic runs client-side; Nuxt UI v4 components only; no inline styles; no arbitrary Tailwind values  
**Scale/Scope**: Single-tenant MVP; 7-day persistent sessions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle                       | Status  | Notes                                                                                                                                                       |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Vue & Nuxt Idiomatic Code    | ✅ PASS | All pages use `<script setup>`, Composition API, file-based routing. `useSupabaseClient()` and `useSupabaseUser()` composables used throughout.             |
| II. Realtime-First Architecture | ✅ PASS | Auth sessions are a prerequisite for Supabase Realtime subscriptions — this feature enables, not blocks, future realtime work. No polling introduced.       |
| III. Supabase as Backend        | ✅ PASS | All auth via `@nuxtjs/supabase` module. No custom auth server. No migrations needed — Supabase manages `auth.users`.                                        |
| IV. Nuxt UI & Tailwind First    | ✅ PASS | Login card built with `UCard`, `UButton`, and standard Tailwind utilities. No inline styles, no arbitrary values. Google G icon via `@nuxt/ui` icon system. |
| V. SPA Rendering Model          | ✅ PASS | `ssr: false` preserved. Prerendered `/` remains — the module's auth middleware runs client-side only, which is correct for SPA mode.                        |

**Gate result**: All principles satisfied. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-google-oauth-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── navigation.md    # Route guard contract
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/
├── pages/
│   ├── index.vue          # Login page — replace existing stub with branded UI
│   ├── dashboard.vue      # Dashboard placeholder — new
│   └── confirm.vue        # OAuth callback handler — new
├── components/            # No new components needed for this feature
└── assets/css/main.css    # No changes needed

nuxt.config.ts             # Add supabase redirect config + env var references
.env                       # SUPABASE_URL + SUPABASE_KEY (not committed)
.env.example               # Env var template (committed)
```

**Structure Decision**: Single SPA project. Auth is entirely client-side via `@nuxtjs/supabase`. No backend directory. No new components — pages are thin and self-contained. No Supabase migrations — `auth.users` is platform-managed.
