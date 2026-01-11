"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User, signInWithEmailAndPassword } from "firebase/auth";
import { isSeasonAdmin } from "@/lib/admin";
import { addPlayer, listPlayers, PlayerDoc, removePlayer, setPlayerActive } from "@/lib/players";
import { createMatchAndUpdateStandings } from "@/lib/matches";

export default function AdminClient({ seasonId }: { seasonId: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [players, setPlayers] = useState<PlayerDoc[]>([]);
    const [pLoading, setPLoading] = useState(false);
    const [pErr, setPErr] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const loginWithEmail = async () => {
        setError(null);
        setLoginLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (e: any) {
            setError(e?.message ?? "Error iniciando sesión con email");
        } finally {
            setLoginLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setError(null);
        setLoginLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (e: any) {
            setError(e?.message ?? "Error iniciando sesión con Google");
        } finally {
            setLoginLoading(false);
        }
    };


    const [matchDate, setMatchDate] = useState<string>(() => {
        const d = new Date();
        d.setHours(21, 0, 0, 0);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    });

    type Winner = "A" | "D" | "B";
    const [winner, setWinner] = useState<Winner>("D");
    const [goalDiffAbs, setGoalDiffAbs] = useState<number>(0);

    const [teamA, setTeamA] = useState<string[]>(Array(5).fill(""));
    const [teamB, setTeamB] = useState<string[]>(Array(5).fill(""));

    const [smokedA, setSmokedA] = useState<boolean[]>(Array(5).fill(false));
    const [smokedB, setSmokedB] = useState<boolean[]>(Array(5).fill(false));

    const [mLoading, setMLoading] = useState(false);
    const [mErr, setMErr] = useState<string | null>(null);
    const [mOk, setMOk] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            setError(null);

            if (!u) {
                setIsAdmin(null);
                return;
            }

            try {
                const ok = await isSeasonAdmin(seasonId, u.uid);
                setIsAdmin(ok);
                if (!ok) setError("No tenés permisos de admin para esta temporada.");
            } catch (e: any) {
                setError(e?.message ?? "Error validando permisos");
            }
        });

        return () => unsub();
    }, [seasonId]);

    const logout = async () => {
        await signOut(auth);
    };

    const refreshPlayers = async () => {
        setPErr(null);
        setPLoading(true);
        try {
            const data = await listPlayers(seasonId);
            setPlayers(data);
        } catch (e: any) {
            setPErr(e?.message ?? "Error cargando jugadores");
        } finally {
            setPLoading(false);
        }
    };

    useEffect(() => {
        if (user && isAdmin) refreshPlayers();
    }, [user, isAdmin]);

    const activeCount = useMemo(() => players.filter((p) => p.isActive).length, [players]);

    const activePlayers = useMemo(() => players.filter((p) => p.isActive), [players]);

    const usedIds = useMemo(() => {
        const ids = [...teamA, ...teamB].filter(Boolean);
        return new Set(ids);
    }, [teamA, teamB]);

    const onAdd = async () => {
        setPErr(null);
        try {
            await addPlayer(seasonId, { name, nickname });
            setName("");
            setNickname("");
            await refreshPlayers();
        } catch (e: any) {
            setPErr(e?.message ?? "Error agregando jugador");
        }
    };

    const onToggle = async (playerId: string, next: boolean) => {
        setPErr(null);
        setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, isActive: next } : p)));
        try {
            await setPlayerActive(seasonId, playerId, next);
        } catch (e: any) {
            setPErr(e?.message ?? "Error actualizando jugador");
            await refreshPlayers();
        }
    };

    const onDelete = async (playerId: string) => {
        setPErr(null);
        const ok = confirm("¿Eliminar jugador? (si ya tiene partidos cargados, no conviene)");
        if (!ok) return;

        try {
            await removePlayer(seasonId, playerId);
            await refreshPlayers();
        } catch (e: any) {
            setPErr(e?.message ?? "Error eliminando jugador");
        }
    };

    function setTeamSlot(which: "A" | "B", idx: number, playerId: string) {
        setMOk(null);
        setMErr(null);

        if (which === "A") {
            setTeamA((prev) => {
                const next = [...prev];
                next[idx] = playerId;
                return next;
            });
            if (!playerId) setSmokedA((prev) => prev.map((v, i) => (i === idx ? false : v)));
        } else {
            setTeamB((prev) => {
                const next = [...prev];
                next[idx] = playerId;
                return next;
            });
            if (!playerId) setSmokedB((prev) => prev.map((v, i) => (i === idx ? false : v)));
        }
    }

    function optionsFor(which: "A" | "B", idx: number) {
        const current = which === "A" ? teamA[idx] : teamB[idx];

        return activePlayers.filter((p) => {
            if (p.id === current) return true;
            return !usedIds.has(p.id);
        });
    }

    const canSubmitMatch = useMemo(() => {
        const aOk = teamA.every(Boolean) && new Set(teamA).size === 5;
        const bOk = teamB.every(Boolean) && new Set(teamB).size === 5;
        const disjoint = new Set([...teamA, ...teamB]).size === 10;
        return aOk && bOk && disjoint && !!matchDate;
    }, [teamA, teamB, matchDate]);

    const computedGoalDiff = useMemo(() => {
        const d = Math.max(0, Number(goalDiffAbs) || 0);
        if (winner === "D") return 0;
        return winner === "A" ? d : -d;
    }, [winner, goalDiffAbs]);

    const submitMatch = async () => {
        setMErr(null);
        setMOk(null);

        if (!user) return setMErr("Tenés que estar logueado.");
        if (!canSubmitMatch) return setMErr("Completá ambos equipos (5 y 5) sin repetidos.");
        if (winner !== "D" && (Number(goalDiffAbs) || 0) <= 0) {
            return setMErr("Si hay ganador, la diferencia debe ser mayor a 0.");
        }

        try {
            setMLoading(true);
            const date = new Date(matchDate);
            const smokedPlayerIds = [
                ...teamA.filter((id, i) => id && smokedA[i]),
                ...teamB.filter((id, i) => id && smokedB[i]),
            ];
            await createMatchAndUpdateStandings({
                seasonId,
                date,
                teamA,
                teamB,
                goalDiff: computedGoalDiff,
                createdBy: user.uid,
                smokedPlayerIds,
            });

            setMOk("Partido cargado ✅");
            setTeamA(Array(5).fill(""));
            setTeamB(Array(5).fill(""));
            setWinner("D");
            setGoalDiffAbs(0);
            setSmokedA(Array(5).fill(false));
            setSmokedB(Array(5).fill(false));
        } catch (e: any) {
            setMErr(e?.message ?? "Error cargando partido");
        } finally {
            setMLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-transparent text-white">
            <div className="mx-auto max-w-4xl px-4 py-10">
                {!user ? (
                    <div className="mx-auto max-w-md">
                        <div className="card-solid rounded-3xl p-6 sm:p-8">
                            <div className="text-center">
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    Admin
                                </h1>
                                <p className="mt-2 text-lg sm:text-xl text-white/70">
                                    Temporada <span className="text-white/90 font-semibold">2026</span>
                                </p>
                            </div>

                            {error && (
                                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                                    {error}
                                </div>
                            )}

                            {/* Email / Password */}
                            <div className="mt-6 space-y-3">
                                <div>
                                    <label className="mb-1 block text-xs text-white/60">Email</label>
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        type="email"
                                        placeholder="tuemail@gmail.com"
                                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs text-white/60">Contraseña</label>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                    />
                                </div>

                                <button
                                    onClick={loginWithEmail}
                                    disabled={loginLoading || !email || !password}
                                    className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white/90 disabled:opacity-40"
                                >
                                    {loginLoading ? "Iniciando..." : "Iniciar sesión"}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="my-6 flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="text-xs text-white/50">o</span>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>

                            {/* Google */}
                            <button
                                onClick={loginWithGoogle}
                                disabled={loginLoading}
                                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm font-semibold hover:border-emerald-500/30 hover:bg-zinc-900 disabled:opacity-40"
                            >
                                Iniciar sesión con Google
                            </button>

                            <p className="mt-4 text-xs text-white/45 text-center">
                                Solo los administradores pueden cargar partidos y jugadores.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Tu header actual (logueado) */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold">Admin</h1>
                                <p className="text-sm text-white/60">Temporada: 2026</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-white/60">{user.email}</span>
                                <button
                                    onClick={logout}
                                    className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm hover:border-emerald-500/30 hover:bg-zinc-900"
                                >
                                    Salir
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                                {error}
                            </div>
                        )}

                        {/* El resto de tu admin (jugadores / cargar partido) tal cual */}
                        {isAdmin && (
                            <div className="mt-6 space-y-4">
                                <details className="card-solid rounded-2xl" open={false}>
                                    <summary className="cursor-pointer select-none list-none px-4 py-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-semibold">1) Jugadores</h2>
                                                <p className="text-sm text-white/60">
                                                    Activos: <span className="font-semibold text-white/80">{activeCount}</span>
                                                    {" · "}
                                                    Total: <span className="font-semibold text-white/80">{players.length}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        refreshPlayers();
                                                    }}
                                                    className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm hover:border-emerald-500/30 hover:bg-zinc-900"
                                                    disabled={pLoading}
                                                >
                                                    {pLoading ? "Actualizando..." : "Refrescar"}
                                                </button>

                                                <span className="text-xs text-white/50">▼</span>
                                            </div>
                                        </div>
                                    </summary>

                                    <div className="px-4 pb-4">
                                        {pErr && (
                                            <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                                                {pErr}
                                            </div>
                                        )}

                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Nombre (obligatorio)"
                                                className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                            />
                                            <input
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value)}
                                                placeholder="Apodo (opcional)"
                                                className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                            />
                                            <button
                                                onClick={onAdd}
                                                className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-white/90"
                                            >
                                                Agregar
                                            </button>
                                        </div>

                                        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                                            <table className="w-full text-sm">
                                                <thead className="bg-emerald-500/10 text-left text-xs uppercase tracking-wide text-white/70">
                                                    <tr>
                                                        <th className="px-3 py-3">Jugador</th>
                                                        <th className="px-3 py-3">Activo</th>
                                                        <th className="px-3 py-3 text-right">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {players.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={3} className="px-3 py-6 text-white/60">
                                                                No hay jugadores todavía.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        players.map((p) => (
                                                            <tr key={p.id} className="border-t border-white/5 hover:bg-white/5">
                                                                <td className="px-3 py-3">
                                                                    <div className="font-medium">{p.nickname?.trim() || p.name}</div>
                                                                    <div className="text-xs text-white/50">{p.name}</div>
                                                                </td>

                                                                <td className="px-3 py-3">
                                                                    <label className="inline-flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={p.isActive}
                                                                            onChange={(e) => onToggle(p.id, e.target.checked)}
                                                                        />
                                                                        <span className="text-xs text-white/60">{p.isActive ? "Sí" : "No"}</span>
                                                                    </label>
                                                                </td>

                                                                <td className="px-3 py-3 text-right">
                                                                    <button
                                                                        onClick={() => onDelete(p.id)}
                                                                        className="rounded-full border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs hover:border-red-500/30 hover:bg-zinc-900"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </details>

                                <div className="card-solid rounded-2xl p-4">
                                    <h2 className="text-lg font-semibold">2) Cargar partido (5v5)</h2>
                                    <p className="text-sm text-white/60">
                                        Guardá fecha, equipos y diferencia de gol. La tabla se actualiza automáticamente.
                                    </p>

                                    {(mErr || mOk) && (
                                        <div
                                            className={[
                                                "mt-4 rounded-xl border p-3 text-sm",
                                                mErr
                                                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
                                            ].join(" ")}
                                        >
                                            {mErr ?? mOk}
                                        </div>
                                    )}

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-xs text-white/60">Fecha y hora</label>
                                            <input
                                                type="datetime-local"
                                                value={matchDate}
                                                onChange={(e) => setMatchDate(e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-white/60">Resultado</label>
                                            <select
                                                value={winner}
                                                onChange={(e) => {
                                                    const v = e.target.value as Winner;
                                                    setWinner(v);
                                                    if (v === "D") setGoalDiffAbs(0);
                                                }}
                                                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                            >
                                                <option value="A">Gana Team A</option>
                                                <option value="D">Empate</option>
                                                <option value="B">Gana Team B</option>
                                            </select>

                                            <label className="mb-1 mt-3 block text-xs text-white/60">Diferencia</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={goalDiffAbs}
                                                disabled={winner === "D"}
                                                onChange={(e) => setGoalDiffAbs(Number(e.target.value))}
                                                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                            />

                                            <p className="mt-1 text-xs text-white/40">
                                                {winner === "D"
                                                    ? "Empate: diferencia 0"
                                                    : `Diferencia positiva. Se guarda como ${computedGoalDiff} (A-B)`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                                        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="font-semibold">Equipo A</h3>
                                                <span className="text-xs text-white/50">5 jugadores</span>
                                            </div>

                                            <div className="space-y-2">
                                                {teamA.map((val, idx) => (
                                                    <div key={`A-${idx}`} className="flex items-center gap-3">
                                                        <select
                                                            value={val}
                                                            onChange={(e) => setTeamSlot("A", idx, e.target.value)}
                                                            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                                        >
                                                            <option value="">Elegir jugador {idx + 1}</option>
                                                            {optionsFor("A", idx).map((p) => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.nickname?.trim() || p.name}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <label className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white/70">
                                                            <input
                                                                type="checkbox"
                                                                checked={smokedA[idx]}
                                                                disabled={!val}
                                                                onChange={(e) =>
                                                                    setSmokedA((prev) => prev.map((v, i) => (i === idx ? e.target.checked : v)))
                                                                }
                                                            />
                                                            <span>Fumó 🚬</span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="font-semibold">Equipo B</h3>
                                                <span className="text-xs text-white/50">5 jugadores</span>
                                            </div>

                                            <div className="space-y-2">
                                                {teamB.map((val, idx) => (
                                                    <div key={`B-${idx}`} className="flex items-center gap-3">
                                                        <select
                                                            value={val}
                                                            onChange={(e) => setTeamSlot("B", idx, e.target.value)}
                                                            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500/30"
                                                        >
                                                            <option value="">Elegir jugador {idx + 1}</option>
                                                            {optionsFor("B", idx).map((p) => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.nickname?.trim() || p.name}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <label className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white/70">
                                                            <input
                                                                type="checkbox"
                                                                checked={smokedB[idx]}
                                                                disabled={!val}
                                                                onChange={(e) =>
                                                                    setSmokedB((prev) => prev.map((v, i) => (i === idx ? e.target.checked : v)))
                                                                }
                                                            />
                                                            <span>Fumó 🚬</span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <div className="text-xs text-white/50">
                                            Activos disponibles:{" "}
                                            <span className="font-semibold text-white/80">{activePlayers.length}</span>
                                            {!canSubmitMatch && (
                                                <span className="ml-2 text-white/40">— completá 5 y 5 sin repetidos</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={submitMatch}
                                            disabled={!canSubmitMatch || mLoading}
                                            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-40"
                                        >
                                            {mLoading ? "Guardando..." : "Guardar partido"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );

}
