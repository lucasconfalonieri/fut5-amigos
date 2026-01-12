import { MatchDoc } from "@/lib/matchesRead";

type Outcome = "W" | "D" | "L";

function pts(r: Outcome) {
    if (r === "W") return 2;
    if (r === "D") return 1;
    return 0;
}

function outcomeForPlayer(match: MatchDoc, playerId: string): Outcome | null {
    const inA = match.teamA.includes(playerId);
    const inB = match.teamB.includes(playerId);
    if (!inA && !inB) return null;

    if (match.goalDiff === 0) return "D";
    const teamAWon = match.goalDiff > 0;
    const playerWon = inA ? teamAWon : !teamAWon;
    return playerWon ? "W" : "L";
}

export type SplitStats = {
    played: number;
    W: number;
    D: number;
    L: number;
    points: number;
    winrate: number;
};

function empty(): SplitStats {
    return { played: 0, W: 0, D: 0, L: 0, points: 0, winrate: 0 };
}

function addResult(s: SplitStats, r: Outcome) {
    s.played += 1;
    if (r === "W") s.W += 1;
    else if (r === "D") s.D += 1;
    else s.L += 1;

    s.points += pts(r);
    s.winrate = s.played ? s.W / s.played : 0;
}

export function computePlayerProfileStats(matches: MatchDoc[], playerId: string) {
    const all = empty();
    const smoked = empty();
    const sober = empty();

    const playedMatches = matches
        .filter((m) => m.teamA.includes(playerId) || m.teamB.includes(playerId))
        .slice()
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    for (const m of playedMatches) {
        const res = outcomeForPlayer(m, playerId);
        if (!res) continue;

        addResult(all, res);

        const smokedSet = new Set(m.smokedPlayerIds ?? []);
        if (smokedSet.has(playerId)) addResult(smoked, res);
        else addResult(sober, res);
    }

    const last10 = playedMatches
        .slice(0, 10)
        .map((m) => outcomeForPlayer(m, playerId))
        .filter(Boolean) as Outcome[];

    let streakCount = 0;
    let streakOutcome: Outcome | null = null;
    for (const r of last10) {
        if (!streakOutcome) {
            streakOutcome = r;
            streakCount = 1;
        } else if (r === streakOutcome) {
            streakCount += 1;
        } else {
            break;
        }
    }

    const smokedRate = all.played ? smoked.played / all.played : 0;

    return {
        all,
        smoked,
        sober,
        smokedRate,
        last10,
        streak: { outcome: streakOutcome, count: streakCount },
        recentMatches: playedMatches.slice(0, 20),
    };
}

export function outcomeLabelES(r: Outcome) {
    if (r === "W") return "G";
    if (r === "D") return "E";
    return "P";
}

export function streakLabelES(outcome: Outcome | null, count: number) {
    if (!outcome || count <= 0) return "—";
    if (outcome === "W") return `${count} ganados`;
    if (outcome === "D") return `${count} empatados`;
    return `${count} perdidos`;
}
