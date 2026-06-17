import { supabase } from "@/src/lib/supabase"

export const dynamic = "force-dynamic"

type DashboardComercial = {
  total_ordenes: number
  unidades_vendidas: number
  productos_distintos: number
  combos_vendidos: number
}

type TopProducto = {
  sku: string
  nombre: string
  es_combo: boolean
  unidades_vendidas: number
}

type VentaEmpresa = {
  empresa: string
  total_ordenes: number
  unidades_vendidas: number
}

export default async function ReporteVentasPage() {
  const { data: dashboardData } = await supabase.rpc(
    "obtener_dashboard_comercial_publico"
  )

  const { data: topProductosData } = await supabase.rpc(
    "obtener_top_productos_publico"
  )

  const { data: ventasEmpresaData } = await supabase.rpc(
    "obtener_ventas_por_empresa_publico"
  )

  const dashboard = dashboardData?.[0] as DashboardComercial
  const topProductos = (topProductosData ?? []) as TopProducto[]
  const ventasEmpresa = (ventasEmpresaData ?? []) as VentaEmpresa[]

  return (
    <main>
      <section className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Reportes
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Ventas comerciales
        </h1>

        <p className="mt-2 text-slate-500">
          Resumen de órdenes, empresas, productos vendidos y desempeño comercial.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Órdenes</p>
          <h2 className="mt-3 text-3xl font-bold">
            {dashboard?.total_ordenes ?? 0}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Unidades vendidas</p>
          <h2 className="mt-3 text-3xl font-bold">
            {dashboard?.unidades_vendidas ?? 0}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Productos vendidos</p>
          <h2 className="mt-3 text-3xl font-bold">
            {dashboard?.productos_distintos ?? 0}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Combos vendidos</p>
          <h2 className="mt-3 text-3xl font-bold">
            {dashboard?.combos_vendidos ?? 0}
          </h2>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold">
              Ventas por empresa
            </h2>

            <p className="text-sm text-slate-500">
              Órdenes y unidades vendidas por empresa vendedora.
            </p>
          </div>

          <div className="space-y-3">
            {ventasEmpresa.map((item) => (
              <div
                key={item.empresa}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.empresa}
                  </p>

                  <p className="text-xs text-slate-500">
                    {item.total_ordenes} órdenes
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-950">
                    {item.unidades_vendidas}
                  </p>

                  <p className="text-xs text-slate-500">
                    unidades
                  </p>
                </div>
              </div>
            ))}

            {ventasEmpresa.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No hay ventas por empresa registradas.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold">
              Resumen por empresa
            </h2>

            <p className="text-sm text-slate-500">
              Participación operativa según unidades vendidas.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Órdenes</th>
                  <th className="px-4 py-3">Unidades</th>
                </tr>
              </thead>

              <tbody>
                {ventasEmpresa.map((item) => (
                  <tr key={item.empresa} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold">
                      {item.empresa}
                    </td>

                    <td className="px-4 py-3">
                      {item.total_ordenes}
                    </td>

                    <td className="px-4 py-3 font-bold">
                      {item.unidades_vendidas}
                    </td>
                  </tr>
                ))}

                {ventasEmpresa.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No existen ventas por empresa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold">
            Top productos vendidos
          </h2>

          <p className="text-sm text-slate-500">
            Ranking por unidades vendidas.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Ranking</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Unidades</th>
              </tr>
            </thead>

            <tbody>
              {topProductos.map((item, index) => (
                <tr
                  key={item.sku}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3 font-bold">
                    #{index + 1}
                  </td>

                  <td className="px-4 py-3">
                    {item.sku}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {item.nombre}
                  </td>

                  <td className="px-4 py-3">
                    {item.es_combo ? "Combo" : "Producto"}
                  </td>

                  <td className="px-4 py-3 font-bold">
                    {item.unidades_vendidas}
                  </td>
                </tr>
              ))}

              {topProductos.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No existen ventas registradas.
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