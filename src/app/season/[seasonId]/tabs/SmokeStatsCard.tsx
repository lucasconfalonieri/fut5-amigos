"use client";

import { useMemo } from "react";
import { MatchDoc } from "@/lib/matchesRead";

type Outcome = "W" | "D" | "L";

function pts(r: Outcome) {
    if (r === "W") return 2;
    if (r === "D") return 1;
    return 0;
}

function outcomeForPlayer(match: MatchDoc, playerId: string): Outcome | null {
    const inA = match.teamA.includes(playerId);
    const inB = match.teamB.includes(playerId);
    if (!inA && !inB) return null;

    if (match.goalDiff === 0) return "D";

    const teamAWon = match.goalDiff > 0;
    const playerWon = inA ? teamAWon : !teamAWon;
    return playerWon ? "W" : "L";
}

function outcomeForTeam(match: MatchDoc, team: "A" | "B"): Outcome {
    if (match.goalDiff === 0) return "D";
    const aWon = match.goalDiff > 0;
    return team === "A" ? (aWon ? "W" : "L") : (aWon ? "L" : "W");
}

type WLDSummary = {
    played: number;
    W: number;
    D: number;
    L: number;
    points: number;
    winrate: number; // W / PJ
};

function empty(): WLDSummary {
    return { played: 0, W: 0, D: 0, L: 0, points: 0, winrate: 0 };
}

