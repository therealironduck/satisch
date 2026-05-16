# Tasks: Save File Sharing

**Input**: Design documents from `specs/003-save-file-sharing/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/supabase-rpc.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US4)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema + type definitions + realtime-capable composable update. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: Completes first; all user story phases depend on this.

- [x] T001 Write migration `supabase/migrations/20260516000001_add_save_game_collaborators.sql` — create `save_game_collaborators` table (columns: id, save_game_id, user_id, email, added_at; UNIQUE on (save_game_id, user_id); CASCADE on save_games delete and auth.users delete), indexes on (save_game_id) and (user_id), drop existing `save_games_select_own` policy and replace with owner-OR-collaborator EXISTS policy, enable RLS on the new table, create all five policies (sgc_select_owner, sgc_select_self, sgc_insert_deny, sgc_delete_owner, sgc_delete_self), create `invite_save_game_collaborator` SECURITY DEFINER RPC, grant table SELECT+DELETE and function EXECUTE to `authenticated`
- [x] T002 Apply migration to Supabase project using the Supabase MCP tool (`apply_migration`)
- [x] T003 [P] Add `SaveGameCollaborator` interface to `app/types/saveGame.ts` (fields: id, save_game_id, user_id, email, added_at — all strings)
- [x] T004 Update `app/composables/useSaveGames.ts` — add a Supabase Realtime channel subscribed to `postgres_changes` on `save_game_collaborators` filtered by `user_id=eq.<currentUserId>`; on INSERT or DELETE event set `fetched = false` and call the existing fetch logic to re-fetch all saves; subscribe in `onMounted`, unsubscribe in `onUnmounted`

**Checkpoint**: Migration applied, types defined, `useSaveGames` returns shared saves and reacts to collaborator changes.

---

## Phase 3: User Story 1 — Owner shares a save by email (Priority: P1) 🎯 MVP

**Goal**: Owner opens share dialog, enters a collaborator's email, and that user is immediately added and can see the save.

**Independent Test**: Sign in as user A, share a save to user B's email, sign in as user B — save appears in their dashboard.

- [x] T005 [P] [US1] Create `app/composables/useSaveGameCollaborators.ts` — accepts `saveGameId: Ref<string>`, fetches collaborator list from `save_game_collaborators` ordered by `added_at`, exposes `collaborators` (ref), `loading`, `error`, `invite(email: string)` (calls RPC `invite_save_game_collaborator`, returns mapped error message on failure), `remove(collaboratorId: string)` (optimistic delete with rollback), `leave(collaboratorId: string)` (same delete operation, distinct method name); subscribe to realtime `postgres_changes` on `save_game_collaborators` filtered by `save_game_id=eq.<saveGameId>` for live list updates
- [x] T006 [P] [US1] Create `app/components/SaveGame/SaveGameShareModal.vue` — `UModal` with props `open: boolean`, `save: SaveGame`; body contains a `UInput` (email, placeholder "Email address") + `UButton` ("Add", disabled when input is empty or loading); `UAlert` below input showing invite error when present; footer has a "Close" button; wire `useSaveGameCollaborators(computed(() => save.id))` inside
- [x] T007 [US1] Implement invite submit in `app/components/SaveGame/SaveGameShareModal.vue` — on "Add" click call `composable.invite(email)`, show returned error in `UAlert` if failure, clear input and clear error on success; disable button while loading
- [x] T008 [US1] Add share button to `app/components/Dashboard/DashboardSaveCard.vue` — add `UButton` with `icon="i-mdi-share-variant-outline"` and label "Share" next to the existing dropdown; add `showShare` ref; render `<LazySaveGameShareModal v-if="showShare" v-model:open="showShare" :save="save" />` at bottom of template
- [x] T009 [US1] Validate in dev server (`bun run dev`): click Share on a save, enter a registered email, confirm "Add" works, sign in as invitee and confirm save appears in their dashboard under All saves

**Checkpoint**: Owner can successfully invite a user by email; invited user sees the save in their dashboard.

---

## Phase 4: User Story 2 — Owner views and revokes collaborator access (Priority: P2)

**Goal**: Owner sees the full collaborator list in the share dialog and can remove any non-owner.

**Independent Test**: Share a save to user B, open the dialog as user A (owner) and verify B appears in the list with a remove button; click remove and verify B can no longer access the save.

- [x] T010 [US2] Add collaborator list to `app/components/SaveGame/SaveGameShareModal.vue` — below the invite form, render an owner row (current save owner's email from `save.owner_id` lookup — display as "You" if `isOwner`, else show email) labeled with a `UBadge` "OWNER"; for each `collaborator` in `composable.collaborators`, render a row showing `collaborator.email` + `collaborator.added_at` formatted as a relative date + a `UButton` icon-only (`i-mdi-close`) that is only visible when `isOwner`; add a realtime subscription in the composable (T005) so this list updates live
- [x] T011 [US2] Implement `remove()` in `app/composables/useSaveGameCollaborators.ts` — optimistically remove the collaborator from the local list, call `supabase.from('save_game_collaborators').delete().eq('id', collaboratorId)`, restore on error and set error message
- [x] T012 [US2] Wire remove button in `app/components/SaveGame/SaveGameShareModal.vue` — call `composable.remove(collaborator.id)` on click; show loading state on the specific row's button while deleting
- [x] T013 [US2] Validate in dev server: open share dialog as owner, verify collaborator list renders correctly with owner badge and remove buttons, revoke one user, verify their save access is gone

**Checkpoint**: Owner can view the full collaborator list and revoke individual access.

---

## Phase 5: User Story 3 — Collaborator leaves a shared save (Priority: P3)

**Goal**: A non-owner collaborator opens the share dialog and can voluntarily remove themselves.

**Independent Test**: Sign in as user B (collaborator), open the share dialog, click "Leave", confirm the save disappears from their dashboard.

- [x] T014 [US3] Implement `leave()` in `app/composables/useSaveGameCollaborators.ts` — identical to `remove()` but semantically named; optimistically removes current user's collaborator row, deletes from Supabase, restores on error
- [x] T015 [US3] Add "Leave" button to `app/components/SaveGame/SaveGameShareModal.vue` — on the current user's own collaborator row (when `!isOwner`), show a `UButton` "Leave" (`i-mdi-exit-to-app`) instead of the remove button; on click call `composable.leave(myCollaboratorRow.id)` then close the modal
- [x] T016 [US3] Validate in dev server: sign in as a collaborator, open share dialog, verify "Leave" button appears only on own row, click it, confirm modal closes and save disappears from their All saves list

**Checkpoint**: Non-owner collaborator can leave a shared save at will.

---

## Phase 6: User Story 4 — Sidebar filters (Priority: P4)

**Goal**: "Owned by me" and "Shared with me" sidebar buttons correctly filter the save list.

**Independent Test**: With at least one owned and one shared save, click each filter and verify the correct subset appears.

- [x] T017 [US4] Update `app/pages/dashboard.vue` — add `activeFilter` ref typed as `'all' | 'owned' | 'shared'` defaulting to `'all'`; compute `filteredSaves` from `saves` using `save.owner_id === user.value?.id` for owned; pass `filteredSaves` (not `saves`) to `DashboardSaveList`, pass `saves` (unfiltered) and `activeFilter` to `DashboardSidebar`, handle `@filter-change` event to update `activeFilter`
- [x] T018 [P] [US4] Update `app/components/Dashboard/DashboardSidebar.vue` — accept props `saves: SaveGame[]` and `activeFilter: string`; emit `filter-change` with the new filter value on each button click; apply active styling (e.g., `bg-neutral-800 text-white`) to the button matching `activeFilter`; compute owned count (`saves.filter(s => s.owner_id === user?.id).length`) and shared count (`saves.filter(s => s.owner_id !== user?.id).length`); add "Shared with me" button with `i-mdi-account-multiple-outline` icon and shared count badge
- [x] T019 [US4] Update `app/components/Dashboard/DashboardSaveList.vue` — accept an optional `activeFilter` prop; update the empty-state message to be filter-aware: "No saves yet — create your first one" for `all`, "No saves owned by you yet" for `owned`, "No saves shared with you yet" for `shared`
- [x] T020 [US4] Validate in dev server: toggle all three filter states, verify correct subset each time, verify empty state messages, verify badge counts in sidebar match filtered results

**Checkpoint**: All four sidebar filter states work correctly and display accurate counts.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Role badges, permission gates on save card actions, type checking, and end-to-end validation.

- [x] T021 Update `app/components/Dashboard/DashboardSaveCard.vue` — inject `useSupabaseUser()`; compute `isOwner = save.owner_id === user.value?.id`; replace hardcoded `UBadge label="OWNER"` with conditional: `isOwner ? { label: 'OWNER', color: 'warning' } : { label: 'SHARED', color: 'neutral' }` (or equivalent Nuxt UI v4 prop syntax)
- [x] T022 Update `app/components/Dashboard/DashboardSaveCard.vue` — gate the dropdown menu items: only include Rename and Delete items in `menuItems` computed when `isOwner` is true; when not owner, `menuItems` should be empty (hide the dropdown button entirely with `v-if="isOwner"`)
- [x] T023 Run `bun run typecheck` and fix all TypeScript errors across modified and new files
- [x] T024 Run `bun run lint` and fix all lint warnings/errors across modified and new files
- [x] T025 End-to-end golden path validation in dev server: (1) invite user B to a save, (2) open dialog as owner and verify collaborator list, (3) revoke user B, (4) add user B back, (5) sign in as user B, verify save appears, (6) user B opens dialog and leaves, (7) verify save disappears, (8) verify Owned by me / Shared with me filters work correctly for both users

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 3 completion (extends the share modal started in Phase 3)
- **US3 (Phase 5)**: Depends on Phase 4 completion (extends the collaborator list from Phase 4)
- **US4 (Phase 6)**: Depends on Phase 2 completion only — can start in parallel with US1 after Phase 2
- **Polish (Phase 7)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — independent
- **US2 (P2)**: After US1 — extends the share modal; not independently startable
- **US3 (P3)**: After US2 — adds "Leave" button to the collaborator list built in US2
- **US4 (P4)**: After Phase 2 — independent of US1/US2/US3

### Within Each Phase

- T005 and T006 in Phase 3 are parallel (different files)
- T010 and T011 in Phase 4 are parallel (different files)
- T018 in Phase 6 is parallel with T017 (different files, share same data shape)
- T021 and T022 in Phase 7 touch the same file — execute sequentially

### Parallel Opportunities

```bash
# Phase 2 — after T001+T002, run in parallel:
T003: Add SaveGameCollaborator type
T004: Update useSaveGames realtime

