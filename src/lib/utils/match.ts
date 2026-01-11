export function resultLabel(goalDiff: number) {
    if (goalDiff > 0) return { label: `Gana A por ${goalDiff}`, tone: "winA" as const };
    if (goalDiff < 0) return { label: `Gana B por ${Math.abs(goalDiff)}`, tone: "winB" as const };
    return { label: "Empate", tone: "draw" as const };
}
