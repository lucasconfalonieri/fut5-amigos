"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSeasonTable, TableRow } from "@/lib/seasonTable";

function SkeletonRow({ i }: { i: number }) {
    return (
        <tr className="border-b border-white/5" key={i}>
            {Array.from({ length: 9 }).map((_, j) => (
                <td key={j} className="px-3 py-3">
                    <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-white/10" />
                </td>
            ))}
        </tr>
    );
}

export default function SeasonClient({ seasonId }: { seasonId: string }) {
    const [rows, setRows] = useState<TableRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchSeasonTable(seasonId);
                if (!alive) return;
                setRows(data);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "Error cargando la tabla");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [seasonId]);

    const table = useMemo(() => {
        if (error) {
            return (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                    {error}
                </div>
            );
        }

        return (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="min-w-[720px] w-full text-sm">
                    <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/60">
                        <tr>
                            <th className="px-3 py-3">#</th>
                            <th className="px-3 py-3">Jugador</th>
                            <th className="px-3 py-3">PTS</th>
                            <th className="px-3 py-3">PJ</th>
                            <th className="px-3 py-3">PG</th>
                            <th className="px-3 py-3">PE</th>
                            <th className="px-3 py-3">PP</th>
                            <th className="px-3 py-3">Racha</th>
                            <th className="px-3 py-3">Últ.5</th>
                        </tr>
                    </thead>

                    <tbody className="text-white/90">
                        {loading ? (
                            <>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <SkeletonRow i={i} key={i} />
                                ))}
                            </>
                        ) : rows.length ? (
                            rows.map((r, idx) => (
                                <tr
                                    key={r.playerId}
                                    className="border-b border-white/5 hover:bg-white/5 transition"
                                >
                                    <td className="px-3 py-3 text-white/70">{idx + 1}</td>
                                    <td className="px-3 py-3 font-medium">{r.displayName}</td>
                                    <td className="px-3 py-3 font-semibold">{r.points}</td>
                                    <td className="px-3 py-3">{r.played}</td>
                                    <td className="px-3 py-3">{r.wins}</td>
                                    <td className="px-3 py-3">{r.draws}</td>
                                    <td className="px-3 py-3">{r.losses}</td>
                                    <td className="px-3 py-3">{r.streak}</td>
                                    <td className="px-3 py-3 font-mono text-xs text-white/70">{r.last5}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="px-3 py-6 text-white/70" colSpan={9}>
                                    No hay jugadores activos o todavía no hay datos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }, [rows, loading, error]);

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-4xl px-4 py-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Tabla de posiciones</h1>
                    <p className="text-sm text-white/60">Temporada: {seasonId}</p>
                </header>

                {/* Tabs (por ahora “Tabla” activo, los otros luego) */}
                <div className="mt-6 flex gap-2">
                    <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                        Tabla
                    </button>
                    <button
                        disabled
                        className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/40"
                        title="Lo agregamos después"
                    >
                        Partidos
                    </button>
                    <button
                        disabled
                        className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/40"
                        title="Lo agregamos después"
                    >
                        Head-to-head
                    </button>
                </div>

                <section className="mt-6">{table}</section>

                <footer className="mt-6 text-xs text-white/40">
                    Puntos: Victoria 2 · Empate 1 · Derrota 0
                </footer>
            </div>
        </main>
    );
}
