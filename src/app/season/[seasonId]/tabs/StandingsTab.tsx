"use client";

import { TableRow } from "@/lib/seasonTable";
import { useRouter } from "next/navigation";

type Res = "W" | "D" | "L";

function toESP(r: Res) {
    if (r === "W") return "G";
    if (r === "D") return "E";
    return "P";
}

function chipClass(r: Res) {
    if (r === "W") return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
    if (r === "D") return "text-yellow-200 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-200 bg-red-500/10 border-red-500/20";
}

function parseLast5(last5: string): Res[] {
    if (!last5) return [];
    const parts = last5.includes(" ") ? last5.split(" ") : last5.split("");
    return parts
        .map((x) => x.trim().toUpperCase())
        .filter((x) => x === "W" || x === "D" || x === "L") as Res[];
}

function formatStreak(streak: string) {
    if (!streak || streak.length < 2) return "-";

    const type = streak[0].toUpperCase() as Res;
    const count = Number(streak.slice(1));
    if (!Number.isFinite(count) || count <= 0) return "-";

    const word =
        type === "W"
            ? count === 1
                ? "ganado"
                : "ganados"
            : type === "D"
                ? count === 1
                    ? "empatado"
                    : "empatados"
                : count === 1
                    ? "perdido"
                    : "perdidos";

    return `${count} ${word}`;
}

export default function StandingsTab({
    rows,
    loading,
    error,
}: {
    rows: TableRow[];
    loading: boolean;
    error: string | null;
}) {
    const router = useRouter();

    // MVP: si tu temporada siempre es /season/1, dejamos esto fijo
    const seasonId = "1";

    if (loading) return <p className="text-white/60">Cargando tabla…</p>;
    if (error) return <p className="text-red-200">{error}</p>;
    if (!rows.length) return <p className="text-white/60">No hay datos todavía.</p>;

    const thBase = "px-4 py-3 align-middle whitespace-nowrap";
    const tdBase = "px-4 py-3 align-middle";
    const thNum = `${thBase} text-center`;
    const tdNum = `${tdBase} text-center tabular-nums`;
    const thLeft = `${thBase} text-left`;
    const tdLeft = `${tdBase} text-left`;
    const thCenter = `${thBase} text-center`;
    const tdCenter = `${tdBase} text-center`;

    return (
        <div className="overflow-x-auto rounded-2xl card-solid">
            <table className="min-w-[860px] w-full text-sm">
                <thead className="bg-emerald-500/10 text-xs uppercase tracking-wide text-white/70">
                    <tr>
                        <th className={thNum}>#</th>
                        <th className={thLeft}>Jugador</th>

                        {/* PTS header destacado */}
                        <th className={`${thNum} bg-emerald-500/10 text-emerald-100`}>PTS</th>

                        <th className={thNum}>PJ</th>
                        <th className={thNum}>PG</th>
                        <th className={thNum}>PE</th>
                        <th className={thNum}>PP</th>

                        <th className={thCenter}>Racha</th>
                        <th className={thCenter}>Últimos 5</th>
                    </tr>
                </thead>

                <tbody className="text-white/90">
                    {rows.map((r, idx) => {
                        const last5 = parseLast5(r.last5);
                        const streakText = formatStreak(r.streak);

                        const goProfile = () => router.push(`/season/${seasonId}/player/${r.playerId}`);

                        return (
                            <tr
                                key={r.playerId}
                                onClick={goProfile}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") goProfile();
                                }}
                                tabIndex={0}
                                role="button"
                                className="border-b border-white/5 hover:bg-emerald-500/5 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                title={`Ver perfil de ${r.displayName}`}
                            >
                                <td className={`${tdNum} text-white/70`}>{idx + 1}</td>

                                <td className={tdLeft}>
                                    <div className="font-medium hover:text-emerald-200">{r.displayName}</div>
                                </td>

                                {/* PTS columna destacada */}
                                <td className={`${tdNum} bg-emerald-500/5`}>
                                    <span className="font-extrabold text-emerald-200">{r.points}</span>
                                </td>

                                <td className={tdNum}>{r.played}</td>
                                <td className={tdNum}>{r.wins}</td>
                                <td className={tdNum}>{r.draws}</td>
                                <td className={tdNum}>{r.losses}</td>

                                <td className={`${tdCenter} text-white/80`}>{streakText}</td>

                                <td className={tdCenter}>
                                    <div className="flex flex-wrap justify-center gap-1.5">
                                        {last5.length === 0 ? (
                                            <span className="text-xs text-white/40">-</span>
                                        ) : (
                                            last5.map((res, i) => (
                                                <span
                                                    key={`${r.playerId}-last5-${i}`}
                                                    className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold ${chipClass(res)}`}
                                                    title={res === "W" ? "Ganado" : res === "D" ? "Empatado" : "Perdido"}
                                                >
                                                    {toESP(res)}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
