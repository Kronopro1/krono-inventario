"use client"

type AlmacenResumen = {
  codigo_almacen: string
  almacen: string
  unidades: number
  costo_total: number
  valor_venta_total: number
  margen_potencial: number
}

export default function DashboardCharts({
  almacenes,
}: {
  almacenes: AlmacenResumen[]
}) {
  const data = almacenes.map((a) => ({
    codigo: a.codigo_almacen,
    almacen: a.almacen,
    unidades: Number(a.unidades ?? 0),
    costo: Number(a.costo_total ?? 0),
    venta: Number(a.valor_venta_total ?? 0),
    margen: Number(a.margen_potencial ?? 0),
  }))

  const maxCosto = Math.max(...data.map((item) => item.costo), 1)
  const totalCosto = data.reduce((sum, item) => sum + item.costo, 0)

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-950">
            Gráfico de valor por almacén
          </h2>
          <p className="text-sm text-slate-500">
            Comparativo visual del inventario valorizado por ubicación.
          </p>
        </div>

        <div className="space-y-6">
          {data.map((item) => {
            const porcentaje = Math.max((item.costo / maxCosto) * 100, 3)

            return (
              <div key={item.codigo}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.codigo}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.almacen} · {item.unidades} unidades
                    </p>
                  </div>

                  <p className="whitespace-nowrap font-bold text-slate-950">
                    S/ {item.costo.toFixed(2)}
                  </p>
                </div>

                <div className="h-5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                  <div
                    className="h-5 rounded-full bg-slate-950 transition-all"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between gap-4 text-xs text-slate-400">
                  <span>Venta: S/ {item.venta.toFixed(2)}</span>
                  <span>Margen: S/ {item.margen.toFixed(2)}</span>
                </div>
              </div>
            )
          })}

          {data.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              No hay información de almacenes disponible.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-950">
            Participación por almacén
          </h2>
          <p className="text-sm text-slate-500">
            Porcentaje del valor total del inventario.
          </p>
        </div>

        <div className="space-y-4">
          {data.map((item) => {
            const porcentaje =
              totalCosto > 0 ? (item.costo / totalCosto) * 100 : 0

            return (
              <div
                key={item.codigo}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.codigo}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.almacen}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-950">
                      {porcentaje.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500">
                      S/ {item.costo.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                  <div
                    className="h-3 rounded-full bg-slate-700 transition-all"
                    style={{ width: `${Math.max(porcentaje, 3)}%` }}
                  />
                </div>
              </div>
            )
          })}

          {data.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              No hay participación por almacén disponible.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}