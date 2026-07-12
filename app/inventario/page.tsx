import { supabase } from "@/src/lib/supabase"
import PageHeader from "@/app/componentes/ui/PageHeader"
import StatCard from "@/app/componentes/ui/StatCard"
import SectionCard from "@/app/componentes/ui/SectionCard"
import InventarioResumenTable, {
  type ItemInventarioResumen,
} from "./InventarioResumenTable"

export const dynamic = "force-dynamic"

export default async function InventarioPage() {
  const { data, error } = await supabase.rpc(
    "obtener_inventario_resumen_publico"
  )

  if (error) {
    console.error("Error cargando inventario:", error)
  }

  const inventario = (data ?? []) as ItemInventarioResumen[]

  const productosActivos = inventario.length

  const unidadesTotales = inventario.reduce(
    (total, item) => total + Number(item.stock_total ?? 0),
    0
  )

  const costoTotalInventario = inventario.reduce(
    (total, item) =>
      total +
      Number(item.stock_total ?? 0) *
        Number(item.costo_unitario ?? 0),
    0
  )

  const productosCriticos = inventario.filter(
    (item) =>
      item.estado_inventario === "SIN STOCK" ||
      item.estado_inventario === "STOCK BAJO"
  ).length

  return (
    <main>
      <PageHeader
  eyebrow="Inventario"
  title="Control de Stock"
  description="Visualiza stock consolidado, valorización, alertas y distribución por almacén."
  actions={
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
      Actualización en tiempo real desde Supabase
    </div>
  }
/>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
  <StatCard
    label="Productos activos"
    value={productosActivos}
    helper="Una fila por SKU"
  />

  <StatCard
    label="Unidades totales"
    value={unidadesTotales}
    helper="Inventario consolidado"
  />

  <StatCard
    label="Costo inventario"
    value={`S/ ${costoTotalInventario.toFixed(2)}`}
    helper="Valor a costo unitario"
  />

  <StatCard
    label="Alertas"
    value={productosCriticos}
    helper="Sin stock o stock bajo"
    tone="danger"
  />
</section>

      <SectionCard
  title="Inventario por producto"
  description="Una sola fila por SKU. Expande cada producto para ver su distribución por almacenes."
>
  {error ? (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
      No se pudo cargar el inventario.
    </div>
  ) : (
    <InventarioResumenTable inventario={inventario} />
  )}
</SectionCard>
    </main>
  )
}