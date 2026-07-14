import { supabase } from "@/src/lib/supabase"
import MovimientosTable from "./MovimientosTable"
import PageHeader from "@/app/componentes/ui/PageHeader"
import StatCard from "@/app/componentes/ui/StatCard"
import SectionCard from "@/app/componentes/ui/SectionCard"

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
    <PageHeader
      eyebrow="Auditoría"
      title="Kardex"
      description="Historial general de ingresos, ventas, ajustes y traslados registrados en el inventario."
      actions={
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Trazabilidad completa de inventario
        </div>
      }
    />

    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Movimientos"
        value={totalMovimientos}
        helper="Registros históricos"
      />

      <StatCard
        label="Ingresos"
        value={ingresos}
        helper="Entradas de stock"
        tone="success"
      />

      <StatCard
        label="Ventas / salidas"
        value={ventas}
        helper="Descuentos de stock"
        tone="danger"
      />

      <StatCard
        label="Traslados"
        value={traslados}
        helper="Movimientos internos"
      />
    </section>

    <div className="mt-6">
      <SectionCard
        title="Kardex general"
        description="Filtra por SKU, producto, tipo de movimiento o almacén."
      >
        <MovimientosTable movimientos={movimientos} />
      </SectionCard>
    </div>
  </main>
)
}