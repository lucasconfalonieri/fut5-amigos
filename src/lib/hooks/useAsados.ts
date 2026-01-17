"use client";

import { useEffect, useState } from "react";
import { AsadoDoc, listAsados } from "@/lib/asadosRead";

export function useAsados(seasonId: string, enabled: boolean) {
    const [asados, setAsados] = useState<AsadoDoc[]>([]);
    const [loadingAsados, setLoading] = useState(false);
    const [errorAsados, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let alive = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await listAsados(seasonId);
                if (alive) setAsados(data);
            } catch (e: any) {
                if (alive) setError(e?.message ?? "Error cargando juntadas");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [seasonId, enabled]);

    return { asados, loadingAsados, errorAsados };
}
