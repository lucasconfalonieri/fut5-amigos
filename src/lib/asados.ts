import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    increment,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";

export async function createAsadoAndUpdateStandings(input: {
    seasonId: string;
    date: Date;
    venue?: string | null;
    presentPlayerIds: string[];
    hostPlayerId?: string | null;
    asadorPlayerId?: string | null;
    createdBy: string;
}) {
    const {
        seasonId,
        date,
        createdBy,
        hostPlayerId = null,
        asadorPlayerId = null,
    } = input;

    const venue = (input.venue ?? "").trim();
    const presentPlayerIds = Array.from(new Set(input.presentPlayerIds ?? [])).filter(Boolean);

    if (!presentPlayerIds.length) throw new Error("Tenés que marcar al menos 1 presente.");

    if (hostPlayerId && !presentPlayerIds.includes(hostPlayerId)) {
        throw new Error("El anfitrión debe estar dentro de los presentes.");
    }
    if (asadorPlayerId && !presentPlayerIds.includes(asadorPlayerId)) {
        throw new Error("El asador debe estar dentro de los presentes.");
    }

    const asadosCol = collection(db, "seasons", seasonId, "asados");

    const presentSet = new Set(presentPlayerIds);

    const impactedIds = Array.from(
        new Set([
            ...presentPlayerIds,
            ...(hostPlayerId ? [hostPlayerId] : []),
            ...(asadorPlayerId ? [asadorPlayerId] : []),
        ])
    );

    await runTransaction(db, async (tx) => {
        const stRefs = impactedIds.map((pid) =>
            doc(db, "seasons", seasonId, "asadoStandings", pid)
        );
        const stSnaps = await Promise.all(stRefs.map((ref) => tx.get(ref)));

        const snapById = new Map<string, (typeof stSnaps)[number]>();
        for (let i = 0; i < impactedIds.length; i++) {
            snapById.set(impactedIds[i], stSnaps[i]);
        }

        const asadoRef = doc(asadosCol);
        tx.set(asadoRef, {
            date,
            venue: venue || null,
            presentPlayerIds,
            hostPlayerId,
            asadorPlayerId,
            createdAt: serverTimestamp(),
            createdBy,
        });

        for (const pid of impactedIds) {
            const isPresent = presentSet.has(pid);
            const isHost = hostPlayerId === pid;
            const isAsador = asadorPlayerId === pid;

            const pointsDelta =
                (isPresent ? 1 : 0) + (isHost ? 1 : 0) + (isAsador ? 1 : 0);

            const attendedDelta = isPresent ? 1 : 0;

            const hostedDelta = isHost ? 1 : 0;
            const asadorDelta = isAsador ? 1 : 0;

            const stRef = doc(db, "seasons", seasonId, "asadoStandings", pid);
            const stSnap = snapById.get(pid);

            if (!stSnap || !stSnap.exists()) {
                tx.set(stRef, {
                    points: pointsDelta,
                    attended: attendedDelta,
                    hosted: hostedDelta,
                    asador: asadorDelta,
                    lastSeenAt: isPresent ? date : null,
                    updatedAt: serverTimestamp(),
                });
            } else {
                const updatePayload: any = {
                    points: increment(pointsDelta),
                    updatedAt: serverTimestamp(),
                };

                if (isPresent) {
                    updatePayload.attended = increment(attendedDelta);
                    updatePayload.lastSeenAt = date;
                }

                if (hostedDelta) updatePayload.hosted = increment(hostedDelta);
                if (asadorDelta) updatePayload.asador = increment(asadorDelta);

                tx.update(stRef, updatePayload);
            }
        }
    });
}
