import type { SaveGame, SaveGameColor } from "~/types/saveGame";

// Module-level shared state — all calls to useSaveGames() share the same refs
const saves = ref<SaveGame[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
let fetched = false;
let subscribedCollaboratorsUserId: string | null = null;
let collaboratorsChannel: any = null;
let savesChannelReady = false;

export function useSaveGames() {
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  function _handleUpsert(row: SaveGame) {
    const index = saves.value.findIndex((s) => s.id === row.id);
    if (index >= 0) {
      saves.value[index] = row;
    } else {
      saves.value.unshift(row);
    }
  }

  function _handleDelete(id: string) {
    saves.value = saves.value.filter((s) => s.id !== id);
  }

  async function _fetch() {
    fetched = true;
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await client
      .from("save_games")
      .select("*")
      .order("created_at", { ascending: false });

    loading.value = false;

    if (fetchError) {
      error.value = fetchError.message;
      fetched = false;
      return;
    }

    saves.value = (data as SaveGame[]) ?? [];
  }

  onMounted(async () => {
    if (!fetched) await _fetch();

    const userId = user.value?.id;
    if (userId && userId !== subscribedCollaboratorsUserId) {
      if (collaboratorsChannel) void client.removeChannel(collaboratorsChannel);
      subscribedCollaboratorsUserId = userId;
      collaboratorsChannel = client
        .channel("save_game_collaborators_user")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "save_game_collaborators",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetched = false;
            void _fetch();
          },
        )
        .subscribe();
    }

    if (!savesChannelReady) {
      savesChannelReady = true;
      client
        .channel("save_games_changes")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "save_games" },
          (payload) => _handleUpsert(payload.new as SaveGame),
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "save_games" },
          (payload) => _handleDelete((payload.old as { id: string }).id),
        )
        .subscribe();
    }
  });

  async function create(input: { name: string; color: SaveGameColor }) {
    const optimistic: SaveGame = {
      id: crypto.randomUUID(),
      name: input.name,
      color: input.color,
      owner_id: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saves.value.unshift(optimistic);
    error.value = null;

    const { data, error: insertError } = await client
      .from("save_games")
      .insert({ name: input.name, color: input.color })
      .select()
      .single();

    if (insertError) {
      _handleDelete(optimistic.id);
      error.value = insertError.message;
      return;
    }

    const index = saves.value.findIndex((s) => s.id === optimistic.id);
    if (index >= 0) saves.value[index] = data as SaveGame;
  }

  async function rename(id: string, name: string) {
    const original = saves.value.find((s) => s.id === id);
    if (!original) return;

    _handleUpsert({ ...original, name });
    error.value = null;

    const { error: updateError } = await client.from("save_games").update({ name }).eq("id", id);

    if (updateError) {
      _handleUpsert(original);
      error.value = updateError.message;
    }
  }

  async function remove(id: string) {
    const original = saves.value.find((s) => s.id === id);
    if (!original) return;

    _handleDelete(id);
    error.value = null;

    const { error: deleteError } = await client.from("save_games").delete().eq("id", id);

    if (deleteError) {
      saves.value = [original, ...saves.value].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      error.value = deleteError.message;
    }
  }

  async function refetch() {
    fetched = false;
    await _fetch();
  }

  return { saves, loading, error, create, rename, remove, refetch };
}
