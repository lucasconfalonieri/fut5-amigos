import { MatchDoc } from "@/lib/matchesRead";

type Result = "W" | "D" | "L";

function resultForTeam(goalDiff: number, team: "A" | "B"): Result {
    if (goalDiff === 0) return "D";
    const aWon = goalDiff > 0;
    if (team === "A") return aWon ? "W" : "L";
    return aWon ? "L" : "W";
}

function pointsFor(result: Result) {
    if (result === "W") return 2;
    if (result === "D") return 1;
    return 0;
}

function toChip(r: Result) {
    return r;
}

export function computeHeadToHead(matches: MatchDoc[], aId: string, bId: string) {
    const versus = matches
        .filter((m) => {
            const aInA = m.teamA.includes(aId);
            const aInB = m.teamB.includes(aId);
            const bInA = m.teamA.includes(bId);
            const bInB = m.teamB.includes(bId);
            const aIn = aInA || aInB;
            const bIn = bInA || bInB;
            if (!aIn || !bIn) return false;
            return (aInA && bInB) || (aInB && bInA);
        })
        .map((m) => {
            const aTeam = m.teamA.includes(aId) ? "A" : "B";
            const r = resultForTeam(m.goalDiff, aTeam);
            return { match: m, resultA: r, pointsA: pointsFor(r) };
        });

    const together = matches
        .filter((m) => {
            const bothInA = m.teamA.includes(aId) && m.teamA.includes(bId);
            const bothInB = m.teamB.includes(aId) && m.teamB.includes(bId);
            return bothInA || bothInB;
        })
        .map((m) => {
            const team = m.teamA.includes(aId) ? "A" : "B";
            const r = resultForTeam(m.goalDiff, team);
            return { match: m, resultTeam: r, pointsTeam: pointsFor(r) };
        });

    const agg = (arr: { resultA?: Result; resultTeam?: Result; pointsA?: number; pointsTeam?: number }[], mode: "A" | "T") => {
        let W = 0, D = 0, L = 0, pts = 0;
        const last = arr.slice(0, 10).map((x) => (mode === "A" ? toChip(x.resultA!) : toChip(x.resultTeam!)));

        for (const x of arr) {
            const r = mode === "A" ? x.resultA! : x.resultTeam!;
            if (r === "W") W++;
            else if (r === "D") D++;
            else L++;
            pts += mode === "A" ? (x.pointsA ?? 0) : (x.pointsTeam ?? 0);
        }

        return { played: arr.length, W, D, L, points: pts, last10: last.join(" ") };
    };

    return {
        versus: {
            list: versus,
            stats: agg(versus, "A"),
        },
        together: {
            list: together,
            stats: agg(together, "T"),
        },
    };
}
