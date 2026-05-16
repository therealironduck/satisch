/**
 * TypeScript types for the save_games table.
 * These mirror the Supabase database schema exactly.
 */

export type SaveGameColor =
  | "amber"
  | "blue"
  | "green"
  | "red"
  | "violet"
  | "teal"
  | "orange"
  | "pink"
  | "slate";

export interface SaveGameRow {
  id: string; // uuid
  name: string; // text, 1–80 chars, trimmed non-empty
  color: SaveGameColor;
  owner_id: string; // uuid, references auth.users
  created_at: string; // timestamptz ISO string
  updated_at: string; // timestamptz ISO string
}

/** Shape used when inserting a new save game. owner_id is set server-side via RLS. */
export interface SaveGameInsert {
  name: string;
  color: SaveGameColor;
  owner_id: string; // must equal auth.uid()
}

/** Shape used when updating an existing save game. Only name is mutable in this scope. */
export interface SaveGameUpdate {
  name: string;
}
