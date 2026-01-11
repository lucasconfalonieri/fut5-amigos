"use client";

import { useEffect, useState } from "react";
import { listMatches, MatchDoc } from "@/lib/matchesRead";

export function useMatches(seasonId: string, enabled: boolean) {
    const [matches, setMatches] = useState<MatchDoc[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [errorMatches, setErrorMatches] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let alive = true;

        (async () => {
            try {
                setLoadingMatches(true);
                setErrorMatches(null);
                const data = await listMatches(seasonId);
                if (!alive) return;
                setMatches(data);
            } catch (e: any) {
                if (!alive) return;
                setErrorMatches(e?.message ?? "Error cargando partidos");
            } finally {
                if (!alive) return;
                setLoadingMatches(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [seasonId, enabled]);

    return { matches, loadingMatches, errorMatches };
}
