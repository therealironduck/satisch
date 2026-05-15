<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR — new binding icon-set rule added to Principle IV.

Modified principles:
  - IV. Nuxt UI & Tailwind First → extended with icon-set constraint (MDI only)

Added sections: None
Removed sections: None

Templates reviewed:
  ✅ .specify/templates/plan-template.md — no icon-specific references; no update needed
  ✅ .specify/templates/spec-template.md — no icon-specific references; no update needed
  ✅ .specify/templates/tasks-template.md — no icon-specific references; no update needed

Follow-up TODOs: None — all fields resolved.
-->

# Satisch Constitution

## Core Principles

### I. Vue & Nuxt Idiomatic Code

All code MUST follow Vue 3 Composition API patterns exclusively. `<script setup>` syntax is
mandatory for all components. Nuxt 4 conventions MUST be respected: the `app/` source directory
layout, Nuxt auto-imports for composables and utilities, and file-based routing under `app/pages/`.
Options API and class-based components are PROHIBITED. Composables MUST be extracted for shared
reactive logic. Components MUST be single-responsibility.

### II. Realtime-First Architecture

Every feature MUST be designed with WebSocket and realtime compatibility from the outset.
No implementation may be structured in a way that prevents future realtime extension (e.g.,
polling-only state that cannot be replaced with a subscription without a full rewrite).
Supabase Realtime channels MUST be used for live data propagation. State management MUST
accommodate concurrent multi-user updates gracefully.

### III. Supabase as Backend

Supabase is the sole backend provider for this project. All database operations, authentication,
file storage, and realtime subscriptions MUST go through Supabase. Database migrations MUST be
written as SQL files and stored in the repository under `supabase/migrations/`. Migrations MUST
be applied via the Supabase CLI and MUST be committed alongside the feature code that requires
them. No schema changes may be applied outside of the migration system.

### IV. Nuxt UI & Tailwind First

All UI MUST use `@nuxt/ui` v4 components wherever a suitable component exists. Custom HTML
elements MUST only be used when no Nuxt UI equivalent is available. Styling MUST use Tailwind
CSS default utility classes. Project-level color and token overrides are defined exclusively in
`app/app.config.ts` (primary: `amber`, neutral: `slate`). Arbitrary values (e.g.,
`text-[#abc]`) are PROHIBITED unless no default utility covers the requirement. Inline styles
are PROHIBITED.

**Icon set**: All icons MUST use the Material Design Icons set exclusively, referenced via the
`i-mdi-*` prefix (e.g., `i-mdi-cube-outline`, `i-mdi-refresh`). Other icon collections
(`heroicons`, `logos`, `tabler`, etc.) are PROHIBITED. The single exception is third-party brand
assets that have no MDI equivalent and are required for compliance (e.g., OAuth provider buttons
mandated by the provider's branding guidelines) — such exceptions MUST be documented inline.

### V. SPA Rendering Model

The application MUST remain SSR-disabled (SPA mode). The index route is prerendered and this
MUST be preserved. All features MUST be safe to render client-side only. Code that reads from
`document`, `window`, or browser APIs MUST be guarded with `onMounted` or `import.meta.client`
checks. Server-only logic MUST not be introduced without explicit architectural review.

## Technology Stack & Tooling

- **Framework**: Nuxt 4 (`app/` directory layout)
- **UI Library**: `@nuxt/ui` v4 — Tailwind CSS v4 based
- **Icons**: Material Design Icons (`i-mdi-*`) exclusively
- **Backend**: Supabase (database, auth, realtime, storage)
- **Migrations**: SQL files in `supabase/migrations/`, managed via Supabase CLI
- **Linting**: oxlint with eslint, typescript, unicorn, and vue plugins (type-aware)
- **Formatting**: oxfmt
- **Package Manager**: Bun
- **Modules in use**: `@nuxt/ui`, `@nuxt/a11y`, `@nuxt/hints`, `@nuxt/image`, `@nuxt/scripts`

All new dependencies MUST be evaluated for Supabase/realtime compatibility and SSR-disabled
correctness before adoption.

## Development Workflow

- Features begin with a spec (`/speckit-specify`) and branch (`/speckit-git-feature`).
- Every PR MUST include any Supabase migrations required by the feature.
- Migrations MUST be reviewed for destructive operations (column drops, type changes) and
  MUST include a rollback strategy or explicit acknowledgment that rollback is not possible.
- Realtime compatibility MUST be verified during plan (`/speckit-plan`) Constitution Check.
- UI tasks MUST be validated in a running dev server (`bun run dev`) against the golden path
  before marking complete.
- `bun run typecheck` and `bun run lint` MUST pass before any feature is considered done.

## Governance

This constitution supersedes all other development guidelines for the Satisch project. Any
practice not covered here defaults to Vue/Nuxt community conventions.

**Amendment procedure**: Amendments MUST be proposed with a rationale, reviewed against all
active feature specs for impact, and applied via `/speckit-constitution` with a version bump.
Removing or redefining an existing principle requires a MAJOR version bump and a migration
note for any in-flight features affected.

**Versioning policy**: Semantic versioning applies — MAJOR for breaking principle changes,
MINOR for new principles or sections, PATCH for clarifications and wording fixes.

**Compliance**: All PRs and plan reviews MUST include a Constitution Check gate that verifies
adherence to principles I–V before implementation proceeds.

**Version**: 1.1.0 | **Ratified**: 2026-05-15 | **Last Amended**: 2026-05-15
