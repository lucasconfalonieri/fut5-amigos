"use client";

import { useMemo } from "react";
import { MatchDoc } from "@/lib/matchesRead";

function outcomeForPlayer(match: MatchDoc, playerId: string): "W" | "D" | "L" | null {
    const inA = match.teamA.includes(playerId);
    const inB = match.teamB.includes(playerId);
    if (!inA && !inB) return null;

    if (match.goalDiff === 0) return "D";
    const teamAWon = match.goalDiff > 0;
    const playerWon = inA ? teamAWon : !teamAWon;
    return playerWon ? "W" : "L";
}

export default function SmokeStatsCard({
    matches,
    playerNameById,
    loading,
    error,
}: {
    matches: MatchDoc[];
    playerNameById: Map<string, string>;
    loading: boolean;
    error: string | null;
}) {
    const computed = useMemo(() => {
        const map = new Map<
            string,
            { smoked: number; smokedW: number; smokedD: number; smokedL: number }
        >();

        for (const m of matches) {
            const smokedIds = new Set(m.smokedPlayerIds ?? []);
            if (smokedIds.size === 0) continue;

            for (const pid of smokedIds) {
                const res = outcomeForPlayer(m, pid);
                if (!res) continue;

                const cur = map.get(pid) ?? { smoked: 0, smokedW: 0, smokedD: 0, smokedL: 0 };
                cur.smoked += 1;
                if (res === "W") cur.smokedW += 1;
                else if (res === "D") cur.smokedD += 1;
                else cur.smokedL += 1;
                map.set(pid, cur);
            }
        }

        const all = Array.from(map.entries()).map(([pid, s]) => {
            const winrate = s.smoked > 0 ? s.smokedW / s.smoked : 0;
            return { pid, ...s, winrate };
        });

        const mostSmoked = all.slice().sort((a, b) => b.smoked - a.smoked).slice(0, 5);

        const bestWinrate = all
            .filter((x) => x.smoked >= 3)
            .sort((a, b) => b.winrate - a.winrate)
            .slice(0, 5);

        return { mostSmoked, bestWinrate };
    }, [matches]);

    if (loading) return null;
    if (error) return null;

    const hasData = computed.mostSmoked.length > 0 || computed.bestWinrate.length > 0;
    if (!hasData) return null;

    return (
        <div className="card-solid rounded-3xl p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold tracking-tight">HumoStats 🚬</h3>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                    <div className="text-xs font-semibold text-white/70">Más fumaron</div>
                    <div className="mt-3 space-y-2">
                        {computed.mostSmoked.map((x) => (
                            <Row
                                key={x.pid}
                                name={playerNameById.get(x.pid) ?? x.pid}
                                right={`${x.smoked} PJ`}
                                sub={`${x.smokedW}G · ${x.smokedD}E · ${x.smokedL}P`}
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                    <div className="text-xs font-semibold text-white/70">Mejor winrate quemando (min 3 partidos)</div>
                    <div className="mt-3 space-y-2">
                        {computed.bestWinrate.length === 0 ? (
                            <p className="text-sm text-white/55">Todavía no hay suficientes datos.</p>
                        ) : (
                            computed.bestWinrate.map((x) => (
                                <Row
                                    key={x.pid}
                                    name={playerNameById.get(x.pid) ?? x.pid}
                                    right={`${Math.round(x.winrate * 100)}%`}
                                    sub={`${x.smoked} PJ · ${x.smokedW}G ${x.smokedD}E ${x.smokedL}P`}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({ name, right, sub }: { name: string; right: string; sub: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
            <div>
                <div className="text-sm font-semibold text-white/85">{name}</div>
                <div className="text-xs text-white/50">{sub}</div>
            </div>
            <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                {right}
            </div>
        </div>
    );
}
