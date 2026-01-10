import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export type MatchDoc = {
    id: string;
    date: Date;
    teamA: string[];
    teamB: string[];
    goalDiff: number;
    createdBy?: string;
};

const asNumber = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
};

export async function listMatches(seasonId: string): Promise<MatchDoc[]> {
    const ref = collection(db, "seasons", seasonId, "matches");
    const q = query(ref, orderBy("date", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
        const data = d.data() as any;
        const dateVal = data.date?.toDate ? data.date.toDate() : new Date(data.date);

        return {
            id: d.id,
            date: dateVal,
            teamA: Array.isArray(data.teamA) ? data.teamA : [],
            teamB: Array.isArray(data.teamB) ? data.teamB : [],
            goalDiff: asNumber(data.goalDiff),
            createdBy: data.createdBy,
        };
    });
}
