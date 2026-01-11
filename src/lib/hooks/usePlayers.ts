"use client";

import { useEffect, useMemo, useState } from "react";
import { listPlayers, PlayerDoc } from "@/lib/players";

export function usePlayers(seasonId: string) {
    const [players, setPlayers] = useState<PlayerDoc[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(true);
    const [errorPlayers, setErrorPlayers] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoadingPlayers(true);
                setErrorPlayers(null);
                const data = await listPlayers(seasonId);
                if (!alive) return;
                setPlayers(data);
            } catch (e: any) {
                if (!alive) return;
                setErrorPlayers(e?.message ?? "Error cargando jugadores");
            } finally {
                if (!alive) return;
                setLoadingPlayers(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [seasonId]);

    const playerNameById = useMemo(() => {
        const m = new Map<string, string>();
        for (const p of players) m.set(p.id, p.nickname?.trim() || p.name);
        return m;
    }, [players]);

    return { players, playerNameById, loadingPlayers, errorPlayers };
}
