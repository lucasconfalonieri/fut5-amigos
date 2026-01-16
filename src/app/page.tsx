import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* HERO */}
        <div className="card-solid relative overflow-hidden rounded-3xl p-7 sm:p-10">
          {/* glows */}
          <div className="pointer-events-none absolute -top-32 -right-28 h-80 w-80 rounded-full bg-emerald-500/18 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 -left-28 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.10] [background:radial-gradient(700px_350px_at_50%_0%,rgba(16,185,129,0.45),transparent_60%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            {/* copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Temporada 2026
              </div>

              <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold tracking-tight">
                Futbolero <span className="text-emerald-200">al fin</span>
              </h1>

              <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/70">
                Ranking con amigos: posiciones, historial de partidos, head-to-head y perfiles.
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/season/1?tab=table"
                  className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm sm:text-base font-extrabold text-zinc-950 hover:bg-emerald-300"
                >
                  Ver temporada 2026 →
                </Link>

                <button
                  type="button"
                  disabled
                  className="rounded-2xl border border-white/10 bg-zinc-950 px-5 py-3 text-sm sm:text-base font-semibold text-white/70 opacity-70 cursor-not-allowed"
                  title="Próximamente"
                >
                  Prode
                  <span className="ml-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    Próximamente
                  </span>
                </button>

                <Link
                  href="/admin/1"
                  className="sm:ml-auto text-xs sm:text-sm font-medium text-white/45 hover:text-emerald-200"
                >
                  Admin
                </Link>
              </div>
            </div>

            {/* side card (feature highlight) */}
            <div className="card-solid rounded-3xl p-6">
              <div className="text-xs font-semibold text-emerald-200/90">Lo nuevo</div>
              <div className="mt-2 text-2xl font-extrabold tracking-tight">Asado League 🥩</div>
              <p className="mt-2 text-sm text-white/60">
                Puntos por presencia + bonus por anfitrión y asador. Historial completo por fecha.
              </p>

              <div className="mt-5 grid gap-2">
                <Link
                  href="/season/1?tab=asados"
                  className="ml-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[14px] font-semibold text-emerald-200"
                >
                  Entrar a la tabla
                  <span className="text-white/60">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <section className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/season/1?tab=table"
            className="card-solid group rounded-3xl p-6 hover:border-emerald-500/30"
          >
            <div className="text-xs font-semibold text-emerald-200/90">Principal</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Tabla</h2>
            <p className="mt-2 text-sm text-white/60">Posiciones, rachas y últimos resultados.</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-semibold text-white/70 group-hover:text-white">
              Ir <span className="text-white/50">→</span>
            </div>
          </Link>

          <Link
            href="/season/1?tab=matches"
            className="card-solid group rounded-3xl p-6 hover:border-emerald-500/30"
          >
            <div className="text-xs font-semibold text-emerald-200/90">Explorar</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Partidos</h2>
            <p className="mt-2 text-sm text-white/60">Historial por fecha + filtros y cancha.</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-semibold text-white/70 group-hover:text-white">
              Ir <span className="text-white/50">→</span>
            </div>
          </Link>

          <Link
            href="/season/1?tab=h2h"
            className="card-solid group rounded-3xl p-6 hover:border-emerald-500/30"
          >
            <div className="text-xs font-semibold text-emerald-200/90">Comparar</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Head-to-head</h2>
            <p className="mt-2 text-sm text-white/60">Vs y jugando juntos (últimos cruces).</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-semibold text-white/70 group-hover:text-white">
              Ir <span className="text-white/50">→</span>
            </div>
          </Link>

          <Link
            href="/season/1/players"
            className="card-solid group rounded-3xl p-6 hover:border-emerald-500/30"
          >
            <div className="text-xs font-semibold text-emerald-200/90">Perfiles</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Jugadores</h2>
            <p className="mt-2 text-sm text-white/60">Entrá al perfil y mirá estadísticas.</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-semibold text-white/70 group-hover:text-white">
              Ir <span className="text-white/50">→</span>
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
