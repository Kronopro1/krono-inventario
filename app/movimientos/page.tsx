import { supabase } from "@/src/lib/supabase"
import MovimientosTable from "./MovimientosTable"

export const dynamic = "force-dynamic"

type Movimiento = {
  fecha: string
  tipo: string
  numero_movimiento: string
  numero_orden: string | null
  sku: string
  producto: string
  cantidad: number
  almacen_origen: string | null
  almacen_destino: string | null
}

export default async function MovimientosPage() {
  const { data } = await supabase.rpc("obtener_movimientos_publico")

  const movimientos = (data ?? []) as Movimiento[]

  const totalMovimientos = movimientos.length

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
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Auditoría
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Historial de movimientos
          </h1>

          <p className="mt-2 text-slate-500">
            Kardex general de ingresos, ventas y traslados registrados en el sistema.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Trazabilidad completa de inventario
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Movimientos</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            {totalMovimientos}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Registros históricos</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ingresos</p>
          <h2 className="mt-3 text-3xl font-bold text-green-700">
            {ingresos}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Entradas de stock</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ventas / salidas</p>
          <h2 className="mt-3 text-3xl font-bold text-red-700">
            {ventas}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Descuentos de stock</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Traslados</p>
          <h2 className="mt-3 text-3xl font-bold text-blue-700">
            {traslados}
          </h2>
          <p className="mt-2 text-sm text-slate-400">Movimientos internos</p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">
            Kardex general
          </h2>

          <p className="text-sm text-slate-500">
            Filtra por SKU, producto, tipo de movimiento o almacén.
          </p>
        </div>

        <MovimientosTable movimientos={movimientos} />
      </section>
    </main>
  )
}