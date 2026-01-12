import PlayerProfileClient from "./PlayerProfileClient";

export default async function Page({
    params,
}: {
    params: Promise<{ seasonId: string; playerId: string }>;
}) {
    const { seasonId, playerId } = await params;
    return <PlayerProfileClient seasonId={seasonId} playerId={playerId} />;
}
