"use client";

import { useEffect, useState } from "react";
import { usePlayers } from "@/lib/hooks/usePlayers";
import { useStandings } from "@/lib/hooks/useStandings";
import { useMatches } from "@/lib/hooks/useMatches";
import StandingsTab from "./tabs/StandingsTab";
import MatchesTab from "./tabs/MatchesTab";
import HeadToHeadTab from "./tabs/HeadToHeadTab";
import { useSearchParams } from "next/navigation";

type Tab = "table" | "matches" | "h2h";

export default function SeasonClient({ seasonId }: { seasonId: string }) {
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<Tab>("table");

    const { rows, loadingTable, errorTable } = useStandings(seasonId);
    const { players, playerNameById, loadingPlayers, errorPlayers } = usePlayers(seasonId);
    const { matches, loadingMatches, errorMatches } = useMatches(seasonId, tab === "matches" || tab === "h2h");

    useEffect(() => {
        const t = searchParams.get("tab");
        if (t === "table" || t === "matches" || t === "h2h") setTab(t);
    }, [searchParams]);

    return (
        <main className="min-h-screen bg-transparent text-white">
            <div className="mx-auto max-w-4xl px-4 py-8">
                <header className="card-solid rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Ranking Futbol 5
                            </div>

                            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
                                Tabla de posiciones
                            </h1>

                            <p className="mt-1 text-base sm:text-lg text-white/70">
                                Temporada <span className="font-semibold text-white/90">2026</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <button
                            onClick={() => setTab("table")}
                            className={[
                                "tab-pill rounded-full px-4 py-2 text-sm font-medium",
                                tab === "table" ? "tab-pill--active" : "",
                            ].join(" ")}
                        >
                            Tabla
                        </button>

                        <button
                            onClick={() => setTab("matches")}
                            className={[
                                "tab-pill rounded-full px-4 py-2 text-sm font-medium",
                                tab === "matches" ? "tab-pill--active" : "",
                            ].join(" ")}
                        >
                            Partidos
                        </button>

                        <button
                            onClick={() => setTab("h2h")}
                            className={[
                                "tab-pill rounded-full px-4 py-2 text-sm font-medium",
                                tab === "h2h" ? "tab-pill--active" : "",
                            ].join(" ")}
                        >
                            Head-to-head
                        </button>
                    </div>
                </header>

                <section className="mt-6">
                    {tab === "table" && <StandingsTab rows={rows} loading={loadingTable} error={errorTable} />}

                    {tab === "matches" && (
                        <MatchesTab
                            matches={matches}
                            loading={loadingMatches}
                            error={errorMatches}
                            players={players}
                            playerNameById={playerNameById}
                            loadingPlayers={loadingPlayers}
                            errorPlayers={errorPlayers}
                        />
                    )}

                    {tab === "h2h" && (
                        <HeadToHeadTab
                            matches={matches}
                            loading={loadingMatches}
                            error={errorMatches}
                            players={players}
                            playerNameById={playerNameById}
                        />
                    )}
                </section>

                <footer className="mt-6 text-xs text-white/40">
                    Puntos: Victoria 2 · Empate 1 · Derrota 0
                </footer>
            </div>
        </main>
    );
}
