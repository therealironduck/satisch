# Data Model: Save File Sharing

## New Table: `save_game_collaborators`

```sql
CREATE TABLE save_game_collaborators (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  save_game_id UUID        NOT NULL REFERENCES save_games(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,   -- denormalized display copy; authoritative identity is user_id
  added_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (save_game_id, user_id)
);
```

**Indexes**:

- `(save_game_id)` — for owner querying all collaborators of a save
- `(user_id)` — for realtime filter and "shared with me" query

**Cascade behavior**: Deleting a `save_games` row cascades to all its `save_game_collaborators` rows. Deleting a `auth.users` row cascades to all `save_game_collaborators` rows for that user.

---

## Modified Table: `save_games`

No schema change. The RLS SELECT policy is extended to allow collaborators to read the row.

**Updated SELECT policy**:

```sql
-- Drop old single-owner policy
DROP POLICY save_games_select_own ON save_games;

-- New policy: owner OR collaborator
CREATE POLICY save_games_select ON save_games
  FOR SELECT USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM save_game_collaborators
      WHERE save_game_id = save_games.id
        AND user_id = auth.uid()
    )
  );
```

All other `save_games` policies (INSERT, UPDATE, DELETE) remain owner-only — no change.

---

## New Database Function: `invite_save_game_collaborator`

```sql
CREATE FUNCTION invite_save_game_collaborator(
  p_save_game_id UUID,
  p_email        TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id    UUID;
  v_invitee_id  UUID;
  v_invitee_email TEXT;
BEGIN
  -- Verify caller owns the save
  SELECT owner_id INTO v_owner_id
    FROM save_games WHERE id = p_save_game_id;

  IF v_owner_id IS NULL OR v_owner_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Block self-invite
  SELECT id, email INTO v_invitee_id, v_invitee_email
    FROM auth.users
   WHERE lower(email) = lower(p_email)
     AND deleted_at IS NULL
   LIMIT 1;

  IF v_invitee_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot invite yourself');
  END IF;

  -- User must have an account
  IF v_invitee_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No account found with that email');
  END IF;

  -- Block duplicate invite
  IF EXISTS (
    SELECT 1 FROM save_game_collaborators
    WHERE save_game_id = p_save_game_id AND user_id = v_invitee_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already has access');
  END IF;

  -- Insert
  INSERT INTO save_game_collaborators (save_game_id, user_id, email)
  VALUES (p_save_game_id, v_invitee_id, v_invitee_email);

  RETURN jsonb_build_object('success', true);
END;
$$;
```

**GRANT**: `GRANT EXECUTE ON FUNCTION invite_save_game_collaborator TO authenticated;`

---

## RLS Policies: `save_game_collaborators`

```sql
ALTER TABLE save_game_collaborators ENABLE ROW LEVEL SECURITY;

-- Owner of the save sees all collaborator rows for their saves
CREATE POLICY sgc_select_owner ON save_game_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM save_games
      WHERE id = save_game_id AND owner_id = auth.uid()
    )
  );

-- Collaborator sees only their own row
CREATE POLICY sgc_select_self ON save_game_collaborators
  FOR SELECT USING (user_id = auth.uid());

-- Inserts are blocked from client; handled exclusively via RPC
CREATE POLICY sgc_insert_deny ON save_game_collaborators
  FOR INSERT WITH CHECK (false);

-- Owner can revoke (delete any collaborator row for their save)
CREATE POLICY sgc_delete_owner ON save_game_collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM save_games
      WHERE id = save_game_id AND owner_id = auth.uid()
    )
  );

-- Collaborator can leave (delete their own row)
CREATE POLICY sgc_delete_self ON save_game_collaborators
  FOR DELETE USING (user_id = auth.uid());

GRANT SELECT, DELETE ON save_game_collaborators TO authenticated;
```

---

## TypeScript Type: `SaveGameCollaborator`

```typescript
export interface SaveGameCollaborator {
  id: string;
  save_game_id: string;
  user_id: string;
  email: string;
  added_at: string;
}
```

Add to `app/types/saveGame.ts`.

---

## Relationship Diagram

```
auth.users
  │  (owner_id FK)           (user_id FK)
  ├──────────────────► save_games ◄──────── save_game_collaborators
  │                                                │
  └─────────────────────────────────────────── (user_id FK)
```

- One `auth.users` row owns many `save_games`
- One `save_games` row has many `save_game_collaborators`
- One `auth.users` row appears in many `save_game_collaborators` (as collaborator)
- Deleting `save_games` cascades to `save_game_collaborators`
- Deleting `auth.users` cascades to both owned `save_games` and collaborator rows
