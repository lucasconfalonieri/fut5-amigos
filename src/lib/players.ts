import { db } from "@/lib/firebase";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

export type PlayerDoc = {
    id: string;
    name: string;
    nickname?: string;
    isActive: boolean;
    createdAt?: any;
};

export async function listPlayers(seasonId: string): Promise<PlayerDoc[]> {
    const ref = collection(db, "seasons", seasonId, "players");
    const q = query(ref, orderBy("createdAt", "asc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
            id: d.id,
            name: (data.name ?? "").toString(),
            nickname: data.nickname ? data.nickname.toString() : "",
            isActive: data.isActive !== false,
            createdAt: data.createdAt,
        };
    });
}

export async function addPlayer(seasonId: string, input: { name: string; nickname?: string }) {
    const ref = collection(db, "seasons", seasonId, "players");
    const name = input.name.trim();
    const nickname = (input.nickname ?? "").trim();

    if (!name) throw new Error("El nombre es obligatorio.");

    await addDoc(ref, {
        name,
        nickname: nickname || null,
        isActive: true,
        createdAt: serverTimestamp(),
    });
}

export async function setPlayerActive(seasonId: string, playerId: string, isActive: boolean) {
    const ref = doc(db, "seasons", seasonId, "players", playerId);
    await updateDoc(ref, { isActive });
}

export async function removePlayer(seasonId: string, playerId: string) {
    const ref = doc(db, "seasons", seasonId, "players", playerId);
    await deleteDoc(ref);
}
