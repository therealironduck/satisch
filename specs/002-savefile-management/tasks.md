# Tasks: Savefile Management

**Input**: Design documents from `specs/002-savefile-management/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies with concurrent tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the scaffolding and shared constants that every user story depends on.

- [x] T001 Create component directories `app/components/Dashboard/` and `app/components/SaveGame/`
- [x] T002 [P] Create `app/types/saveGame.ts` with `SaveGameColor` union type, `SaveGame` interface (id, name, color, owner_id, created_at, updated_at), and `SAVE_GAME_COLOR_PALETTE` constant array with full static Tailwind class strings per research.md Decision 1

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema and the single composable that all three user stories read from and write to.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Write SQL migration to `supabase/migrations/20260516000000_create_save_games.sql` — exact SQL from data-model.md: `save_games` table, composite index on `(owner_id, created_at DESC)`, `set_updated_at` trigger, RLS enabled, four RLS policies (select/insert/update/delete all scoped to `auth.uid() = owner_id`)
- [x] T004 Apply the migration to the Supabase project (run `supabase db push` or apply via Supabase MCP `apply_migration` tool); confirm table and policies exist in the Supabase dashboard
- [x] T005 Create `app/composables/useSaveGames.ts` implementing the `UseSaveGamesReturn` interface from `contracts/composables.ts`: reactive `saves` ref (sorted newest-first by `created_at`), `loading` and `error` refs, fetch in `onMounted` via `useSupabaseClient().from('save_games').select('*').order('created_at', { ascending: false })`, and stub implementations for `create`, `rename`, `remove` that each: apply an optimistic local state update, call the Supabase client, and roll back on error — following research.md Decision 2 pattern

**Checkpoint**: Foundation ready — table exists with RLS, composable provides reactive save game state.

---

## Phase 3: User Story 1 — View Save Game List (Priority: P1) 🎯 MVP

**Goal**: Full dashboard layout with header, sidebar, and save game list. Each card is expandable to show a "No factories yet" placeholder. Empty state shown when user has no saves.

**Independent Test**: Navigate to `/dashboard` as an authenticated user. Verify the header shows brand logo + amber dot + search bar + user avatar. Verify the sidebar shows "All saves" and "Owned by me" with counts, Library section, and Settings link. Verify your save games appear as cards with name, color swatch, and OWNER badge. Verify clicking a card header expands it to show "No factories yet."

### Implementation

- [x] T006 [P] [US1] Create `app/components/Dashboard/Header.vue` — top bar with: brand mark (amber hexagon using CSS clip-path polygon, `bg-amber` with nested dark hexagon), text "satisch" + span with amber dot, search `UInput` placeholder (non-functional, no @input handler), and user avatar via `useSupabaseUser()` displayed as `UAvatar` with initials fallback; use `i-mdi-magnify` icon for search
- [x] T007 [P] [US1] Create `app/components/Dashboard/Sidebar.vue` — left nav with two sections: Workspace (links "All saves" with `i-mdi-folder-outline` + count badge, "Owned by me" with `i-mdi-cube-outline` + count badge, "Recently opened" with `i-mdi-history` as non-functional placeholder) and Library (Recipe catalog with `i-mdi-book-outline`, Blueprints with `i-mdi-flask-outline` as non-functional placeholders); Settings link anchored to bottom with `i-mdi-cog-outline`; accepts `saves` prop (array) to compute counts
- [x] T008 [P] [US1] Create `app/components/Dashboard/SaveCard.vue` — expandable card component accepting a `save` prop (SaveGame type); card header row shows: left color swatch div (4×4, rounded, using `bgClass` from SAVE_GAME_COLOR_PALETTE map), save name, OWNER `UBadge`, and chevron icon (`i-mdi-chevron-right`) that rotates 90° when expanded; expanded section shows "No factories yet" empty state message (placeholder for future factory feature); ⋯ `UButton` placeholder on header row (no action wired yet — that is US2)
- [x] T009 [US1] Create `app/components/Dashboard/SaveList.vue` — list component accepting `saves`, `loading`, `error` props; renders `DashboardSaveCard` for each save; shows skeleton/loading state when `loading` is true; shows `UAlert` error when `error` is non-null; shows empty state (centered message "No saves yet — create your first one") when `saves` is empty and not loading
- [x] T010 [US1] Rewrite `app/pages/dashboard.vue` — full-height layout with `DashboardHeader` fixed at top, `DashboardSidebar` on the left, and `DashboardSaveList` in the scrollable main area; pull `saves`, `loading`, `error` from `useSaveGames()`; include a "Welcome back, [firstName]" heading and total save count above the list; include a "New save game" `UButton` (primary, `i-mdi-plus` icon) as placeholder (no modal wired yet — that is US3)

**Checkpoint**: User Story 1 fully functional — dashboard loads, save list renders with correct layout, empty state visible when no saves, card expansion works.

---

## Phase 4: User Story 2 — Rename and Delete a Save Game (Priority: P2)

**Goal**: The ⋯ more menu on each save card is wired with "Rename" and "Delete" actions. Rename opens a modal pre-filled with the current name. Delete shows a confirmation dialog. Both reflect changes in the list without page reload.

**Independent Test**: With at least one save game visible, click ⋯ on a card. Verify "Rename" and "Delete" options appear. Rename: change the name and confirm — card label updates immediately. Delete: confirm the dialog — card disappears from list.

### Implementation

- [x] T011 [P] [US2] Create `app/components/SaveGame/RenameModal.vue` — `UModal` accepting `open` v-model, `save` prop (SaveGame); contains a `UInput` pre-filled with `save.name` (max 80 chars), a Cancel `UButton`, and a Rename `UButton` (primary, disabled when input is empty/whitespace); emits `confirm(newName: string)` on submit and `cancel` on close; shows a `UAlert` validation error if submitted with empty name
- [x] T012 [P] [US2] Create `app/components/SaveGame/DeleteModal.vue` — `UModal` accepting `open` v-model, `save` prop (SaveGame); shows confirmation message "Delete «[name]»? This cannot be undone."; Cancel and Delete (danger/red) `UButton`s; emits `confirm` and `cancel`
- [x] T013 [US2] Update `app/components/Dashboard/SaveCard.vue` to wire the ⋯ button as a `UDropdownMenu` with items `[{ label: 'Rename', icon: 'i-mdi-pencil-outline' }, { label: 'Delete', icon: 'i-mdi-trash-can-outline', color: 'error' }]`; include `SaveGameRenameModal` and `SaveGameDeleteModal` in template controlled by local `showRename` and `showDelete` refs; on rename confirm call `useSaveGames().rename(save.id, newName)`; on delete confirm call `useSaveGames().remove(save.id)`; show `UToast` on success/failure via `useToast()`

**Checkpoint**: User Story 2 fully functional — rename and delete both work with optimistic updates; errors surface via toast without losing the list state.

---

## Phase 5: User Story 3 — Create a New Save Game (Priority: P3)

**Goal**: The "New save game" button opens a modal. The user enters a name and picks a color. Confirming persists the save and it appears at the top of the list within 1 second.

**Independent Test**: Click "New save game," enter a name, pick a color (default pre-selected amber), confirm. Verify the new card appears at the top of the list with the correct name and color swatch. Verify the modal closes and name/color are reset for next use.

### Implementation

- [x] T014 [P] [US3] Create `app/components/SaveGame/ColorPicker.vue` — renders the 9-color swatch grid using `SAVE_GAME_COLOR_PALETTE`; each swatch is a `button` with `bgClass` applied from the palette map, ring/outline applied when selected (`ringClass`); accepts `modelValue` (SaveGameColor) and emits `update:modelValue`; default selected value is `"amber"`; no arbitrary Tailwind values — all class strings come from the static palette map
- [x] T015 [US3] Create `app/components/SaveGame/CreateModal.vue` — `UModal` with a `UInput` for name (max 80 chars, required, `i-mdi-folder-outline` leading icon), `SaveGameColorPicker` for color selection (pre-selected amber), Cancel and Create (primary) `UButton`s; Create disabled when name is empty/whitespace; on confirm calls `useSaveGames().create({ name, color })` then emits `created`; shows inline `UAlert` on error; resets form on close
- [x] T016 [US3] Wire the "New save game" button in `app/pages/dashboard.vue` to open `SaveGameCreateModal` via a `showCreate` ref; import and render the modal; on `created` event close the modal (list updates automatically via the composable's optimistic insert)

**Checkpoint**: All three user stories fully functional — create, view (with expansion), rename, delete all work end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type correctness, lint compliance, and full golden path validation.

- [x] T017 [P] Run `bun run typecheck` from repo root and fix any TypeScript errors across all new files (`app/types/saveGame.ts`, `app/composables/useSaveGames.ts`, all components)
- [x] T018 [P] Run `bun run lint` from repo root and fix any oxlint violations in all new and modified files
- [x] T019 Start dev server (`bun run dev`) and manually validate the full golden path in a browser: sign in → dashboard loads → empty state visible → create save (name + color) → card appears at top → expand card → "No factories yet" shown → rename save → name updates → delete save → card removed; check console for errors throughout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T001 and T002 are parallel
- **Foundational (Phase 2)**: Depends on Phase 1 (needs types from T002); T003→T004 sequential (write then apply); T005 parallel with T003/T004 (different file)
- **User Story 1 (Phase 3)**: Depends on Phase 2 complete; T006/T007/T008 parallel; T009 after T008; T010 after T009
- **User Story 2 (Phase 4)**: Depends on Phase 3 complete (needs SaveCard from T008); T011/T012 parallel; T013 after T011 and T012
- **User Story 3 (Phase 5)**: Depends on Phase 3 complete (needs dashboard from T010); T014 parallel with T015; T016 after T015
- **Polish (Phase 6)**: Depends on Phase 5 complete; T017/T018 parallel; T019 after both

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on US2 or US3
- **US2 (P2)**: Depends on US1 (extends SaveCard.vue from T008)
- **US3 (P3)**: Depends on US1 (wires into dashboard.vue from T010)

### Parallel Opportunities

Within Phase 3: T006, T007, T008 can all run in parallel (separate component files).  
Within Phase 4: T011 and T012 can run in parallel (separate modal files).  
Within Phase 6: T017 and T018 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# These three tasks have no shared dependencies — launch together:
Task T006: "Create app/components/Dashboard/Header.vue"
Task T007: "Create app/components/Dashboard/Sidebar.vue"
Task T008: "Create app/components/Dashboard/SaveCard.vue"

# Then sequential:
Task T009: "Create app/components/Dashboard/SaveList.vue"  (needs T008)
Task T010: "Rewrite app/pages/dashboard.vue"              (needs T009)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T005)
3. Complete Phase 3: User Story 1 (T006–T010)
4. **STOP and VALIDATE**: Open dev server, verify list loads, card expands, empty state shows
5. Deploy/demo if ready — fully usable dashboard with live data

### Incremental Delivery

1. Setup + Foundational → database and composable ready
2. User Story 1 → Dashboard visible with real data (MVP!)
3. User Story 2 → Rename and delete wired
4. User Story 3 → Create modal wired
5. Polish → typecheck + lint + full golden path

---

## Notes

- **No inline styles**: All colors come from static Tailwind classes in `SAVE_GAME_COLOR_PALETTE` (research.md Decision 1)
- **No arbitrary Tailwind values**: All class strings are written in full in the palette map
- **MDI icons only**: All `i-mdi-*` prefixed icons from Material Design Icons
- **Nuxt auto-imports**: `useSupabaseClient`, `useSupabaseUser`, `useToast`, `useSaveGames` do not need explicit imports
- **SPA guard**: The composable fetch runs in `onMounted` — no server-side code
- **Realtime-ready**: The composable's internal state update methods (research.md Decision 2) are the same handlers a future Supabase channel would call
