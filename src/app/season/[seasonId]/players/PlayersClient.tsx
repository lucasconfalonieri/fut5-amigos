"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Avatar2D from "@/components/Avatar2D";
import { usePlayers } from "@/lib/hooks/usePlayers";

export default function PlayersClient({ seasonId }: { seasonId: string }) {
    const { players, loadingPlayers, errorPlayers } = usePlayers(seasonId);
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        const arr = players.slice().sort((a, b) =>
            (a.nickname?.trim() || a.name).localeCompare(b.nickname?.trim() || b.name, "es")
        );
        if (!query) return arr;

        return arr.filter((p) => {
            const a = (p.nickname?.trim() || "").toLowerCase();
            const b = (p.name || "").toLowerCase();
            return a.includes(query) || b.includes(query);
        });
    }, [players, q]);

    return (
        <main className="min-h-screen bg-transparent text-white">
            <div className="mx-auto max-w-4xl px-4 py-10">
                <header className="card-solid rounded-3xl p-6">
                    <h1 className="text-3xl font-black tracking-tight">Jugadores</h1>
                    <p className="mt-1 text-sm text-white/60">Temporada: 2026</p>

                    <div className="mt-4">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por nombre o apodo…"
                            className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-emerald-500/30"
                        />
                    </div>
                </header>

                <div className="mt-6">
                    {loadingPlayers && <p className="text-white/60">Cargando jugadores…</p>}
                    {errorPlayers && <p className="text-red-200">{errorPlayers}</p>}

                    {!loadingPlayers && !errorPlayers && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {filtered.map((p) => {
                                const display = p.nickname?.trim() || p.name;
                                return (
                                    <Link
                                        key={p.id}
                                        href={`/season/${seasonId}/player/${p.id}`}
                                        className="card-solid group rounded-3xl p-4 hover:border-emerald-500/25"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar2D seed={p.id} size={44} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="truncate text-base font-extrabold">{display}</div>
                                                    {!p.isActive && (
                                                        <span className="rounded-full border border-white/10 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white/60">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </div>
                                                {p.nickname?.trim() && (
                                                    <div className="truncate text-xs text-white/55">{p.name}</div>
                                                )}
                                            </div>

                                            <div className="ml-auto rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs text-white/70 group-hover:border-emerald-500/25">
                                                Ver perfil →
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}

                            {filtered.length === 0 && (
                                <div className="card-solid rounded-3xl p-6 text-white/60">
                                    No hay resultados para esa búsqueda.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <Link
                        href={`/season/${seasonId}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm hover:border-emerald-500/25 hover:bg-zinc-900"
                    >
                        ← Volver a temporada
                    </Link>
                </div>
            </div>
        </main>
    );
}
