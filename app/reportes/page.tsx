import Link from "next/link"

export default function ReportesPage() {
  return (
    <main>
      <section className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Business Intelligence
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Centro de reportes
        </h1>

        <p className="mt-2 text-slate-500">
          Consulta indicadores, inventario, ventas y análisis comercial.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/reportes/inventario"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          <h2 className="text-xl font-bold">📦 Inventario</h2>
          <p className="mt-2 text-sm text-slate-500">
            Inventario valorizado y stock consolidado.
          </p>
          <p className="mt-6 text-sm font-semibold text-slate-900">
            Ver reporte →
          </p>
        </Link>

        <Link
          href="/reportes/ventas"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          <h2 className="text-xl font-bold">📈 Ventas</h2>
          <p className="mt-2 text-sm text-slate-500">
            Órdenes, productos vendidos y desempeño comercial.
          </p>
          <p className="mt-6 text-sm font-semibold text-slate-900">
            Ver reporte →
          </p>
        </Link>

        <Link
          href="/reportes/kardex"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          <h2 className="text-xl font-bold">🔄 Kardex</h2>
          <p className="mt-2 text-sm text-slate-500">
            Historial completo de movimientos.
          </p>
          <p className="mt-6 text-sm font-semibold text-slate-900">
            Ver reporte →
          </p>
        </Link>

        <Link
          href="/reportes/ranking"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          <h2 className="text-xl font-bold">🏆 Ranking</h2>
          <p className="mt-2 text-sm text-slate-500">
            Productos, combos y canales líderes.
          </p>
          <p className="mt-6 text-sm font-semibold text-slate-900">
            Ver reporte →
          </p>
        </Link>

        <Link
          href="/reportes/alertas"
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          <h2 className="text-xl font-bold">⚠ Alertas</h2>
          <p className="mt-2 text-sm text-slate-500">
            Productos críticos y bajo mínimo.
          </p>
          <p className="mt-6 text-sm font-semibold text-slate-900">
            Ver reporte →
          </p>
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">📥 Exportaciones</h2>
          <p className="mt-2 text-sm text-slate-500">
            Descarga reportes en Excel y CSV.
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Próximamente
          </p>
        </div>
      </section>
    </main>
  )
}