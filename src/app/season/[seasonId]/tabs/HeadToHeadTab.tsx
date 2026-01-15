"use client";

import { useMemo, useState } from "react";
import { MatchDoc } from "@/lib/matchesRead";
import { PlayerDoc } from "@/lib/players";
import { computeHeadToHead } from "@/lib/utils/h2h";
import { formatDayTitle, formatTime } from "@/lib/utils/date";

type Result = "W" | "D" | "L";

function invert(r: Result): Result {
    if (r === "W") return "L";
    if (r === "L") return "W";
    return "D";
}

function pts(r: Result) {
    if (r === "W") return 2;
    if (r === "D") return 1;
    return 0;
}

function toESP(r: Result) {
    if (r === "W") return "G";
    if (r === "D") return "E";
    return "P";
}

function venueLabel(m: MatchDoc) {
    const v = (m as any).venue;
    if (!v || typeof v !== "string" || !v.trim()) return null;
    return v.trim();
}

export default function HeadToHeadTab({
    matches,
    loading,
    error,
    players,
    playerNameById,
}: {
    matches: MatchDoc[];
    loading: boolean;
    error: string | null;
    players: PlayerDoc[];
    playerNameById: Map<string, string>;
}) {
    const sortedPlayers = useMemo(() => {
        return players
            .slice()
            .filter((p) => p.isActive)
            .sort((a, b) =>
                (a.nickname?.trim() || a.name).localeCompare(b.nickname?.trim() || b.name, "es")
            );
    }, [players]);

    const [aId, setAId] = useState<string>("");
    const [bId, setBId] = useState<string>("");

    const nameA = aId ? playerNameById.get(aId) ?? aId : "";
    const nameB = bId ? playerNameById.get(bId) ?? bId : "";

    const computed = useMemo(() => {
        if (!aId || !bId || aId === bId) return null;
        return computeHeadToHead(matches, aId, bId);
    }, [matches, aId, bId]);

    const versusStats = useMemo(() => {
        if (!computed) return null;

        const list = computed.versus.list;
        let wA = 0,
            d = 0,
            lA = 0,
            ptsA = 0;

        for (const x of list) {
            const r = x.resultA;
            if (r === "W") wA++;
            else if (r === "D") d++;
            else lA++;
            ptsA += pts(r);
        }

        const wB = lA;
        const lB = wA;
        const ptsB = list.reduce((acc, x) => acc + pts(invert(x.resultA)), 0);

        const last10A = list.slice(0, 10).map((x) => toESP(x.resultA)).join(" ");
        const last10B = list.slice(0, 10).map((x) => toESP(invert(x.resultA))).join(" ");

        return {
            played: list.length,
            A: { W: wA, D: d, L: lA, points: ptsA, last10: last10A || "-" },
            B: { W: wB, D: d, L: lB, points: ptsB, last10: last10B || "-" },
            list,
        };
    }, [computed]);

    if (loading) return <p className="text-white/60">Cargando datos…</p>;
    if (error) return <p className="text-red-200">{error}</p>;

    return (
        <div className="space-y-4">
            {/* Selectores */}
            <div className="card-solid rounded-2xl p-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Jugador 1</label>
                        <select
                            value={aId}
                            onChange={(e) => setAId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                        >
                            <option value="">Elegir jugador</option>
                            {sortedPlayers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nickname?.trim() || p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-white/60">Jugador 2</label>
                        <select
                            value={bId}
                            onChange={(e) => setBId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                        >
                            <option value="">Elegir jugador</option>
                            {sortedPlayers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nickname?.trim() || p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {aId && bId && aId === bId && (
                    <p className="mt-3 text-sm text-red-200">Elegí dos jugadores distintos.</p>
                )}
            </div>

            {!computed || !versusStats ? (
                <p className="text-white/60">Elegí dos jugadores para ver el head-to-head.</p>
            ) : (
                <>
                    {/* EN CONTRA */}
                    <div className="card-solid rounded-2xl p-4">
                        <h3 className="text-lg font-semibold">
                            En contra: <span className="text-white/85">{nameA}</span> vs{" "}
                            <span className="text-white/85">{nameB}</span>
                        </h3>

                        <p className="mt-1 text-xs text-white/50">
                            Partidos entre ellos:{" "}
                            <span className="font-semibold text-white/80">{versusStats.played}</span>
                        </p>

                        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/60">
                                    <tr>
                                        <th className="px-4 py-3">Jugador</th>
                                        <th className="px-4 py-3 text-center">PTS</th>
                                        <th className="px-4 py-3 text-center">G</th>
                                        <th className="px-4 py-3 text-center">E</th>
                                        <th className="px-4 py-3 text-center">P</th>
                                        <th className="px-4 py-3">Últ.10</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-white/5 hover:bg-white/5">
                                        <td className="px-4 py-3 font-medium">{nameA}</td>
                                        <td className="px-4 py-3 text-center font-extrabold text-emerald-200 tabular-nums">
                                            {versusStats.A.points}
                                        </td>
                                        <td className="px-4 py-3 text-center tabular-nums">{versusStats.A.W}</td>
                                        <td className="px-4 py-3 text-center tabular-nums">{versusStats.A.D}</td>
                                        <td className="px-4 py-3 text-center tabular-nums">{versusStats.A.L}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-white/70">{versusStats.A.last10}</td>
                                    </tr>

                                    <tr className="border-t border-white/5 hover:bg-white/5">
                                        <td className="px-4 py-3 font-medium">{nameB}</td>
                                        <td className="px-4 py-3 text-center font-extrabold text-emerald-200 tabular-nums">
                                            {versusStats.B.points}
                                        </td>
                                        <td className="px-4 py-3 text-center tabular-nums">{versusStats.B.W}</td>
                                        <td className="px-4 py-3 text-center tabular-nums">{versusStats.B.D}</td>
                                        <td className="px-4 py-3 text-center tabular-nums">{versusStats.B.L}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-white/70">{versusStats.B.last10}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Historial (últimos 10) */}
                        <div className="mt-4 space-y-2">
                            {versusStats.list.slice(0, 10).map((x) => {
                                const d = x.match.date;
                                const diff = Math.abs(x.match.goalDiff);

                                const outcomeA =
                                    x.resultA === "D"
                                        ? "Empate"
                                        : `${x.resultA === "W" ? nameA : nameB} ganó por ${diff}`;

                                const v = venueLabel(x.match);

                                return (
                                    <MiniMatch
                                        key={x.match.id}
                                        date={d}
                                        title={`${formatTime(d)} · ${outcomeA}`}
                                        subtitle={`Diferencia de goles en el partido: ${diff}`}
                                        venue={v ?? undefined}
                                    />
                                );
                            })}

                            {versusStats.list.length === 0 && (
                                <p className="text-sm text-white/60">Todavía no jugaron en contra.</p>
                            )}
                        </div>
                    </div>

                    {/* JUGANDO JUNTOS */}
                    <div className="card-solid rounded-2xl p-4">
                        <h3 className="text-lg font-semibold">
                            Jugando juntos: <span className="text-white/85">{nameA}</span> +{" "}
                            <span className="text-white/85">{nameB}</span>
                        </h3>

                        <div className="mt-3 grid gap-3 sm:grid-cols-5">
                            <Stat label="PJ" value={computed.together.stats.played} />
                            <Stat label="G" value={computed.together.stats.W} />
                            <Stat label="E" value={computed.together.stats.D} />
                            <Stat label="P" value={computed.together.stats.L} />
                            <Stat label="PTS" value={computed.together.stats.points} highlight />
                        </div>

                        <p className="mt-3 text-xs text-white/50">
                            Últimos 10 (equipo):{" "}
                            <span className="font-mono text-white/70">
                                {(computed.together.stats.last10 || "-")
                                    .split(" ")
                                    .map((x) => (x === "W" ? "G" : x === "D" ? "E" : x === "L" ? "P" : x))
                                    .join(" ")}
                            </span>
                        </p>

                        <div className="mt-4 space-y-2">
                            {computed.together.list.slice(0, 10).map((x) => {
                                const d = x.match.date;
                                const diff = Math.abs(x.match.goalDiff);
                                const v = venueLabel(x.match);

                                return (
                                    <MiniMatch
                                        key={x.match.id}
                                        date={d}
                                        title={`${formatTime(d)} · Equipo ${x.resultTeam === "W" ? "ganó" : x.resultTeam === "D" ? "empató" : "perdió"
                                            }`}
                                        subtitle={`Diferencia de goles en el partido: ${diff}`}
                                        venue={v ?? undefined}
                                    />
                                );
                            })}

                            {computed.together.list.length === 0 && (
                                <p className="text-sm text-white/60">Todavía no jugaron juntos.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-3">
            <div className="text-xs text-white/50">{label}</div>
            <div
                className={[
                    "mt-1 text-lg font-semibold tabular-nums",
                    highlight ? "text-emerald-200 font-extrabold" : "",
                ].join(" ")}
            >
                {value}
            </div>
        </div>
    );
}

function MiniMatch({
    date,
    title,
    subtitle,
    venue,
}: {
    date: Date;
    title: string;
    subtitle: string;
    venue?: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-white/50">{formatDayTitle(date)}</div>
            </div>

            <div className="mt-1 text-xs text-white/50">{subtitle}</div>

            {venue && (
                <div className="mt-2 text-xs text-white/60">
                    <span className="mr-1">📍</span>
                    <span className="font-medium text-white/75">{venue}</span>
                </div>
            )}
        </div>
    );
}
