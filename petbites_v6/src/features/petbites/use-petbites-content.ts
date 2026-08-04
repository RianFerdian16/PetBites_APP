import { useCallback, useEffect, useState } from "react";

import { clearPetBitesCache, fetchPetBitesContent } from "@/lib/bird-service";
import type { PetBitesContent } from "@/lib/birds-data";

type ContentState =
  | { status: "loading"; content: null; error: null }
  | { status: "ready"; content: PetBitesContent; error: null }
  | { status: "error"; content: null; error: string };

export function usePetBitesContent() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<ContentState>({
    status: "loading",
    content: null,
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function load() {
      setState({ status: "loading", content: null, error: null });

      try {
        const content = await fetchPetBitesContent({ force: requestVersion > 0 });
        if (!active) return;
        setState({ status: "ready", content, error: null });
      } catch (error) {
        if (!active) return;
        setState({
          status: "error",
          content: null,
          error:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengambil data dari Supabase.",
        });
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [requestVersion]);

  const retry = useCallback(() => {
    clearPetBitesCache();
    setRequestVersion((version) => version + 1);
  }, []);

  return { ...state, retry };
}
