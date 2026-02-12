import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";

type AsadoAccum = {
    points: number;
    attended: number;
    hosted: number;
    asador: number;
    lastSeenAt: Date | null;
};

function emptyAsadoStanding(): AsadoAccum {
    return { points: 0, attended: 0, hosted: 0, asador: 0, lastSeenAt: null };
}

/**
 * Elimina una juntada y reconstruye TODOS los asadoStandings de la temporada
 * a partir de las juntadas restantes.
 */
export async function deleteAsadoAndRebuildStandings(
    seasonId: string,
    asadoId: string
) {
    const asadosCol = collection(db, "seasons", seasonId, "asados");
    const standingsCol = collection(db, "seasons", seasonId, "asadoStandings");

    // 1) Read all asados, exclude the one being deleted
    const asadosSnap = await getDocs(asadosCol);
    const allAsados = asadosSnap.docs
        .filter((d) => d.id !== asadoId)
        .map((d) => {
            const data = d.data() as any;
            const dateVal = data.date?.toDate ? data.date.toDate() : new Date(data.date);
            return {
                id: d.id,
                date: dateVal as Date,
                presentPlayerIds: (data.presentPlayerIds ?? []) as string[],
                hostPlayerId: (data.hostPlayerId ?? null) as string | null,
                asadorPlayerId: (data.asadorPlayerId ?? null) as string | null,
            };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    // 2) Compute new asadoStandings in-memory
    const standingsMap = new Map<string, AsadoAccum>();

    for (const a of allAsados) {
        const presentSet = new Set(a.presentPlayerIds);

        const impactedIds = Array.from(
            new Set([
                ...a.presentPlayerIds,
                ...(a.hostPlayerId ? [a.hostPlayerId] : []),
                ...(a.asadorPlayerId ? [a.asadorPlayerId] : []),
            ])
        );

        for (const pid of impactedIds) {
            if (!standingsMap.has(pid)) standingsMap.set(pid, emptyAsadoStanding());
            const st = standingsMap.get(pid)!;

            const isPresent = presentSet.has(pid);
            const isHost = a.hostPlayerId === pid;
            const isAsador = a.asadorPlayerId === pid;

            st.points += (isPresent ? 1 : 0) + (isHost ? 1 : 0) + (isAsador ? 1 : 0);
            if (isPresent) {
                st.attended++;
                if (!st.lastSeenAt || a.date > st.lastSeenAt) {
                    st.lastSeenAt = a.date;
                }
            }
            if (isHost) st.hosted++;
            if (isAsador) st.asador++;
        }
    }

    // 3) Batch: delete asado + delete old standings + write new standings
    const batch = writeBatch(db);

    // delete the asado doc
    batch.delete(doc(asadosCol, asadoId));

    // delete all existing asadoStandings
    const standingsSnap = await getDocs(standingsCol);
    for (const d of standingsSnap.docs) {
        batch.delete(d.ref);
    }

    // write new standings
    for (const [playerId, st] of standingsMap.entries()) {
        const ref = doc(standingsCol, playerId);
        batch.set(ref, {
            points: st.points,
            attended: st.attended,
            hosted: st.hosted,
            asador: st.asador,
            lastSeenAt: st.lastSeenAt,
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
}
