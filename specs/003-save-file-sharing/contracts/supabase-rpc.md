# Contract: Supabase RPC — invite_save_game_collaborator

## Function signature

```
rpc('invite_save_game_collaborator', {
  p_save_game_id: string,  // UUID of the save game
  p_email: string          // Email address of the user to invite
})
```

**Caller**: Authenticated user (owner of the save game).

**Returns**: `JSONB`

```typescript
// Success
{ success: true }

// Failure
{ success: false, error: string }
```

**Possible error values** (for UI message mapping):

| `error` value                        | UI message                                     |
| ------------------------------------ | ---------------------------------------------- |
| `"Unauthorized"`                     | You do not have permission to share this save. |
| `"Cannot invite yourself"`           | You cannot invite yourself.                    |
| `"No account found with that email"` | No account found with that email address.      |
| `"User already has access"`          | This user already has access.                  |

**Side effects on success**: Inserts one row into `save_game_collaborators`. Triggers a Supabase Realtime event on the `save_game_collaborators` channel for the invitee.

---

## Supabase table access: `save_game_collaborators`

All client-facing table access is through standard `supabase-js` calls, gated by RLS.

### Read — collaborator list for share dialog

```
client
  .from('save_game_collaborators')
  .select('id, user_id, email, added_at')
  .eq('save_game_id', saveGameId)
  .order('added_at', { ascending: true })
```

Visible rows: owner sees all collaborators for their saves; collaborator sees only their own row.

### Delete — revoke (owner) or leave (collaborator)

```
client
  .from('save_game_collaborators')
  .delete()
  .eq('id', collaboratorRowId)
```

RLS enforces: owner can delete any row for their save; collaborator can only delete their own row.

---

## Realtime channel: `save_game_collaborators`

```typescript
client
  .channel("save_game_collaborators")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "save_game_collaborators",
      filter: `user_id=eq.${currentUserId}`,
    },
    handler,
  )
  .subscribe();
```

Used in `useSaveGames` to detect when the current user is added to or removed from a save game, triggering a re-fetch of the saves list.
