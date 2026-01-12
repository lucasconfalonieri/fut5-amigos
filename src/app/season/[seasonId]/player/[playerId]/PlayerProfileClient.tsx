"use client";

import Link from "next/link";
import { useMemo } from "react";
import Avatar2D from "@/components/Avatar2D";
import { usePlayers } from "@/lib/hooks/usePlayers";
import { useMatches } from "@/lib/hooks/useMatches";
import { formatDayTitle, formatTime } from "@/lib/utils/date";
import {
    computePlayerProfileStats,
    outcomeLabelES,
    streakLabelES,
} from "@/lib/utils/playerProfile";

function pct(x: number) {
    return `${Math.round(x * 100)}%`;
}

export default function PlayerProfileClient({
    seasonId,
    playerId,
}: {
    seasonId: string;
    playerId: string;
}) {
    const { players, playerNameById, loadingPlayers, errorPlayers } = usePlayers(seasonId);
    const { matches, loadingMatches, errorMatches } = useMatches(seasonId, true);

    const player = useMemo(() => players.find((p) => p.id === playerId) ?? null, [players, playerId]);

    const computed = useMemo(() => {
        return computePlayerProfileStats(matches, playerId);
    }, [matches, playerId]);

    const displayName = player?.nickname?.trim() || player?.name || playerNameById.get(playerId) || playerId;

    if (loadingPlayers || loadingMatches) return <p className="px-4 py-10 text-white/60">Cargando…</p>;
    if (errorPlayers) return <p className="px-4 py-10 text-red-200">{errorPlayers}</p>;
    if (errorMatches) return <p className="px-4 py-10 text-red-200">{errorMatches}</p>;

    return (
        <main className="min-h-screen bg-transparent text-white">
            <div className="mx-auto max-w-4xl px-4 py-10">
                {/* Header */}
                <header className="card-solid rounded-3xl p-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <Avatar2D seed={playerId} size={70} className="rounded-3xl" />

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate text-3xl font-black tracking-tight">{displayName}</h1>
                                {player && !player.isActive && (
                                    <span className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-semibold text-white/70">
                                        Inactivo
                                    </span>
                                )}
                                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                    🚬 {pct(computed.smokedRate)} de partidos
                                </span>
                            </div>

                            {player?.nickname?.trim() && (
                                <p className="mt-1 text-sm text-white/55">{player.name}</p>
                            )}

                            <p className="mt-2 text-xs text-white/45">
                                Temporada: 2026 · Perfil del jugador
                            </p>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <Link
                                href={`/season/${seasonId}/players`}
                                className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm hover:border-emerald-500/25 hover:bg-zinc-900"
                            >
                                Ver jugadores
                            </Link>
                            <Link
                                href={`/season/${seasonId}`}
                                className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm hover:border-emerald-500/25 hover:bg-zinc-900"
                            >
                                Volver
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Stats cards */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="PJ" value={computed.all.played} />
                    <StatCard label="PTS" value={computed.all.points} accent />
                    <StatCard label="Winrate" value={pct(computed.all.winrate)} />
                    <StatCard label="Racha" value={streakLabelES(computed.streak.outcome, computed.streak.count)} />
                </div>

                {/* Split smoke vs sober */}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <SplitCard
                        title="Fumando 🚬"
                        s={computed.smoked}
                        accent="emerald"
                    />
                    <SplitCard
                        title="Sobrio 🧊"
                        s={computed.sober}
                        accent="zinc"
                    />
                </div>

                {/* Últimos partidos */}
                <div className="mt-6 card-solid rounded-3xl p-5">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-extrabold tracking-tight">Últimos partidos</h2>
                            <p className="mt-1 text-xs text-white/45">
                                Últimos {computed.recentMatches.length} donde participó.
                            </p>
                        </div>

                        <div className="text-xs text-white/60 font-mono">
                            Últ.10:{" "}
                            {computed.last10.length
                                ? computed.last10.map((r, i) => (
                                    <span
                                        key={i}
                                        className={[
                                            "ml-1 rounded px-1.5 py-0.5",
                                            r === "W"
                                                ? "bg-emerald-500/15 text-emerald-200"
                                                : r === "D"
                                                    ? "bg-amber-500/15 text-amber-200"
                                                    : "bg-red-500/15 text-red-200",
                                        ].join(" ")}
                                    >
                                        {outcomeLabelES(r)}
                                    </span>
                                ))
                                : "—"}
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        {computed.recentMatches.length === 0 ? (
                            <p className="text-sm text-white/60">Todavía no jugó partidos.</p>
                        ) : (
                            computed.recentMatches.map((m) => {
                                const smoked = new Set(m.smokedPlayerIds ?? []).has(playerId);
                                const r = m.goalDiff === 0 ? "D" : m.teamA.includes(playerId) ? (m.goalDiff > 0 ? "W" : "L") : (m.goalDiff > 0 ? "L" : "W");
                                const badge =
                                    r === "W"
                                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                                        : r === "D"
                                            ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
                                            : "border-red-500/25 bg-red-500/10 text-red-200";

                                return (
                                    <div key={m.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-white/50">{formatTime(m.date)}</span>
                                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}>
                                                    {r === "W" ? "Ganó" : r === "D" ? "Empató" : "Perdió"}
                                                </span>
                                                {smoked && (
                                                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                                        🚬 fumó
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-xs text-white/50">{formatDayTitle(m.date)}</div>
                                        </div>

                                        <div className="mt-2 text-xs text-white/55">
                                            Diferencia de goles en el partido: <span className="text-white/80 font-semibold">{Math.abs(m.goalDiff)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
    return (
        <div className="card-solid rounded-3xl p-4">
            <div className="text-xs text-white/55">{label}</div>
            <div className={["mt-1 text-2xl font-extrabold tracking-tight", accent ? "text-emerald-200" : ""].join(" ")}>
                {value}
            </div>
        </div>
    );
}

function SplitCard({
    title,
    s,
    accent,
}: {
    title: string;
    s: { played: number; W: number; D: number; L: number; points: number; winrate: number };
    accent: "emerald" | "zinc";
}) {
    const pill =
        accent === "emerald"
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
            : "border-white/10 bg-zinc-900 text-white/70";

    return (
        <div className="card-solid rounded-3xl p-5">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold">{title}</h3>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${pill}`}>
                    Winrate {pct(s.winrate)}
                </span>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                <Mini label="PJ" value={s.played} />
                <Mini label="G" value={s.W} />
                <Mini label="E" value={s.D} />
                <Mini label="P" value={s.L} />
                <Mini label="PTS" value={s.points} strong />
            </div>
        </div>
    );
}

function Mini({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 px-2 py-2">
            <div className="text-[10px] text-white/50">{label}</div>
            <div className={["mt-0.5 text-sm font-semibold", strong ? "text-emerald-200" : "text-white/85"].join(" ")}>
                {value}
            </div>
        </div>
    );
}
