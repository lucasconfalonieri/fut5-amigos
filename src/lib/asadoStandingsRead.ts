import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";

export type AsadoStandingRow = {
    playerId: string;
    points: number;
    attended: number;
    hosted: number;
    asador: number;
    lastSeenAt: Date | null;
};

export async function listAsadoStandings(seasonId: string): Promise<AsadoStandingRow[]> {
    const snap = await getDocs(collection(db, "seasons", seasonId, "asadoStandings"));
    return snap.docs.map((d) => {
        const data: any = d.data();
        const ts: Timestamp | null = data.lastSeenAt ?? null;
        return {
            playerId: d.id,
            points: Number(data.points ?? 0),
            attended: Number(data.attended ?? 0),
            hosted: Number(data.hosted ?? 0),
            asador: Number(data.asador ?? 0),
            lastSeenAt: ts?.toDate?.() ?? null,
        };
    });
}
