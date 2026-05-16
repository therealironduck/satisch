import type { SaveGameCollaborator } from "~/types/saveGame";

const ERROR_MAP: Record<string, string> = {
  Unauthorized: "You do not have permission to share this save.",
  "Cannot invite yourself": "You cannot invite yourself.",
  "No account found with that email": "No account found with that email address.",
  "User already has access": "This user already has access.",
};

export function useSaveGameCollaborators(saveGameId: Ref<string>) {
  const client = useSupabaseClient();

  const collaborators = ref<SaveGameCollaborator[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await client
      .from("save_game_collaborators")
      .select("id, user_id, email, added_at")
      .eq("save_game_id", saveGameId.value)
      .order("added_at", { ascending: true });

    loading.value = false;

    if (fetchError) {
      error.value = fetchError.message;
      return;
    }

    collaborators.value = (data as SaveGameCollaborator[]).map((row) => ({
      ...row,
      save_game_id: saveGameId.value,
    }));
  }

  async function invite(email: string): Promise<string | null> {
    loading.value = true;
    error.value = null;

    const { data, error: rpcError } = await client.rpc("invite_save_game_collaborator", {
      p_save_game_id: saveGameId.value,
      p_email: email,
    });

    loading.value = false;

    if (rpcError) {
      const msg = rpcError.message;
      error.value = msg;
      return msg;
    }

    const result = data as { success: boolean; error?: string };
    if (!result.success) {
      const msg = ERROR_MAP[result.error ?? ""] ?? result.error ?? "Invite failed.";
      error.value = msg;
      return msg;
    }

    await fetch();
    return null;
  }

  async function remove(collaboratorId: string) {
    const original = [...collaborators.value];
    collaborators.value = collaborators.value.filter((c) => c.id !== collaboratorId);
    error.value = null;

    const { error: deleteError } = await client
      .from("save_game_collaborators")
      .delete()
      .eq("id", collaboratorId);

    if (deleteError) {
      collaborators.value = original;
      error.value = deleteError.message;
      return;
    }

    await fetch();
  }

  async function leave(collaboratorId: string) {
    return remove(collaboratorId);
  }

  let channel: ReturnType<typeof client.channel> | null = null;

  function setupChannel() {
    channel = client
      .channel(`save_game_collaborators_${saveGameId.value}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "save_game_collaborators",
          filter: `save_game_id=eq.${saveGameId.value}`,
        },
        () => void fetch(),
      )
      .subscribe();
  }

  onMounted(async () => {
    await fetch();
    setupChannel();
  });

  watch(saveGameId, async () => {
    if (channel) {
      void client.removeChannel(channel);
      channel = null;
    }
    await fetch();
    setupChannel();
  });

  onUnmounted(() => {
    if (channel) {
      void client.removeChannel(channel);
      channel = null;
    }
  });

  return { collaborators, loading, error, fetch, invite, remove, leave };
}
