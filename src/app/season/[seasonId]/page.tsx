import SeasonClient from "./SeasonClient";

export default async function Page({
    params,
}: {
    params: Promise<{ seasonId: string }>;
}) {
    const { seasonId } = await params;
    return <SeasonClient seasonId={seasonId} />;
}
