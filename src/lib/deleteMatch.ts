import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    runTransaction,
    serverTimestamp,
    deleteDoc,
    writeBatch,
} from "firebase/firestore";

type Result = "W" | "D" | "L";

function resultFromGoalDiff(goalDiff: number): { a: Result; b: Result } {
    if (goalDiff > 0) return { a: "W", b: "L" };
    if (goalDiff < 0) return { a: "L", b: "W" };
    return { a: "D", b: "D" };
}

function pointsFor(r: Result, winPts: number, drawPts: number, lossPts: number) {
    if (r === "W") return winPts;
    if (r === "D") return drawPts;
    return lossPts;
}

function nextLast5(prev: Result[], r: Result) {
    const arr = [...prev];
    arr.push(r);
    return arr.slice(-5);
}

function nextStreak(prevType: Result | null, prevCount: number, r: Result) {
    if (!prevType || prevType !== r) return { streakType: r, streakCount: 1 };
    return { streakType: r, streakCount: prevCount + 1 };
}

type StandingAccum = {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    last5: Result[];
    streakType: Result | null;
    streakCount: number;
};

function emptyStanding(): StandingAccum {
    return {
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        last5: [],
        streakType: null,
        streakCount: 0,
    };
}

/**
 * Elimina un partido y reconstruye TODOS los standings de la temporada
 * a partir de los partidos restantes.
 */
export async function deleteMatchAndRebuildStandings(
    seasonId: string,
    matchId: string
) {
    const seasonRef = doc(db, "seasons", seasonId);
    const matchesCol = collection(db, "seasons", seasonId, "matches");
    const standingsCol = collection(db, "seasons", seasonId, "standings");

    // 1) Read all matches
    const matchesSnap = await getDocs(matchesCol);
    const allMatches = matchesSnap.docs
        .filter((d) => d.id !== matchId)
        .map((d) => {
            const data = d.data() as any;
            const dateVal = data.date?.toDate ? data.date.toDate() : new Date(data.date);
            return {
                id: d.id,
                date: dateVal as Date,
                teamA: (data.teamA ?? []) as string[],
                teamB: (data.teamB ?? []) as string[],
                goalDiff: Number(data.goalDiff ?? 0),
            };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    // 2) Read season config for point values
    const { getDoc } = await import("firebase/firestore");
    const seasonSnap = await getDoc(seasonRef);
    if (!seasonSnap.exists()) throw new Error("Temporada no encontrada.");

    const winPts = seasonSnap.data().pointsWin ?? 2;
    const drawPts = seasonSnap.data().pointsDraw ?? 1;
    const lossPts = seasonSnap.data().pointsLoss ?? 0;

    // 3) Compute new standings in-memory
    const standingsMap = new Map<string, StandingAccum>();

    for (const m of allMatches) {
        const res = resultFromGoalDiff(m.goalDiff);

        const applyResult = (playerId: string, r: Result) => {
            if (!standingsMap.has(playerId)) standingsMap.set(playerId, emptyStanding());
            const st = standingsMap.get(playerId)!;

            st.played++;
            if (r === "W") st.wins++;
            if (r === "D") st.draws++;
            if (r === "L") st.losses++;
            st.points += pointsFor(r, winPts, drawPts, lossPts);
            st.last5 = nextLast5(st.last5, r);
            const streak = nextStreak(st.streakType, st.streakCount, r);
            st.streakType = streak.streakType;
            st.streakCount = streak.streakCount;
        };

        for (const pid of m.teamA) applyResult(pid, res.a);
        for (const pid of m.teamB) applyResult(pid, res.b);
    }

    // 4) Delete old standings + write new ones + delete the match (batch)
    const batch = writeBatch(db);

    // delete the match doc
    batch.delete(doc(matchesCol, matchId));

    // delete all existing standings
    const standingsSnap = await getDocs(standingsCol);
    for (const d of standingsSnap.docs) {
        batch.delete(d.ref);
    }

    // write new standings
    for (const [playerId, st] of standingsMap.entries()) {
        const ref = doc(standingsCol, playerId);
        batch.set(ref, {
            played: st.played,
            wins: st.wins,
            draws: st.draws,
            losses: st.losses,
            points: st.points,
            last5: st.last5,
            streakType: st.streakType,
            streakCount: st.streakCount,
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
}
