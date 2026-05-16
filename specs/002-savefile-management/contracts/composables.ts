/**
 * Interface contract for the useSaveGames composable.
 *
 * Designed for realtime extension: the internal _handleUpsert / _handleDelete
 * functions are the same handlers a Supabase Realtime channel would call.
 * Adding subscription support later requires only wiring the channel, not
 * refactoring this interface or any consumer.
 */

import type { Ref } from "vue";

import type { SaveGameColor, SaveGameRow } from "./database";

/** The shape exposed to consumers. */
export interface UseSaveGamesReturn {
  /** Reactive list of the current user's save games, sorted newest-first. */
  saves: Ref<SaveGameRow[]>;
  /** True while the initial load or any mutation is in flight. */
  loading: Ref<boolean>;
  /** Non-null when the last operation failed. Cleared on the next successful op. */
  error: Ref<string | null>;

  /**
   * Create a new save game with optimistic update.
   * Prepends to saves[] immediately; rolls back on error.
   */
  create(input: { name: string; color: SaveGameColor }): Promise<void>;

  /**
   * Rename an existing save game with optimistic update.
   * Updates the name in saves[] immediately; rolls back on error.
   */
  rename(id: string, name: string): Promise<void>;

  /**
   * Delete a save game with optimistic update.
   * Removes from saves[] immediately; re-inserts on error.
   */
  remove(id: string): Promise<void>;
}

/**
 * Static color class map. All class strings are written in full so Tailwind CSS v4
 * can include them in the output bundle (dynamic interpolation would be purged).
 */
export interface SaveGameColorMeta {
  name: SaveGameColor;
  label: string;
  bgClass: string; // e.g. "bg-amber-400"
  ringClass: string; // e.g. "ring-amber-400" — used for selected swatch outline
}

export const SAVE_GAME_COLOR_PALETTE: SaveGameColorMeta[] = [
  { name: "amber", label: "Amber", bgClass: "bg-amber-400", ringClass: "ring-amber-400" },
  { name: "blue", label: "Blue", bgClass: "bg-blue-400", ringClass: "ring-blue-400" },
  { name: "green", label: "Green", bgClass: "bg-green-400", ringClass: "ring-green-400" },
  { name: "red", label: "Red", bgClass: "bg-red-400", ringClass: "ring-red-400" },
  { name: "violet", label: "Violet", bgClass: "bg-violet-400", ringClass: "ring-violet-400" },
  { name: "teal", label: "Teal", bgClass: "bg-teal-400", ringClass: "ring-teal-400" },
  { name: "orange", label: "Orange", bgClass: "bg-orange-400", ringClass: "ring-orange-400" },
  { name: "pink", label: "Pink", bgClass: "bg-pink-400", ringClass: "ring-pink-400" },
  { name: "slate", label: "Slate", bgClass: "bg-slate-400", ringClass: "ring-slate-400" },
];