function addResult(s: WLDSummary, r: Outcome) {
    s.played += 1;
    if (r === "W") s.W += 1;
    else if (r === "D") s.D += 1;
    else s.L += 1;
    s.points += pts(r);
    s.winrate = s.played ? s.W / s.played : 0;
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
        // ========== 1) POR JUGADOR: fumando vs sobrio ==========
        const perPlayer = new Map<
            string,
            { smoked: WLDSummary; sober: WLDSummary }
        >();

        for (const m of matches) {
            const smokedSet = new Set(m.smokedPlayerIds ?? []);

            // armamos el set de todos los que jugaron
            const all = [...m.teamA, ...m.teamB];

            for (const pid of all) {
                const res = outcomeForPlayer(m, pid);
                if (!res) continue;

                const entry = perPlayer.get(pid) ?? { smoked: empty(), sober: empty() };

                if (smokedSet.has(pid)) addResult(entry.smoked, res);
                else addResult(entry.sober, res);

                perPlayer.set(pid, entry);
            }
        }

        const playersArr = Array.from(perPlayer.entries()).map(([pid, stats]) => {
            return {
                pid,
                name: playerNameById.get(pid) ?? pid,
                smoked: stats.smoked,
                sober: stats.sober,
            };
        });

        // orden default: más "partidos fumando" y luego winrate fumando
        playersArr.sort((a, b) => {
            if (b.smoked.played !== a.smoked.played) return b.smoked.played - a.smoked.played;
            return b.smoked.winrate - a.smoked.winrate;
        });

        const mostSmoked = playersArr
            .slice()
            .sort((a, b) => b.smoked.played - a.smoked.played)
            .slice(0, 5);

        // ========== 2) GLOBAL: “el humo da suerte” ==========
        // a) nivel match: ¿hubo humo en el partido?
        let matchWithSmoke = 0;
        let matchWithoutSmoke = 0;

        // b) nivel equipos: comparar solo partidos donde exactamente un equipo tuvo humo
        let oneTeamSmokeCount = 0;
        const smokeTeam = empty(); // stats del equipo que tuvo humo
        const soberTeam = empty(); // stats del equipo sin humo

        for (const m of matches) {
            const smoked = new Set(m.smokedPlayerIds ?? []);
            const hasSmoke = smoked.size > 0;
            if (hasSmoke) matchWithSmoke += 1;
            else matchWithoutSmoke += 1;

            const teamAHasSmoke = m.teamA.some((id) => smoked.has(id));
            const teamBHasSmoke = m.teamB.some((id) => smoked.has(id));

            // si ambos o ninguno → no es comparable “justo”
            if (teamAHasSmoke === teamBHasSmoke) continue;

            oneTeamSmokeCount += 1;
            const smokingTeam = teamAHasSmoke ? "A" : "B";
            const soberTeamKey = teamAHasSmoke ? "B" : "A";

            addResult(smokeTeam, outcomeForTeam(m, smokingTeam));
            addResult(soberTeam, outcomeForTeam(m, soberTeamKey));
        }

        return {
            playersArr,
            mostSmoked,
            matchWithSmoke,
            matchWithoutSmoke,
            oneTeamSmokeCount,
            smokeTeam,
            soberTeam,
        };
    }, [matches, playerNameById]);

    if (loading) return null;
    if (error) return null;
    if (!matches.length) return null;

    const hasAnySmoke = computed.matchWithSmoke > 0;

    // si nunca marcaron humo todavía, mostramos una card mini para invitar a usarlo
    if (!hasAnySmoke) {
        return (
            <div className="card-solid rounded-3xl p-5">
                <h3 className="text-lg font-extrabold tracking-tight">HumoStats 🚬</h3>
                <p className="mt-2 text-sm text-white/60">
                    Todavía no hay partidos con “Fumó”. Cuando lo marques al cargar un partido,
                    acá vas a ver estadísticas comparando fumando vs sobrio 😄
                </p>
            </div>
        );
    }

    return (
        <div className="card-solid rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold tracking-tight">HumoStats 🚬</h3>
            </div>

            {/* GLOBAL */}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                    <div className="text-xs font-semibold text-white/70">Partidos con humo vs sin humo</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <MiniStat label="Con humo" value={computed.matchWithSmoke} />
                        <MiniStat label="Sin humo" value={computed.matchWithoutSmoke} />
                    </div>
                    <p className="mt-3 text-xs text-white/45">
                        (Cuenta si hubo al menos un 🚬 marcado en el partido)
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                    <div className="text-xs font-semibold text-white/70">¿El humo da suerte?</div>

                    {computed.oneTeamSmokeCount === 0 ? (
                        <p className="mt-3 text-sm text-white/55">
                            Todavía no hay partidos “comparables” (donde solo un equipo tuvo humo).
                        </p>
                    ) : (
                        <>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <RateCard
                                    title="Equipo con humo"
                                    played={computed.smokeTeam.played}
                                    winrate={computed.smokeTeam.winrate}
                                    wdl={`${computed.smokeTeam.W}G · ${computed.smokeTeam.D}E · ${computed.smokeTeam.L}P`}
                                />
                                <RateCard
                                    title="Equipo sin humo"
                                    played={computed.soberTeam.played}
                                    winrate={computed.soberTeam.winrate}
                                    wdl={`${computed.soberTeam.W}G · ${computed.soberTeam.D}E · ${computed.soberTeam.L}P`}
                                />
                            </div>

                            <p className="mt-3 text-xs text-white/45">
                                Solo cuenta partidos donde <span className="text-white/70">exactamente un equipo</span> tuvo humo.
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <div className="text-xs font-semibold text-white/70">Top quemadores 🚬</div>
                    </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {computed.mostSmoked.length === 0 ? (
                        <p className="text-sm text-white/55">Todavía no hay datos de humo.</p>
                    ) : (
                        computed.mostSmoked.map((p, idx) => (
                            <div
                                key={p.pid}
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/50">#{idx + 1}</span>
                                        <div className="truncate text-sm font-semibold text-white/85">{p.name}</div>
                                    </div>
                                    <div className="mt-0.5 text-xs text-white/50">
                                        {p.smoked.W}G · {p.smoked.D}E · {p.smoked.L}P
                                    </div>
                                </div>

                                <div className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                    🚬 {p.smoked.played} PJ
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <details className="mt-3 group rounded-2xl border border-white/10 bg-zinc-950">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-4 hover:bg-white/5">
                    <div>
                        <div className="text-xs font-semibold text-white/70">Winrate fumando vs sobrio</div>
                        <p className="mt-1 text-xs text-white/45">
                            Abrí para ver la tabla completa por jugador.
                        </p>
                    </div>

                    <span className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-white/70 group-open:bg-zinc-800">
                        <span className="group-open:hidden">Ver</span>
                        <span className="hidden group-open:inline">Ocultar</span>
                    </span>
                </summary>

                <div className="border-t border-white/10 px-4 pb-4 pt-4">
                    <div className="overflow-hidden rounded-2xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/60">
                                <tr>
                                    <th className="px-3 py-3">Jugador</th>
                                    <th className="px-3 py-3 text-center">Fumando</th>
                                    <th className="px-3 py-3 text-center">Sobrio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {computed.playersArr.map((p) => (
                                    <tr key={p.pid} className="border-t border-white/5 hover:bg-white/5">
                                        <td className="px-3 py-3 font-semibold text-white/85">{p.name}</td>
                                        <td className="px-3 py-3">
                                            <TwoColCell s={p.smoked} accent="emerald" />
                                        </td>
                                        <td className="px-3 py-3">
                                            <TwoColCell s={p.sober} accent="zinc" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </details>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-3">
            <div className="text-xs text-white/50">{label}</div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight">{value}</div>
        </div>
    );
}

function RateCard({
    title,
    played,
    winrate,
    wdl,
}: {
    title: string;
    played: number;
    winrate: number;
    wdl: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-3">
            <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/70">{title}</div>
                <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    {Math.round(winrate * 100)}%
                </div>
            </div>
            <div className="mt-1 text-xs text-white/50">{wdl}</div>
            <div className="mt-1 text-xs text-white/45">PJ: {played}</div>
        </div>
    );
}

function TwoColCell({ s, accent }: { s: { played: number; W: number; D: number; L: number; points: number; winrate: number }; accent: "emerald" | "zinc" }) {
    const pill =
        accent === "emerald"
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
            : "border-white/10 bg-zinc-900 text-white/70";

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pill}`}>
                    Winrate: {Math.round(s.winrate * 100)}%
                </span>
                <span className="text-xs text-white/60">PJ: {s.played}</span>
            </div>
            <div className="text-xs text-white/55">
                {s.W}G · {s.D}E · {s.L}P · <span className="text-white/75 font-semibold">{s.points} PTS</span>
            </div>
        </div>
    );
}
