# Data Model: Savefile Management

**Branch**: `002-savefile-management` | **Date**: 2026-05-16

## Entity: SaveGame

Represents a named planning workspace owned by one user.

### Fields

| Column       | Type          | Constraints                                                                                       | Notes                                |
| ------------ | ------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `id`         | `uuid`        | PK, DEFAULT `gen_random_uuid()`                                                                   | Stable identifier                    |
| `name`       | `text`        | NOT NULL, CHECK `length(trim(name)) > 0`, CHECK `length(name) <= 80`                              | Display name; not unique             |
| `color`      | `text`        | NOT NULL, CHECK `color IN ('amber','blue','green','red','violet','teal','orange','pink','slate')` | Tailwind palette key                 |
| `owner_id`   | `uuid`        | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE                                                 | Set from `auth.uid()` at insert time |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()`                                                                         | Sort key (newest first)              |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()`                                                                         | Maintained by trigger                |

### Validation Rules (enforced at DB level)

- `name`: trimmed length must be > 0 and ≤ 80 characters
- `color`: must be one of the 9 allowed palette names
- `owner_id`: must match `auth.uid()` (enforced by RLS INSERT policy)

### Indexes

- PK on `id` (automatic)
- Index on `(owner_id, created_at DESC)` — supports the primary query: all saves for current user, newest first

### State Transitions

```
(none) → CREATED (INSERT) → RENAMED (UPDATE name) → DELETED (DELETE)
```

No soft-delete in this scope. Deletion is permanent.

---

## Row-Level Security Policies

Table has RLS enabled. All four policies reference `auth.uid() = owner_id`.

| Policy name             | Command | USING expression        | WITH CHECK expression   |
| ----------------------- | ------- | ----------------------- | ----------------------- |
| `save_games_select_own` | SELECT  | `auth.uid() = owner_id` | —                       |
| `save_games_insert_own` | INSERT  | —                       | `auth.uid() = owner_id` |
| `save_games_update_own` | UPDATE  | `auth.uid() = owner_id` | `auth.uid() = owner_id` |
| `save_games_delete_own` | DELETE  | `auth.uid() = owner_id` | —                       |

---

## Migration File

**Path**: `supabase/migrations/20260516000000_create_save_games.sql`

```sql
-- Create updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Save games table
CREATE TABLE save_games (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL
                         CHECK (length(trim(name)) > 0)
                         CHECK (length(name) <= 80),
  color      TEXT        NOT NULL
                         CHECK (color IN ('amber','blue','green','red','violet','teal','orange','pink','slate')),
  owner_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for primary query (user's saves, newest first)
CREATE INDEX save_games_owner_created ON save_games (owner_id, created_at DESC);

-- Auto-update updated_at on modification
CREATE TRIGGER save_games_set_updated_at
  BEFORE UPDATE ON save_games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable RLS
ALTER TABLE save_games ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY save_games_select_own ON save_games
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY save_games_insert_own ON save_games
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY save_games_update_own ON save_games
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY save_games_delete_own ON save_games
  FOR DELETE USING (auth.uid() = owner_id);
```

### Rollback strategy

```sql
DROP TABLE IF EXISTS save_games;
DROP FUNCTION IF EXISTS set_updated_at();
```

> The `set_updated_at` function is generic — if other tables already use it, omit the `CREATE OR REPLACE FUNCTION` from the rollback.
