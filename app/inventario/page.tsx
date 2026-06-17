import { supabase } from "@/src/lib/supabase"
import InventarioTable from "./InventarioTable"

export const dynamic = "force-dynamic"

type InventarioTotalItem = {
  sku: string
  producto: string
  stock_total: number
  costo_unitario: number
  costo_total: number
}

type InventarioAlmacenItem = {
  sku: string
  producto: string
  codigo_almacen: string
  almacen: string
  stock_actual: number
  stock_minimo: number
}

export default async function InventarioPage() {
  const { data: inventarioTotalData } = await supabase.rpc(
    "obtener_inventario_total_publico"
  )

  const { data: inventarioAlmacenData } = await supabase.rpc(
    "obtener_inventario_publico"
  )

  const inventarioTotal =
    (inventarioTotalData ?? []) as InventarioTotalItem[]

  const inventarioAlmacen =
    (inventarioAlmacenData ?? []) as InventarioAlmacenItem[]

  const costoTotalInventario = inventarioTotal.reduce(
    (sum: number, item: InventarioTotalItem) =>
      sum + Number(item.costo_total ?? 0),
    0
  )

  const unidadesTotales = inventarioTotal.reduce(
    (sum: number, item: InventarioTotalItem) =>
      sum + Number(item.stock_total ?? 0),
    0
  )

  const productosCriticos = inventarioAlmacen.filter(
    (item: InventarioAlmacenItem) => Number(item.stock_actual) <= 0
  ).length

  return (
    <main>
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Inventario
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Control de stock
          </h1>

          <p className="mt-2 text-slate-500">
            Visualiza stock total, valorización, alertas y distribución por almacén.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Actualización en tiempo real desde Supabase
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Productos base</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            {inventarioTotal.length}
          </h2>
          <p className="mt-2 text-sm text-slate-400">SKUs físicos registrados</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Unidades totales</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            {unidadesTotales}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Inventario consolidado</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Costo inventario</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            S/ {costoTotalInventario.toFixed(2)}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Valor a costo unitario</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Críticos</p>
          <h2 className="mt-3 text-3xl font-bold text-red-600">
            {productosCriticos}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Registros sin stock</p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Inventario total por producto
            </h2>
            <p className="text-sm text-slate-500">
              Consolidado por SKU físico, sin separar almacenes.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Stock total</th>
                <th className="px-4 py-3">Costo unitario</th>
                <th className="px-4 py-3">Costo total</th>
              </tr>
            </thead>

            <tbody>
              {inventarioTotal.map((item: InventarioTotalItem, index: number) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.sku}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {item.producto}
                  </td>

                  <td className="px-4 py-3 font-bold text-slate-950">
                    {item.stock_total}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    S/ {Number(item.costo_unitario ?? 0).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 font-bold text-slate-950">
                    S/ {Number(item.costo_total ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}

              {inventarioTotal.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No hay inventario registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">
            Inventario por almacén
          </h2>
          <p className="text-sm text-slate-500">
            Filtra por SKU, producto o almacén y revisa alertas de stock.
          </p>
        </div>

        <InventarioTable inventario={inventarioAlmacen} />
      </section>
    </main>
  )
}