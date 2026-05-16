CREATE TABLE save_game_collaborators (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  save_game_id UUID        NOT NULL REFERENCES save_games(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  added_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (save_game_id, user_id)
);

CREATE INDEX ON save_game_collaborators (save_game_id);
CREATE INDEX ON save_game_collaborators (user_id);

DROP POLICY save_games_select_own ON save_games;

CREATE POLICY save_games_select ON save_games
  FOR SELECT USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM save_game_collaborators
      WHERE save_game_id = save_games.id
        AND user_id = auth.uid()
    )
  );

ALTER TABLE save_game_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY sgc_select_owner ON save_game_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM save_games
      WHERE id = save_game_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY sgc_select_self ON save_game_collaborators
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY sgc_insert_deny ON save_game_collaborators
  FOR INSERT WITH CHECK (false);

CREATE POLICY sgc_delete_owner ON save_game_collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM save_games
      WHERE id = save_game_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY sgc_delete_self ON save_game_collaborators
  FOR DELETE USING (user_id = auth.uid());

GRANT SELECT, DELETE ON save_game_collaborators TO authenticated;

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
  v_owner_id      UUID;
  v_invitee_id    UUID;
  v_invitee_email TEXT;
BEGIN
  SELECT owner_id INTO v_owner_id
    FROM save_games WHERE id = p_save_game_id;

  IF v_owner_id IS NULL OR v_owner_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT id, email INTO v_invitee_id, v_invitee_email
    FROM auth.users
   WHERE lower(email) = lower(p_email)
     AND deleted_at IS NULL
   LIMIT 1;

  IF v_invitee_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot invite yourself');
  END IF;

  IF v_invitee_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No account found with that email');
  END IF;

  IF EXISTS (
    SELECT 1 FROM save_game_collaborators
    WHERE save_game_id = p_save_game_id AND user_id = v_invitee_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already has access');
  END IF;

  INSERT INTO save_game_collaborators (save_game_id, user_id, email)
  VALUES (p_save_game_id, v_invitee_id, v_invitee_email);

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION invite_save_game_collaborator TO authenticated;
