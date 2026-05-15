# Tasks: Google OAuth Authentication

**Input**: Design documents from `specs/001-google-oauth-auth/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/navigation.md ✅

**Tests**: Not requested — oxlint + vue-tsc type-checking serve as quality gates.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment and module configuration — blocks all user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Create `.env.example` at repo root with placeholder values `SUPABASE_URL=` and `SUPABASE_KEY=`
- [x] T002 Configure `@nuxtjs/supabase` redirect middleware in `nuxt.config.ts`: add `supabase: { redirect: true, redirectOptions: { login: '/', callback: '/confirm', exclude: ['/confirm'] } }`

**Checkpoint**: Env template exists. Module redirect middleware is active. All routes except `/` and `/confirm` now require authentication.

---

## Phase 2: User Story 1 — Sign In with Google (Priority: P1) 🎯 MVP

**Goal**: Visitors see a branded login screen and can authenticate with Google, landing on `/dashboard`.

**Independent Test**: Visit `http://localhost:3000`, click "Continue with Google", complete Google auth, verify redirect to `/dashboard`. Also verify that visiting `/dashboard` while unauthenticated redirects to `/`.

### Implementation for User Story 1

- [x] T003 [US1] Replace `app/pages/index.vue` with the branded login card: full-page dark background (`bg-neutral-950 min-h-screen flex items-center justify-center`), centered `UCard` (`max-w-sm w-full`), card header with hexagon icon + "satisch." wordmark, headline `<h1>Plan factories, together.</h1>`, subtitle "A realtime planner for ambitious build runs. Sign in to pick up where your save left off.", full-width `UButton color="white"` with Google G icon (`i-logos-google-icon`) labeled "Continue with Google", card footer with muted version string "V0.7.3 · BUILD 24A · SELF-HOSTED READY"
- [x] T004 [US1] Add `signInWithOAuth` click handler to `app/pages/index.vue`: use `useSupabaseClient()` composable, call `client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/confirm' } })` on button click; wrap in `import.meta.client` guard
- [x] T005 [US1] Create `app/pages/confirm.vue`: show a centered loading spinner (`UIcon name="i-heroicons-arrow-path" animate-spin`) while the `@nuxtjs/supabase` plugin exchanges the OAuth code for a session; page requires no auth logic — the module handles the code exchange and subsequent redirect to `/dashboard` automatically

**Checkpoint**: Full sign-in flow works end-to-end. Unauthenticated users hitting any protected route land on `/`. Authenticated users completing OAuth land on `/dashboard`.

---

## Phase 3: User Story 2 — Protected Dashboard Access (Priority: P2)

**Goal**: Authenticated users can access `/dashboard` and see a placeholder. Unauthenticated access redirects to `/`.

**Independent Test**: While authenticated, navigate to `http://localhost:3000/dashboard` — placeholder page is visible. Open incognito, navigate to `/dashboard` — redirected to `/`.

### Implementation for User Story 2

- [x] T006 [US2] Create `app/pages/dashboard.vue`: simple placeholder page with a `UContainer`, heading "Dashboard", and a muted paragraph "Coming soon — your factory planner goes here."; use `useSupabaseUser()` to display the authenticated user's email in a `UBadge` to confirm the session is active

**Checkpoint**: `/dashboard` renders for authenticated users. Unauthenticated access is blocked (handled by Phase 1 config — no additional code needed).

---

## Phase 4: User Story 3 — Session Persistence (Priority: P3)

**Goal**: Sessions last 7 days and survive page refreshes / browser reopens without re-authentication.

**Independent Test**: Log in, refresh the page — user remains on `/dashboard` without being redirected to `/`. Close and reopen the browser within 7 days — same result.

### Implementation for User Story 3

- [x] T007 [US3] Verify `@nuxtjs/supabase` session persistence config in `nuxt.config.ts`: confirm `cookieOptions` or `clientOptions.auth.persistSession` is not explicitly disabled (the module default is `persistSession: true`); if absent, no change needed — document this as a verified default in a code comment within `nuxt.config.ts`
- [x] T008 [US3] Confirm 7-day session lifetime in the Supabase dashboard: navigate to **Authentication → Settings** and verify JWT expiry is set to 604800 seconds (7 days); this is a dashboard-only change — no code required; document the setting in `specs/001-google-oauth-auth/quickstart.md` under a "Session Configuration" section

**Checkpoint**: Sessions persist across page refresh and browser reopen for up to 7 days.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Type-safety, lint compliance, and browser validation.

- [x] T009 [P] Run `bun run typecheck` from repo root and fix all type errors across `app/pages/index.vue`, `app/pages/confirm.vue`, and `app/pages/dashboard.vue`
- [x] T010 [P] Run `bun run lint` from repo root and fix all oxlint violations across modified files
- [x] T011 Run `bun run dev` and manually verify the full golden path in a browser: unauthenticated root → login screen renders correctly → "Continue with Google" → Google auth → `/confirm` loading → `/dashboard` placeholder → refresh → still authenticated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 — T002 must be complete before T003/T004/T005
- **Phase 3 (US2)**: Depends on Phase 1 — T006 can start after T002 (independently of US1)
- **Phase 4 (US3)**: Depends on Phase 1 — T007/T008 can start after T002 (independently)
- **Phase 5 (Polish)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 1 only. Core auth flow.
- **US2 (P2)**: Depends on Phase 1 only. Route protection provided by module config — no dependency on US1 code.
- **US3 (P3)**: Depends on Phase 1 only. Session persistence is a module default — verify only.

### Within Each Phase

- T003 → T004 (same file — implement UI first, then add handler)
- T003/T004 and T005 are independent (different files) — can run in parallel once T002 is done

---

## Parallel Opportunities

```
After T002 completes:
  Parallel: T003+T004 (index.vue) || T005 (confirm.vue) || T006 (dashboard.vue)

After all story phases:
  Parallel: T009 (typecheck) || T010 (lint)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: User Story 1 (T003, T004, T005)
3. **STOP and VALIDATE**: Full sign-in flow works in browser
4. Proceed to US2 + US3

### Incremental Delivery

1. T001 + T002 → Module configured, all routes protected
2. T003–T005 → Login screen + OAuth flow → **MVP: users can sign in**
3. T006 → Dashboard placeholder → users have a destination post-login
4. T007 + T008 → Session persistence confirmed
5. T009–T011 → Quality gates pass, ready for PR

---

## Notes

- [P] tasks = different files, no inter-dependencies, safe to run in parallel
- No Supabase migrations required — `auth.users` is platform-managed
- Session lifetime (7 days) is a Supabase dashboard setting — not a code change
- `bun run typecheck` and `bun run lint` MUST pass before feature is considered done (per constitution)
- UI MUST be validated in a running dev server against the golden path (per constitution)
