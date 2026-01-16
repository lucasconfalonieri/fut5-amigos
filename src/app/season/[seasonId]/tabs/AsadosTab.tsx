"use client";

import { useMemo } from "react";
import { AsadoDoc } from "@/lib/asadosRead";
import { AsadoTableRow } from "@/lib/hooks/useAsadoStandings";
import { formatDayTitle, formatTime } from "@/lib/utils/date";

export default function AsadosTab({
    rows,
    loadingTable,
    errorTable,
    asados,
    loadingAsados,
    errorAsados,
    playerNameById,
}: {
    rows: AsadoTableRow[];
    loadingTable: boolean;
    errorTable: string | null;
    asados: AsadoDoc[];
    loadingAsados: boolean;
    errorAsados: string | null;
    playerNameById: Map<string, string>;
}) {
    const top3 = useMemo(() => rows.slice(0, 3), [rows]);

    if (loadingTable || loadingAsados) return <p className="text-white/60">Cargando asados…</p>;
    if (errorTable) return <p className="text-red-200">{errorTable}</p>;
    if (errorAsados) return <p className="text-red-200">{errorAsados}</p>;

    const thBase = "px-4 py-3 align-middle whitespace-nowrap";
    const tdBase = "px-4 py-3 align-middle";
    const thNum = `${thBase} text-center`;
    const tdNum = `${tdBase} text-center tabular-nums`;
    const thLeft = `${thBase} text-left`;
    const tdLeft = `${tdBase} text-left`;

    return (
        <div className="space-y-4">
            <div className="card-solid rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">Asado League 🥩</h2>
                        <p className="text-sm text-white/60">1 punto por presencia +1 anfitrión +1 asador</p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {top3.map((r, idx) => {
                        const hosted = (r as any).hosted ?? 0;
                        const asador = (r as any).asador ?? 0;

                        return (
                            <div key={r.playerId} className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                                <div className="text-xs text-white/50">
                                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"} Puesto #{idx + 1}
                                </div>

                                <div className="mt-1 text-base font-semibold">{r.displayName}</div>

                                <div className="mt-2 flex items-baseline justify-between">
                                    <div className="text-xs text-white/50">PTS</div>
                                    <div className="text-xl font-extrabold text-emerald-200 tabular-nums">{r.points}</div>
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    <div className="rounded-xl border border-white/10 bg-zinc-950 p-2">
                                        <div className="text-[11px] text-white/50">Asados</div>
                                        <div className="mt-0.5 text-sm font-semibold tabular-nums text-white/85">
                                            {r.attended ?? 0}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2">
                                        <div className="text-[11px] text-emerald-200/80">Anfitrión</div>
                                        <div className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-200">
                                            {hosted}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2">
                                        <div className="text-[11px] text-orange-200/80">Asador</div>
                                        <div className="mt-0.5 text-sm font-semibold tabular-nums text-orange-200">
                                            {asador}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {top3.length === 0 && <p className="text-white/60">Todavía no hay asados cargados.</p>}
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl card-solid">
                <table className="min-w-[860px] w-full text-sm">
                    <thead className="bg-emerald-500/10 text-xs uppercase tracking-wide text-white/70">
                        <tr>
                            <th className={thNum}>#</th>
                            <th className={thLeft}>Jugador</th>

                            <th className={`${thNum} bg-emerald-500/10 text-emerald-100`}>PTS</th>

                            <th className={thNum}>Asados</th>
                            <th className={thNum}>Anfitrión</th>
                            <th className={thNum}>Asador</th>

                            <th className={`${thBase} text-right`}>Último</th>
                        </tr>
                    </thead>

                    <tbody className="text-white/90">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-white/60">
                                    No hay datos todavía.
                                </td>
                            </tr>
                        ) : (
                            rows.map((r, idx) => {
                                const hosted = (r as any).hosted ?? 0;
                                const asador = (r as any).asador ?? 0;

                                return (
                                    <tr
                                        key={r.playerId}
                                        className="border-b border-white/5 hover:bg-emerald-500/5 transition"
                                    >
                                        <td className={`${tdNum} text-white/70`}>{idx + 1}</td>

                                        <td className={tdLeft}>
                                            <div className="font-medium">{r.displayName}</div>
                                        </td>

                                        <td className={`${tdNum} bg-emerald-500/5`}>
                                            <span className="font-extrabold text-emerald-200 tabular-nums">
                                                {r.points}
                                            </span>
                                        </td>

                                        <td className={tdNum}>{r.attended ?? 0}</td>

                                        <td className={tdNum}>
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">
                                                🏠 <span className="tabular-nums">{hosted}</span>
                                            </span>
                                        </td>

                                        <td className={tdNum}>
                                            <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs text-orange-200">
                                                🔥 <span className="tabular-nums">{asador}</span>
                                            </span>
                                        </td>

                                        <td className={`${tdBase} text-right text-white/60`}>
                                            {r.lastSeenAt ? formatDayTitle(r.lastSeenAt) : "-"}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>


            <div className="card-solid rounded-2xl p-4">
                <h3 className="text-lg font-semibold">Historial de asados</h3>
                <p className="text-sm text-white/60">Ordenado por fecha (más reciente primero)</p>

                <div className="mt-4 space-y-3">
                    {asados.length === 0 ? (
                        <p className="text-white/60">Todavía no hay asados cargados.</p>
                    ) : (
                        asados.map((a) => {
                            const host = a.hostPlayerId ? playerNameById.get(a.hostPlayerId) ?? a.hostPlayerId : null;
                            const asador = a.asadorPlayerId
                                ? playerNameById.get(a.asadorPlayerId) ?? a.asadorPlayerId
                                : null;

                            return (
                                <div key={a.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="text-sm font-semibold">
                                            {formatDayTitle(a.date)} ·{" "}
                                            <span className="text-white/70">{formatTime(a.date)}</span>
                                        </div>

                                        {a.venue && (
                                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                                                📍 {a.venue}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {host && (
                                            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                                                🏠 Host: {host}
                                            </span>
                                        )}
                                        {asador && (
                                            <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs text-orange-200">
                                                🔥 Asador: {asador}
                                            </span>
                                        )}
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                                            Presentes: {a.presentPlayerIds.length}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {a.presentPlayerIds.map((pid) => (
                                            <span
                                                key={`${a.id}-${pid}`}
                                                className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-white/85"
                                            >
                                                {playerNameById.get(pid) ?? pid}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
