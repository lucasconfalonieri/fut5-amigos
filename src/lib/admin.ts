import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function isSeasonAdmin(seasonId: string, uid: string) {
    const ref = doc(db, "seasons", seasonId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const admins = (snap.data().admins ?? []) as string[];
    return admins.includes(uid);
}
