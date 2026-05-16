# Research: Save File Sharing

## Decision 1: User email lookup strategy for invite

**Decision**: Use a PostgreSQL function (RPC) with `SECURITY DEFINER` to perform the email lookup and collaborator insertion in a single server-side transaction.

**Rationale**: The `auth.users` table is not accessible from client-side Supabase queries under normal RLS. A `SECURITY DEFINER` function runs with elevated privileges and can safely query `auth.users`, validate the invite (ownership check, self-invite check, duplicate check), and insert the collaborator record atomically. This avoids exposing raw user data and keeps all invite logic server-side.

**Alternatives considered**:

- `profiles` table (auto-populated via trigger on `auth.users`): More complex — requires a new table, a trigger, and ongoing sync. Rejected for now due to added migration scope.
- Storing email in the `save_game_collaborators` row and looking it up client-side: Client cannot access `auth.users.email`. Rejected.

---

## Decision 2: Collaborator display data

**Decision**: Store the invitee's email in `save_game_collaborators.email` at insert time (within the RPC). This denormalizes the email for display purposes in the share dialog.

**Rationale**: The invite RPC already has access to `auth.users.email` at insert time. Storing it avoids a secondary query to look up display data. The stored email is display-only; the authoritative identity is always `user_id`.

**Alternatives considered**:

- Join against `auth.users` in a SECURITY DEFINER view: Works but adds complexity and another migration object. Rejected in favour of simpler denormalization.

---

## Decision 3: Updating `save_games` RLS SELECT policy for collaborators

**Decision**: Extend the existing `save_games_select_own` policy (or replace it with a new one) so that a row is visible to both the owner and any entry in `save_game_collaborators`.

**Rationale**: Currently, `select("*")` on `save_games` via Supabase only returns rows where `owner_id = auth.uid()`. To surface shared saves without changing the query in `useSaveGames`, the RLS policy must be broadened. Using an `EXISTS` subquery on `save_game_collaborators` is the standard Supabase pattern.

**Alternatives considered**:

- Separate query for shared saves, merged in the composable: Requires two round-trips and complicates state management. Rejected.

---

## Decision 4: Realtime subscription strategy for shared saves

**Decision**: Subscribe to `postgres_changes` on `save_game_collaborators` filtered by `user_id = <currentUserId>`. On INSERT (added as collaborator) or DELETE (removed/left), re-fetch the full save list. Subscribe within `useSaveGames` alongside the existing singleton pattern.

**Rationale**: The composable already uses module-level shared state. Adding a realtime channel here keeps subscriptions co-located with data fetching. Filtering by `user_id` ensures users only receive events about their own collaborator records, consistent with RLS.

**Alternatives considered**:

- Optimistic update without re-fetch: Would require fetching the full save record on INSERT, which is complex without a channel-specific payload. Re-fetch is simpler and acceptable for this action (sharing is infrequent).

---

## Decision 5: Sidebar filter state location

**Decision**: Filter state (`all` | `owned` | `shared`) is lifted to `dashboard.vue`. The sidebar emits a `filter-change` event; `dashboard.vue` computes the filtered save list and passes it down to `DashboardSaveList`.

**Rationale**: Sidebar and list are siblings — the page is the correct owner of shared state. This keeps `DashboardSidebar` and `DashboardSaveList` stateless with respect to each other.

**Alternatives considered**:

- Sidebar uses `inject/provide`: Overkill for a two-level component tree. Rejected.
- `useSaveGames` exposes a filter computed: Mixes UI-state concerns into a data composable. Rejected.

---

## Decision 6: Owner role detection

**Decision**: Compute `isOwner` from `save.owner_id === user.value?.id` in each component that needs it. No new field is added to the `SaveGame` type.

**Rationale**: `owner_id` is already returned by `save_games` and stored in the `SaveGame` type. Computing ownership client-side from this field is zero-overhead and requires no migration or type change.
