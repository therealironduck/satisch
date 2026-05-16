-- Without REPLICA IDENTITY FULL, DELETE events only carry the primary key (id).
-- Supabase Realtime cannot evaluate user_id-based filters or RLS policies on
-- deleted rows, so DELETE events are never delivered to subscribers.
ALTER TABLE save_game_collaborators REPLICA IDENTITY FULL;
ALTER TABLE save_games REPLICA IDENTITY FULL;
