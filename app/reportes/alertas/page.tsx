import { supabase } from "@/src/lib/supabase"

export const dynamic = "force-dynamic"

type AlertaStock = {
  sku: string
  producto: string
  codigo_almacen: string
  stock_actual: number
  stock_minimo: number
  estado: string
}

function estadoClase(estado: string) {
  if (estado === "CRITICO") {
    return "bg-red-50 text-red-700 ring-red-200"
  }

  if (estado === "BAJO") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200"
  }

  return "bg-green-50 text-green-700 ring-green-200"
}

export default async function ReporteAlertasPage() {
  const { data } = await supabase.rpc("obtener_alertas_stock_publico")

  const alertas = (data ?? []) as AlertaStock[]

  const criticos = alertas.filter((item) => item.estado === "CRITICO").length
  const bajos = alertas.filter((item) => item.estado === "BAJO").length

  return (
    <main>
      <section className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Reportes
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Alertas de stock
        </h1>

        <p className="mt-2 text-slate-500">
          Productos críticos o por debajo del stock mínimo por almacén.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Alertas totales</p>
          <h2 className="mt-3 text-3xl font-bold">
            {alertas.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Críticos</p>
          <h2 className="mt-3 text-3xl font-bold text-red-700">
            {criticos}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Stock bajo</p>
          <h2 className="mt-3 text-3xl font-bold text-yellow-700">
            {bajos}
          </h2>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold">
            Detalle de alertas
          </h2>

          <p className="text-sm text-slate-500">
            Revisa qué productos necesitan reposición.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Almacén</th>
                <th className="px-4 py-3">Stock actual</th>
                <th className="px-4 py-3">Stock mínimo</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              {alertas.map((item, index) => (
                <tr
                  key={`${item.sku}-${item.codigo_almacen}-${index}`}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3 font-semibold">
                    {item.sku}
                  </td>

                  <td className="px-4 py-3">
                    {item.producto}
                  </td>

                  <td className="px-4 py-3">
                    {item.codigo_almacen}
                  </td>

                  <td className="px-4 py-3 font-bold">
                    {item.stock_actual}
                  </td>

                  <td className="px-4 py-3">
                    {item.stock_minimo}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${estadoClase(
                        item.estado
                      )}`}
                    >
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}

              {alertas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No hay productos críticos ni con stock bajo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}