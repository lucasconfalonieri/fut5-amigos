"use client";

import { useMemo, useState } from "react";
import { MatchDoc } from "@/lib/matchesRead";
import { PlayerDoc } from "@/lib/players";
import { formatDayKey, formatDayTitle, formatTime } from "@/lib/utils/date";
import { resultLabel } from "@/lib/utils/match";

export default function MatchesTab({
    matches,
    loading,
    error,
    players,
    playerNameById,
    loadingPlayers,
    errorPlayers,
}: {
    matches: MatchDoc[];
    loading: boolean;
    error: string | null;
    players: PlayerDoc[];
    playerNameById: Map<string, string>;
    loadingPlayers: boolean;
    errorPlayers: string | null;
}) {
    const [filterPlayerId, setFilterPlayerId] = useState<string>("");
    const [filterResult, setFilterResult] = useState<"" | "A" | "D" | "B">("");

    const filteredMatches = useMemo(() => {
        let arr = [...matches];

        if (filterPlayerId) {
            arr = arr.filter((m) => m.teamA.includes(filterPlayerId) || m.teamB.includes(filterPlayerId));
        }

        if (filterResult) {
            arr = arr.filter((m) => {
                if (filterResult === "D") return m.goalDiff === 0;
                if (filterResult === "A") return m.goalDiff > 0;
                if (filterResult === "B") return m.goalDiff < 0;
                return true;
            });
        }

        return arr;
    }, [matches, filterPlayerId, filterResult]);

    const matchesByDay = useMemo(() => {
        const map = new Map<string, MatchDoc[]>();
        for (const m of filteredMatches) {
            const key = formatDayKey(m.date);
            const list = map.get(key) ?? [];
            list.push(m);
            map.set(key, list);
        }
        for (const [k, list] of map.entries()) {
            list.sort((a, b) => b.date.getTime() - a.date.getTime());
            map.set(k, list);
        }
        return map;
    }, [filteredMatches]);

    const sortedDayKeys = useMemo(() => {
        return Array.from(matchesByDay.keys()).sort((a, b) => (a < b ? 1 : -1));
    }, [matchesByDay]);

    const sortedPlayers = useMemo(() => {
        return players
            .slice()
            .sort((a, b) => (a.nickname?.trim() || a.name).localeCompare(b.nickname?.trim() || b.name, "es"));
    }, [players]);

    if (loading) return <p className="text-white/60">Cargando partidos…</p>;
    if (error) return <p className="text-red-200">{error}</p>;
    if (!matches.length) return <p className="text-white/60">Todavía no hay partidos cargados.</p>;

    return (
        <div className="space-y-4">
            {/* filtros */}
            <div className="card-solid rounded-2xl p-4">
                <div className="grid gap-3 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Filtrar por jugador</label>
                        <select
                            value={filterPlayerId}
                            onChange={(e) => setFilterPlayerId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                            disabled={loadingPlayers || !!errorPlayers}
                        >
                            <option value="">Todos</option>
                            {sortedPlayers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nickname?.trim() || p.name}
                                </option>
                            ))}
                        </select>
                        {errorPlayers && <p className="mt-1 text-xs text-red-200">{errorPlayers}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-white/60">Resultado</label>
                        <select
                            value={filterResult}
                            onChange={(e) => setFilterResult(e.target.value as any)}
                            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                        >
                            <option value="">Todos</option>
                            <option value="A">Gana A</option>
                            <option value="D">Empate</option>
                            <option value="B">Gana B</option>
                        </select>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                        <div className="text-xs text-white/50">
                            Mostrando: <span className="font-semibold text-white/80">{filteredMatches.length}</span>
                            {" / "}
                            <span className="font-semibold text-white/80">{matches.length}</span>
                        </div>

                        <button
                            onClick={() => {
                                setFilterPlayerId("");
                                setFilterResult("");
                            }}
                            className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm hover:border-emerald-500/30 hover:bg-zinc-900"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* listado por día */}
            <div className="space-y-6">
                {sortedDayKeys.map((dayKey) => {
                    const list = matchesByDay.get(dayKey)!;
                    const dayDate = list[0]?.date ?? new Date(dayKey);

                    return (
                        <section key={dayKey}>
                            <h3 className="mb-3 text-base font-semibold text-white capitalize">{formatDayTitle(dayDate)}</h3>

                            <div className="space-y-3">
                                {list.map((m) => {
                                    const res = resultLabel(m.goalDiff);

                                    const badge =
                                        res.tone === "draw"
                                            ? "border-white/10 bg-zinc-950 text-white/80"
                                            : res.tone === "winA"
                                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                                                : "border-sky-500/25 bg-sky-500/10 text-sky-200";

                                    const smokedSet = new Set(m.smokedPlayerIds ?? []);

                                    return (
                                        <div key={m.id} className="card-solid rounded-2xl p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-white/50">{formatTime(m.date)}</span>
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${badge}`}>
                                                        {res.label}
                                                    </span>
                                                    {smokedSet.size > 0 && (
                                                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                                            🚬 {smokedSet.size}
                                                        </span>
                                                    )}
                                                </div>
                                                {m.venue ? (
                                                    <span className="ml-1 rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs text-white/70">
                                                        📍 {m.venue}
                                                    </span>
                                                ) : null}
                                                <div className="text-xs text-white/50">
                                                    Partido ID: <span className="text-white/70">{m.id.slice(0, 6)}…</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                                <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
                                                    <div className="mb-2 text-xs font-semibold text-white/70">Equipo A</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {m.teamA.map((pid) => (
                                                            <span
                                                                key={pid}
                                                                className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-white/85"
                                                            >
                                                                {playerNameById.get(pid) ?? pid}
                                                                {smokedSet.has(pid) && (
                                                                    <span className="ml-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                                                                        🚬
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
                                                    <div className="mb-2 text-xs font-semibold text-white/70">Equipo B</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {m.teamB.map((pid) => (
                                                            <span
                                                                key={pid}
                                                                className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-white/85"
                                                            >
                                                                {playerNameById.get(pid) ?? pid}
                                                                {smokedSet.has(pid) && (
                                                                    <span className="ml-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                                                                        🚬
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
