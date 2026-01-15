"use client";

import { useEffect, useMemo, useState } from "react";
import { AsadoStandingRow, listAsadoStandings } from "@/lib/asadoStandingsRead";

export type AsadoTableRow = {
    playerId: string;
    displayName: string;
    points: number;
    attended: number;
    hosted: number;
    asador: number;
    lastSeenAt: Date | null;
};

export function useAsadoStandings(
    seasonId: string,
    enabled: boolean,
    playerNameById: Map<string, string>
) {
    const [rowsRaw, setRowsRaw] = useState<AsadoStandingRow[]>([]);
    const [loadingAsadoTable, setLoading] = useState(false);
    const [errorAsadoTable, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let alive = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await listAsadoStandings(seasonId);
                console.log("ASADO STANDINGS (from listAsadoStandings):", data);
                if (alive) setRowsRaw(data);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "Error cargando tabla de asados");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [seasonId, enabled]);

    const rows = useMemo<AsadoTableRow[]>(() => {
        console.log("ASADO rowsRaw (before map):", rowsRaw);
        const mapped = rowsRaw.map((r) => ({
            playerId: r.playerId,
            displayName: playerNameById.get(r.playerId) ?? r.playerId,
            points: r.points,
            attended: r.attended,
            hosted: (r as any).hosted ?? 0,
            asador: (r as any).asador ?? 0,
            lastSeenAt: r.lastSeenAt,
        }));
        console.log("ASADO rows (after map):", mapped);
        mapped.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.attended !== a.attended) return b.attended - a.attended;
            return a.displayName.localeCompare(b.displayName, "es");
        });

        return mapped;
    }, [rowsRaw, playerNameById]);

    return { rows, loadingAsadoTable, errorAsadoTable };
}
