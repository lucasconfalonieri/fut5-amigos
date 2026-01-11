"use client";

import { useState } from "react";
import { usePlayers } from "@/lib/hooks/usePlayers";
import { useStandings } from "@/lib/hooks/useStandings";
import { useMatches } from "@/lib/hooks/useMatches";
import StandingsTab from "./tabs/StandingsTab";
import MatchesTab from "./tabs/MatchesTab";
import HeadToHeadTab from "./tabs/HeadToHeadTab";

type Tab = "table" | "matches" | "h2h";

export default function SeasonClient({ seasonId }: { seasonId: string }) {
    const [tab, setTab] = useState<Tab>("table");

    const { rows, loadingTable, errorTable } = useStandings(seasonId);
    const { players, playerNameById, loadingPlayers, errorPlayers } = usePlayers(seasonId);
    const { matches, loadingMatches, errorMatches } = useMatches(seasonId, tab === "matches" || tab === "h2h");

    return (
        <main className="min-h-screen bg-transparent text-white">
            <div className="mx-auto max-w-4xl px-4 py-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Tabla de posiciones</h1>
                    <p className="text-sm text-white/60">Temporada: 2026</p>
                </header>

                {/* Tabs */}
                <div className="mt-6 flex gap-2">
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
                <footer className="mt-6 text-xs text-white/40">Puntos: Victoria 2 · Empate 1 · Derrota 0</footer>
            </div>
        </main>
    );
}
