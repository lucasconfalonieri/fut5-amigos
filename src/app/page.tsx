import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="card-solid relative overflow-hidden rounded-3xl p-7 sm:p-10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Temporada 2026
            </div>

            <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold tracking-tight">
              Futbolero al fin
            </h1>

            <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/70">
              Ranking anual con amigos: posiciones, historial de partidos y head-to-head.
              Todo en un solo lugar, simple y rápido.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/season/1?tab=table"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm sm:text-base font-extrabold text-zinc-950 hover:bg-emerald-300"
              >
                Ver tabla (Temporada 2026)
              </Link>

              <button
                type="button"
                disabled
                className="rounded-2xl border border-emerald-500/25 bg-zinc-950 px-5 py-3 text-sm sm:text-base font-semibold text-white/70 opacity-70 cursor-not-allowed"
                title="Próximamente"
              >
                Prode <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">Próximamente</span>
              </button>

              <Link
                href="/admin/1"
                className="ml-auto text-xs sm:text-sm font-medium text-white/50 hover:text-emerald-200"
              >
                Admin →
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <Link
            href="/season/1?tab=table"
            className="card-solid group rounded-3xl p-6 hover:border-emerald-500/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-emerald-200/90">Principal</div>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Tabla</h2>
                <p className="mt-2 text-sm text-white/60">
                  Posiciones, rachas y últimos resultados.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-semibold text-white/70 group-hover:text-white">
                Ir →
              </div>
            </div>
          </Link>

          <Link
            href="/season/1?tab=matches"
            className="card-solid group rounded-3xl p-6 hover:border-emerald-500/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-emerald-200/90">Explorar</div>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Partidos</h2>
                <p className="mt-2 text-sm text-white/60">
                  Historial por fecha + filtros.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-semibold text-white/70 group-hover:text-white">
                Ir →
              </div>
            </div>

            <div className="mt-4 text-xs text-white/45">
              Tip: una vez dentro, tocá la pestaña “Partidos”.
            </div>
          </Link>

          <Link
            href="/season/1?tab=h2h"
            className="card-solid group rounded-3xl p-6 hover:border-emerald-500/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-emerald-200/90">Comparar</div>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Head-to-head</h2>
                <p className="mt-2 text-sm text-white/60">
                  Vs y jugando juntos (resumen + últimos cruces).
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-semibold text-white/70 group-hover:text-white">
                Ir →
              </div>
            </div>

            <div className="mt-4 text-xs text-white/45">
              Tip: dentro, elegí dos jugadores.
            </div>
          </Link>
        </section>

        <footer className="mt-8 text-center text-xs text-white/40">
          Futbolero · Temporada 2026 ⚽
        </footer>
      </div>
    </main>
  );
}
