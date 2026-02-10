import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export type Standing = {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    last5?: ("W" | "D" | "L")[];
    streakType?: "W" | "D" | "L";
    streakCount?: number;
};

export type TableRow = {
    playerId: string;
    displayName: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalDiff: number;
    points: number;
    last5: string;
    streak: string;
};

const asString = (v: unknown, fallback: string) => {
    const s = typeof v === "string" ? v.trim() : "";
    return s.length ? s : fallback;
};

const asNumber = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
};

function safeStanding(s?: any): Standing {
    return {
        played: asNumber(s?.played),
        wins: asNumber(s?.wins),
        draws: asNumber(s?.draws),
        losses: asNumber(s?.losses),
        points: asNumber(s?.points),
        last5: Array.isArray(s?.last5) ? s.last5 : [],
        streakType: s?.streakType,
        streakCount: asNumber(s?.streakCount),
    };
}

export async function fetchSeasonTable(seasonId: string): Promise<TableRow[]> {
    const playersRef = collection(db, "seasons", seasonId, "players");
    const playersQ = query(playersRef, where("isActive", "==", true));
    const playersSnap = await getDocs(playersQ);

    const standingsRef = collection(db, "seasons", seasonId, "standings");
    const standingsSnap = await getDocs(standingsRef);

    const matchesRef = collection(db, "seasons", seasonId, "matches");
    const matchesSnap = await getDocs(matchesRef);

    const standingsMap = new Map<string, Standing>();
    for (const d of standingsSnap.docs) {
        standingsMap.set(d.id, safeStanding(d.data()));
    }

    const goalDiffMap = new Map<string, number>();
    for (const d of matchesSnap.docs) {
        const m = d.data() as any;
        const teamA = Array.isArray(m.teamA) ? m.teamA : [];
        const teamB = Array.isArray(m.teamB) ? m.teamB : [];
        const diff = asNumber(m.goalDiff);

        for (const playerId of teamA) {
            goalDiffMap.set(playerId, (goalDiffMap.get(playerId) ?? 0) + diff);
        }

        for (const playerId of teamB) {
            goalDiffMap.set(playerId, (goalDiffMap.get(playerId) ?? 0) - diff);
        }
    }

    const rows: TableRow[] = playersSnap.docs.map((d) => {
        const p = d.data() as any;

        const displayName = asString(p.nickname, asString(p.name, d.id));

        const st = safeStanding(standingsMap.get(d.id));
        const last5 = (st.last5 ?? []).join("") || "-";
        const streak = st.streakType ? `${st.streakType}${st.streakCount ?? 0}` : "-";

        return {
            playerId: d.id,
            displayName,
            played: st.played,
            wins: st.wins,
            draws: st.draws,
            losses: st.losses,
            goalDiff: goalDiffMap.get(d.id) ?? 0,
            points: st.points,
            last5,
            streak,
        };
    });

    rows.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.played !== a.played) return b.played - a.played;
        return String(a.displayName).localeCompare(String(b.displayName), "es");
    });

    return rows;
}
