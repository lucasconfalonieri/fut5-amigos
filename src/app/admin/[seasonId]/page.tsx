import AdminClient from "./AdminClient";

export default async function Page({
    params,
}: {
    params: Promise<{ seasonId: string }>;
}) {
    const { seasonId } = await params;
    return <AdminClient seasonId={seasonId} />;
}
