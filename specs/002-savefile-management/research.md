# Research: Savefile Management

**Branch**: `002-savefile-management` | **Date**: 2026-05-16

## Decision 1: Color Storage & Rendering Strategy

**Decision**: Store the Tailwind color name (e.g., `"amber"`) as a plain string in the database. In the frontend, maintain a static `SAVE_GAME_COLORS` constant that maps each name to its full Tailwind CSS class string.

**Rationale**: Tailwind CSS v4 performs static analysis to tree-shake unused classes. Dynamic class interpolation like `` `bg-${color}-400` `` produces class strings that are never seen at build time and will be purged. A static map — `{ amber: 'bg-amber-400 ring-amber-400', blue: 'bg-blue-400 ring-blue-400', ... }` — ensures all class strings are visible to the compiler and included in the output bundle.

**Alternatives considered**:

- Storing the hex value: Rejected — would require inline styles (`style="background: #f59e0b"`) which the constitution prohibits.
- Using CSS variables per color: Rejected — adds complexity without benefit; static Tailwind classes are simpler.
- Storing the full Tailwind class: Rejected — couples the DB schema to styling implementation; the color name is a stable identity.

**Color palette and shade selection** (shade 400 chosen for readability on dark `slate-900+` backgrounds):

| Name   | Swatch class    | Ring class        |
| ------ | --------------- | ----------------- |
| amber  | `bg-amber-400`  | `ring-amber-400`  |
| blue   | `bg-blue-400`   | `ring-blue-400`   |
| green  | `bg-green-400`  | `ring-green-400`  |
| red    | `bg-red-400`    | `ring-red-400`    |
| violet | `bg-violet-400` | `ring-violet-400` |
| teal   | `bg-teal-400`   | `ring-teal-400`   |
| orange | `bg-orange-400` | `ring-orange-400` |
| pink   | `bg-pink-400`   | `ring-pink-400`   |
| slate  | `bg-slate-400`  | `ring-slate-400`  |

---

## Decision 2: Realtime-Ready Composable Pattern

**Decision**: `useSaveGames` uses a ref-based state with a one-time fetch in `onMounted`, plus an optimistic update pattern for all mutations. The composable exposes the same interface a Supabase Realtime subscription would call into — so adding a channel later requires only adding the subscription setup, not refactoring consumers.

**Rationale**: Constitution Principle II requires that no implementation blocks future realtime extension. The key insight is that optimistic updates (mutate local state immediately, confirm via server response, roll back on error) share the same state-update path that a realtime event handler would use. The channel subscription would call the same `_handleUpsert()` and `_handleDelete()` internal functions.

**Pattern**:

```
useSaveGames() returns:
  saves: Ref<SaveGame[]>        — reactive list, sorted newest-first
  loading: Ref<boolean>
  error: Ref<string | null>
  create(input): Promise<void>  — optimistic add → DB insert → confirm/rollback
  rename(id, name): Promise<void>
  remove(id): Promise<void>

Internal (not exported):
  _handleUpsert(row): void      — updates saves[] in place; called by channel later
  _handleDelete(id): void       — removes from saves[]; called by channel later
```

**Alternatives considered**:

- `useAsyncData`: Rejected — designed for SSR hydration; overkill for a client-only SPA fetch, and its caching semantics conflict with optimistic updates.
- Pinia store: Rejected — adds a dependency and abstraction layer not justified by current scope; a composable is sufficient and constitution doesn't mandate Pinia.
- Supabase subscription immediately: Rejected — collaboration is out of scope; a live subscription would send unnecessary traffic and would require handling multi-user conflict logic that isn't specced yet.

---

## Decision 3: Save Card Expansion State

**Decision**: Track expanded card state locally in `SaveList.vue` using a `Set<string>` of expanded save IDs. Multiple cards can be expanded simultaneously.

**Rationale**: Expansion state is pure UI state with no persistence requirement. A `Set` handles multiple concurrent expansions cleanly and avoids the "one open at a time" constraint from the prototype, which would feel limiting.

**Alternatives considered**:

- Single `openId` ref: Rejected — only one card open at a time feels arbitrary and limits UX.
- State in the composable: Rejected — UI state should not leak into data composables.

---

## Decision 4: Modal Strategy

**Decision**: Use Nuxt UI `UModal` for all three modal flows (create, rename, delete). Each modal is a standalone component receiving props and emitting events. The parent (`dashboard.vue` or `SaveCard.vue`) controls visibility via `v-model`.

**Rationale**: `UModal` is the Nuxt UI v4 standard for overlay dialogs. Using it consistently avoids custom overlay implementations and ensures focus-trapping and keyboard accessibility come for free.

**Dropdown for more menu**: Use `UDropdownMenu` with `items` prop to render the ⋯ button. This is the standard Nuxt UI pattern for action menus.

---

## Decision 5: Migration Timestamp

**Decision**: Use `TIMESTAMPTZ` (timestamp with timezone) for `created_at` and `updated_at`. Default `created_at` to `now()`. Set `updated_at` via a database trigger that fires on `UPDATE`.

**Rationale**: `TIMESTAMPTZ` is the Supabase/PostgreSQL best practice for timestamps. An `updated_at` trigger ensures the field is always accurate regardless of which client performs the update.

**RLS policies**:

- `SELECT`: `auth.uid() = owner_id`
- `INSERT`: `auth.uid() = owner_id` (ensures owner_id cannot be spoofed)
- `UPDATE`: `auth.uid() = owner_id`
- `DELETE`: `auth.uid() = owner_id`

No `USING` / `WITH CHECK` asymmetry needed — same user for all operations in this scope.
