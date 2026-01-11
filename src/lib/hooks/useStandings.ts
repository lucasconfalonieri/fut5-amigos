"use client";

import { useEffect, useState } from "react";
import { fetchSeasonTable, TableRow } from "@/lib/seasonTable";

export function useStandings(seasonId: string) {
    const [rows, setRows] = useState<TableRow[]>([]);
    const [loadingTable, setLoadingTable] = useState(true);
    const [errorTable, setErrorTable] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoadingTable(true);
                setErrorTable(null);
                const data = await fetchSeasonTable(seasonId);
                if (!alive) return;
                setRows(data);
            } catch (e: any) {
                if (!alive) return;
                setErrorTable(e?.message ?? "Error cargando tabla");
            } finally {
                if (!alive) return;
                setLoadingTable(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [seasonId]);

    return { rows, loadingTable, errorTable };
}
