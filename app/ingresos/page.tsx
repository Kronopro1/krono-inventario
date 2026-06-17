import { supabase } from "@/src/lib/supabase"
import IngresosForm from "./IngresosForm"

export const dynamic = "force-dynamic"

export default async function IngresosPage() {
  const { data: productos } = await supabase.rpc(
    "obtener_productos_publico"
  )

  const { data: almacenes } = await supabase.rpc(
    "obtener_almacenes_publico"
  )

  return (
    <main>
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Inventario
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Nuevo ingreso
          </h1>

          <p className="mt-2 text-slate-500">
            Registra mercadería recibida y aumenta el stock del almacén correspondiente.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Actualización automática de stock
        </div>
      </section>

      <IngresosForm
        productos={productos ?? []}
        almacenes={almacenes ?? []}
      />
    </main>
  )
}