# Phase 3 — start in parallel:
T005: Create useSaveGameCollaborators composable
T006: Create SaveGameShareModal skeleton

# Phase 6 — start in parallel after T017:
T018: Update DashboardSidebar
T019: Update DashboardSaveList empty state
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (migration + types + realtime)
2. Complete Phase 3: US1 (invite by email)
3. **STOP and VALIDATE**: Invite a user, confirm they see the save — sharing works end-to-end
4. Continue to Phase 4 (revoke), Phase 5 (leave), Phase 6 (filters)

### Incremental Delivery

1. Phase 2 → foundation with shared saves appearing in dashboard
2. Phase 3 → invite works (MVP!)
3. Phase 4 → owner can revoke
4. Phase 5 → collaborator can leave
5. Phase 6 → sidebar filters functional
6. Phase 7 → polish and validation

---

## Notes

- Apply migration (T002) via Supabase MCP `apply_migration` tool — do not apply manually
- `isOwner` is always computed as `save.owner_id === user.value?.id`; never stored in a type field
- The `leave()` and `remove()` composable methods execute the same Supabase DELETE; the split is intentional for semantic clarity
- Realtime subscriptions in `useSaveGameCollaborators` are scoped to a single `saveGameId` — unsubscribe when the modal closes
- The module-level singleton in `useSaveGames` means the realtime channel (T004) is set up once per session
