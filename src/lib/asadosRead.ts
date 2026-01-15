import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";

export type AsadoDoc = {
    id: string;
    date: Date;
    venue: string | null;
    presentPlayerIds: string[];
    hostPlayerId: string | null;
    asadorPlayerId: string | null;
    createdBy: string;
};

export async function listAsados(seasonId: string): Promise<AsadoDoc[]> {
    const q = query(
        collection(db, "seasons", seasonId, "asados"),
        orderBy("date", "desc")
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => {
        const data: any = d.data();
        const ts: Timestamp = data.date;
        return {
            id: d.id,
            date: ts?.toDate?.() ?? new Date(),
            venue: data.venue ?? null,
            presentPlayerIds: Array.isArray(data.presentPlayerIds) ? data.presentPlayerIds : [],
            hostPlayerId: data.hostPlayerId ?? null,
            asadorPlayerId: data.asadorPlayerId ?? null,
            createdBy: data.createdBy ?? "",
        };
    });
}
