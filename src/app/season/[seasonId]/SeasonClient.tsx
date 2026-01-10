"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSeasonTable, TableRow } from "@/lib/seasonTable";
import { listPlayers, PlayerDoc } from "@/lib/players";
import { listMatches, MatchDoc } from "@/lib/matchesRead";

type Tab = "table" | "matches" | "h2h";

function formatDayKey(d: Date) {
    // YYYY-MM-DD en local
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatDayTitle(d: Date) {
    // algo lindo pero simple
    return d.toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(d: Date) {
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function resultLabel(goalDiff: number) {
    if (goalDiff > 0) return { label: `Gana A por ${goalDiff}`, tone: "winA" as const };
    if (goalDiff < 0) return { label: `Gana B por ${Math.abs(goalDiff)}`, tone: "winB" as const };
    return { label: "Empate", tone: "draw" as const };
}

export default function SeasonClient({ seasonId }: { seasonId: string }) {
    const [tab, setTab] = useState<Tab>("table");

    // tabla
    const [rows, setRows] = useState<TableRow[]>([]);
    const [loadingTable, setLoadingTable] = useState(true);
    const [errorTable, setErrorTable] = useState<string | null>(null);

    // players map (para mostrar nombres en partidos)
    const [players, setPlayers] = useState<PlayerDoc[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(true);
    const [errorPlayers, setErrorPlayers] = useState<string | null>(null);

    // matches
    const [matches, setMatches] = useState<MatchDoc[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [errorMatches, setErrorMatches] = useState<string | null>(null);

    // filtros Partidos
    const [filterPlayerId, setFilterPlayerId] = useState<string>("");
    const [filterResult, setFilterResult] = useState<"" | "A" | "D" | "B">("");

    // cargar tabla
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

    // cargar players (una vez)
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
        for (const p of players) {
            m.set(p.id, p.nickname?.trim() || p.name);
        }
        return m;
    }, [players]);

    // cargar matches solo cuando entrás al tab
    useEffect(() => {
        if (tab !== "matches") return;

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
    }, [tab, seasonId]);

    // Tabla render
    const tableContent = useMemo(() => {
        if (loadingTable) return <p className="text-white/60">Cargando tabla…</p>;
        if (errorTable) return <p className="text-red-200">{errorTable}</p>;
        if (!rows.length) return <p className="text-white/60">No hay datos todavía.</p>;

        return (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="min-w-[720px] w-full text-sm">
                    <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/60">
                        <tr>
                            {["#", "Jugador", "PTS", "PJ", "PG", "PE", "PP", "Racha", "Últ.5"].map((h) => (
                                <th key={h} className="px-3 py-3">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-white/90">
                        {rows.map((r, idx) => (
                            <tr key={r.playerId} className="border-b border-white/5 hover:bg-white/5 transition">
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
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }, [rows, loadingTable, errorTable]);

    // Filtrar matches
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

    // agrupar por día
    const matchesByDay = useMemo(() => {
        const map = new Map<string, MatchDoc[]>();
        for (const m of filteredMatches) {
            const key = formatDayKey(m.date);
            const list = map.get(key) ?? [];
            list.push(m);
            map.set(key, list);
        }
        // ya vienen desc, pero aseguramos
        for (const [k, list] of map.entries()) {
            list.sort((a, b) => b.date.getTime() - a.date.getTime());
            map.set(k, list);
        }
        return map;
    }, [filteredMatches]);

    const sortedDayKeys = useMemo(() => {
        return Array.from(matchesByDay.keys()).sort((a, b) => (a < b ? 1 : -1));
    }, [matchesByDay]);

    const matchesContent = useMemo(() => {
        if (loadingMatches) return <p className="text-white/60">Cargando partidos…</p>;
        if (errorMatches) return <p className="text-red-200">{errorMatches}</p>;
        if (!matches.length) return <p className="text-white/60">Todavía no hay partidos cargados.</p>;

        return (
            <div className="space-y-4">
                {/* filtros */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Filtrar por jugador</label>
                            <select
                                value={filterPlayerId}
                                onChange={(e) => setFilterPlayerId(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-white/20"
                                disabled={loadingPlayers || !!errorPlayers}
                            >
                                <option value="">Todos</option>
                                {players
                                    .slice()
                                    .sort((a, b) => (a.nickname?.trim() || a.name).localeCompare(b.nickname?.trim() || b.name, "es"))
                                    .map((p) => (
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
                                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-white/20"
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
                                className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
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
                                <h3 className="mb-3 text-sm font-semibold text-white/80 capitalize">
                                    {formatDayTitle(dayDate)}
                                </h3>

                                <div className="space-y-3">
                                    {list.map((m) => {
                                        const res = resultLabel(m.goalDiff);

                                        const badge =
                                            res.tone === "draw"
                                                ? "bg-white/10 text-white/80"
                                                : res.tone === "winA"
                                                    ? "bg-emerald-500/10 text-emerald-200"
                                                    : "bg-sky-500/10 text-sky-200";

                                        return (
                                            <div
                                                key={m.id}
                                                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-white/50">{formatTime(m.date)}</span>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge}`}>
                                                            {res.label}
                                                        </span>
                                                    </div>

                                                    <div className="text-xs text-white/50">
                                                        Partido ID: <span className="text-white/70">{m.id.slice(0, 6)}…</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                                    <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-3">
                                                        <div className="mb-2 text-xs font-semibold text-white/70">Equipo A</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {m.teamA.map((pid) => (
                                                                <span
                                                                    key={pid}
                                                                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
                                                                >
                                                                    {playerNameById.get(pid) ?? pid}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-3">
                                                        <div className="mb-2 text-xs font-semibold text-white/70">Equipo B</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {m.teamB.map((pid) => (
                                                                <span
                                                                    key={pid}
                                                                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
                                                                >
                                                                    {playerNameById.get(pid) ?? pid}
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
    }, [
        loadingMatches,
        errorMatches,
        matches.length,
        filteredMatches.length,
        matchesByDay,
        sortedDayKeys,
        players,
        loadingPlayers,
        errorPlayers,
        filterPlayerId,
        filterResult,
        playerNameById,
    ]);

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-4xl px-4 py-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Tabla de posiciones</h1>
                    <p className="text-sm text-white/60">Temporada: {seasonId}</p>
                </header>

                {/* Tabs */}
                <div className="mt-6 flex gap-2">
                    <button
                        onClick={() => setTab("table")}
                        className={[
                            "rounded-full px-4 py-2 text-sm font-medium",
                            tab === "table" ? "bg-white/10" : "bg-white/5 text-white/60 hover:bg-white/10",
                        ].join(" ")}
                    >
                        Tabla
                    </button>

                    <button
                        onClick={() => setTab("matches")}
                        className={[
                            "rounded-full px-4 py-2 text-sm font-medium",
                            tab === "matches" ? "bg-white/10" : "bg-white/5 text-white/60 hover:bg-white/10",
                        ].join(" ")}
                    >
                        Partidos
                    </button>

                    <button
                        onClick={() => setTab("h2h")}
                        className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/40"
                        title="Lo hacemos después"
                        disabled
                    >
                        Head-to-head
                    </button>
                </div>

                <section className="mt-6">
                    {tab === "table" ? tableContent : tab === "matches" ? matchesContent : null}
                </section>

                <footer className="mt-6 text-xs text-white/40">
                    Puntos: Victoria 2 · Empate 1 · Derrota 0
                </footer>
            </div>
        </main>
    );
}
