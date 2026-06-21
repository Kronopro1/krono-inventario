import { supabase } from "@/src/lib/supabase"
import VentasForm from "./VentasForm"

export const dynamic = "force-dynamic"

export default async function VentasPage() {
  const { data: canales } = await supabase
    .from("vista_canales_venta")
    .select("id, nombre")
    .order("nombre")

  const { data: empresas } = await supabase
    .from("vista_empresas")
    .select("id, nombre, razon_social, ruc")
    .order("nombre")

  const { data: almacenes } = await supabase
    .from("vista_almacenes")
    .select("id, codigo, nombre")
    .order("codigo")

  const { data: productos } = await supabase
    .from("vista_productos_venta")
    .select("id, sku, nombre, es_combo")
    .order("sku")

  const { data: inventario } = await supabase.rpc(
    "obtener_inventario_publico"
  )

  return (
    <main>
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Operaciones
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Nueva venta
          </h1>

          <p className="mt-2 text-slate-500">
            Registra ventas por empresa, marketplace o canal directo y descuenta stock automáticamente.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Inventario compartido · Venta por empresa
        </div>
      </section>

      <VentasForm
        canales={canales ?? []}
        empresas={empresas ?? []}
        almacenes={almacenes ?? []}
        productos={productos ?? []}
        inventario={inventario ?? []}
      />
    </main>
  )
}