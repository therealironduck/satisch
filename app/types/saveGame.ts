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

export interface SaveGame {
  id: string;
  name: string;
  color: SaveGameColor;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface SaveGameCollaborator {
  id: string;
  save_game_id: string;
  user_id: string;
  email: string;
  added_at: string;
}

export interface SaveGameColorMeta {
  name: SaveGameColor;
  label: string;
  bgClass: string;
  ringClass: string;
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
