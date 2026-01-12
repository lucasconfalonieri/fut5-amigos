import PlayersClient from "./PlayersClient";

export default async function Page({ params }: { params: Promise<{ seasonId: string }> }) {
    const { seasonId } = await params;
    return <PlayersClient seasonId={seasonId} />;
}
