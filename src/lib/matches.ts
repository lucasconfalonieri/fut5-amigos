import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    increment,
    runTransaction,
    serverTimestamp,
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

function nextLast5(prev: Result[] | undefined, r: Result) {
    const arr = Array.isArray(prev) ? [...prev] : [];
    arr.push(r);
    return arr.slice(-5);
}

function nextStreak(prevType?: Result, prevCount?: number, r?: Result) {
    if (!r) return { streakType: prevType ?? null, streakCount: prevCount ?? 0 };
    if (!prevType || prevType !== r) return { streakType: r, streakCount: 1 };
    return { streakType: r, streakCount: (prevCount ?? 0) + 1 };
}

export async function createMatchAndUpdateStandings(input: {
    seasonId: string;
    date: Date;
    teamA: string[]; // 5 ids
    teamB: string[]; // 5 ids
    goalDiff: number;
    createdBy: string; // uid
    smokedPlayerIds?: string[];
}) {
    const { seasonId, date, teamA, teamB, goalDiff, createdBy } = input;
    const smokedPlayerIds = Array.from(new Set(input.smokedPlayerIds ?? []));

    if (teamA.length !== 5 || teamB.length !== 5) throw new Error("Debe ser 5v5.");
    const all = [...teamA, ...teamB];
    if (new Set(all).size !== 10) throw new Error("Hay jugadores repetidos entre equipos.");

    const seasonRef = doc(db, "seasons", seasonId);
    const matchesCol = collection(db, "seasons", seasonId, "matches");
    const res = resultFromGoalDiff(goalDiff);

    await runTransaction(db, async (tx) => {
        const seasonSnap = await tx.get(seasonRef);
        if (!seasonSnap.exists()) throw new Error("Temporada no encontrada.");

        const winPts = seasonSnap.data().pointsWin ?? 2;
        const drawPts = seasonSnap.data().pointsDraw ?? 1;
        const lossPts = seasonSnap.data().pointsLoss ?? 0;

        const standingRefs = all.map((playerId) =>
            doc(db, "seasons", seasonId, "standings", playerId)
        );

        const standingSnaps = await Promise.all(standingRefs.map((ref) => tx.get(ref)));

        const snapById = new Map<string, (typeof standingSnaps)[number]>();
        for (let i = 0; i < all.length; i++) snapById.set(all[i], standingSnaps[i]);

        const matchRef = doc(matchesCol);
        tx.set(matchRef, {
            date,
            teamA,
            teamB,
            goalDiff,
            smokedPlayerIds,
            createdAt: serverTimestamp(),
            createdBy,
        });

        const apply = (playerId: string, r: Result) => {
            const stRef = doc(db, "seasons", seasonId, "standings", playerId);
            const stSnap = snapById.get(playerId);
            const pts = pointsFor(r, winPts, drawPts, lossPts);

            if (!stSnap || !stSnap.exists()) {
                tx.set(stRef, {
                    played: 1,
                    wins: r === "W" ? 1 : 0,
                    draws: r === "D" ? 1 : 0,
                    losses: r === "L" ? 1 : 0,
                    points: pts,
                    last5: [r],
                    streakType: r,
                    streakCount: 1,
                    updatedAt: serverTimestamp(),
                });
                return;
            }

            const prev = stSnap.data() as any;
            const newLast5 = nextLast5(prev.last5, r);
            const streak = nextStreak(prev.streakType, prev.streakCount, r);

            tx.update(stRef, {
                played: increment(1),
                wins: increment(r === "W" ? 1 : 0),
                draws: increment(r === "D" ? 1 : 0),
                losses: increment(r === "L" ? 1 : 0),
                points: increment(pts),
                last5: newLast5,
                streakType: streak.streakType,
                streakCount: streak.streakCount,
                updatedAt: serverTimestamp(),
            });
        };

        for (const pid of teamA) apply(pid, res.a);
        for (const pid of teamB) apply(pid, res.b);
    });
}
