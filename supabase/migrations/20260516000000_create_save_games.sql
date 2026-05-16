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
  owner_id   UUID        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Grant table access to authenticated users (RLS policies filter rows, but base access must be granted)
GRANT SELECT, INSERT, UPDATE, DELETE ON save_games TO authenticated;
