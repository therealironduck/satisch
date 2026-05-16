-- The save_games_select policy queried save_game_collaborators, whose
-- sgc_select_owner policy queried save_games, causing infinite recursion.
-- A SECURITY DEFINER function bypasses RLS on save_game_collaborators,
-- breaking the cycle.
CREATE OR REPLACE FUNCTION is_save_game_collaborator(p_save_game_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM save_game_collaborators
    WHERE save_game_id = p_save_game_id
      AND user_id = p_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION is_save_game_collaborator(UUID, UUID) TO authenticated;

DROP POLICY save_games_select ON save_games;

CREATE POLICY save_games_select ON save_games
  FOR SELECT USING (
    auth.uid() = owner_id
    OR is_save_game_collaborator(id, auth.uid())
  );
