import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Futbolero</h1>
        <p className="mt-2 text-white/60">
          Ranking anual de fútbol 5: tabla, partidos y head-to-head.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/season/1"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950"
          >
            Ver tabla (Temporada 2026)
          </Link>
          <Link
            href="/admin/1"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
          >
            Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
