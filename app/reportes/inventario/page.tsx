import { supabase } from "@/src/lib/supabase"
import ExportInventarioButton from "./ExportInventarioButton"

export const dynamic = "force-dynamic"

type InventarioItem = {
  sku: string
  producto: string
  stock_total: number
  costo_unitario: number
  precio_venta: number
  costo_total: number
  valor_venta_total: number
  margen_potencial: number
}

export default async function ReporteInventarioPage() {
  const { data } = await supabase.rpc(
    "obtener_inventario_total_publico"
  )

  const inventario = (data ?? []) as InventarioItem[]

  const costoTotal = inventario.reduce(
    (sum, item) => sum + Number(item.costo_total ?? 0),
    0
  )

  const valorVentaTotal = inventario.reduce(
    (sum, item) => sum + Number(item.valor_venta_total ?? 0),
    0
  )

  const margenTotal = inventario.reduce(
    (sum, item) => sum + Number(item.margen_potencial ?? 0),
    0
  )

  return (
    <main>
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Reportes
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Inventario valorizado
          </h1>

          <p className="mt-2 text-slate-500">
            Valor económico actual del inventario consolidado.
          </p>
        </div>

        <ExportInventarioButton inventario={inventario} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Costo total inventario
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            S/ {costoTotal.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Valor venta potencial
          </p>

          <h2 className="mt-3 text-3xl font-bold text-green-700">
            S/ {valorVentaTotal.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Margen potencial
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-700">
            S/ {margenTotal.toFixed(2)}
          </h2>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold">
            Detalle valorizado
          </h2>

          <p className="text-sm text-slate-500">
            Inventario consolidado por SKU.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Costo Unit.</th>
                <th className="px-4 py-3">Precio Venta</th>
                <th className="px-4 py-3">Costo Total</th>
                <th className="px-4 py-3">Venta Potencial</th>
                <th className="px-4 py-3">Margen</th>
              </tr>
            </thead>

            <tbody>
              {inventario.map((item) => (
                <tr
                  key={item.sku}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3 font-semibold">
                    {item.sku}
                  </td>

                  <td className="px-4 py-3">
                    {item.producto}
                  </td>

                  <td className="px-4 py-3 font-bold">
                    {item.stock_total}
                  </td>

                  <td className="px-4 py-3">
                    S/ {Number(item.costo_unitario).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    S/ {Number(item.precio_venta).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    S/ {Number(item.costo_total).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-green-700 font-semibold">
                    S/ {Number(item.valor_venta_total).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-blue-700 font-semibold">
                    S/ {Number(item.margen_potencial).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}