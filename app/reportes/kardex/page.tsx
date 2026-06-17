import { supabase } from "@/src/lib/supabase"

export const dynamic = "force-dynamic"

type Movimiento = {
  fecha: string
  tipo: string
  numero_movimiento: string
  numero_orden: string | null
  canal: string | null
  almacen_origen: string | null
  almacen_destino: string | null
  sku: string
  producto: string
  cantidad: number
  usuario: string | null
}

function tipoClase(tipo: string) {
  const normalizado = tipo.toLowerCase()

  if (normalizado.includes("ingreso")) {
    return "bg-green-50 text-green-700 ring-green-200"
  }

  if (normalizado.includes("salida") || normalizado.includes("venta")) {
    return "bg-red-50 text-red-700 ring-red-200"
  }

  if (normalizado.includes("traslado")) {
    return "bg-blue-50 text-blue-700 ring-blue-200"
  }

  return "bg-slate-100 text-slate-700 ring-slate-200"
}

export default async function ReporteKardexPage() {
  const { data } = await supabase.rpc("obtener_movimientos_publico")

  const movimientos = (data ?? []) as Movimiento[]

  const ingresos = movimientos.filter((item) =>
    item.tipo.toLowerCase().includes("ingreso")
  ).length

  const ventas = movimientos.filter(
    (item) =>
      item.tipo.toLowerCase().includes("salida") ||
      item.tipo.toLowerCase().includes("venta")
  ).length

  const traslados = movimientos.filter((item) =>
    item.tipo.toLowerCase().includes("traslado")
  ).length

  return (
    <main>
      <section className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Reportes
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Kardex ejecutivo
        </h1>

        <p className="mt-2 text-slate-500">
          Resumen de movimientos de inventario, ingresos, ventas y traslados.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Movimientos</p>
          <h2 className="mt-3 text-3xl font-bold">
            {movimientos.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Ingresos</p>
          <h2 className="mt-3 text-3xl font-bold text-green-700">
            {ingresos}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Ventas / Salidas</p>
          <h2 className="mt-3 text-3xl font-bold text-red-700">
            {ventas}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Traslados</p>
          <h2 className="mt-3 text-3xl font-bold text-blue-700">
            {traslados}
          </h2>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold">
            Historial de movimientos
          </h2>

          <p className="text-sm text-slate-500">
            Vista ejecutiva del kardex general.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Movimiento</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Destino</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3">
                    {new Date(item.fecha).toLocaleDateString("es-PE")}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${tipoClase(
                        item.tipo
                      )}`}
                    >
                      {item.tipo}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {item.numero_movimiento}
                  </td>

                  <td className="px-4 py-3">
                    {item.numero_orden ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    {item.canal ?? "-"}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {item.sku}
                  </td>

                  <td className="px-4 py-3">
                    {item.producto}
                  </td>

                  <td className="px-4 py-3 font-bold">
                    {item.cantidad}
                  </td>

                  <td className="px-4 py-3">
                    {item.almacen_origen ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    {item.almacen_destino ?? "-"}
                  </td>
                </tr>
              ))}

              {movimientos.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No hay movimientos registrados.
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