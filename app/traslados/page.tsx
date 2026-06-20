import { supabase } from "@/src/lib/supabase"
import TrasladosForm from "./TrasladosForm"

export const dynamic = "force-dynamic"

export default async function TrasladosPage() {
  const { data: productos } = await supabase.rpc(
    "obtener_productos_traslado_publico"
  )

  const { data: almacenes } = await supabase.rpc("obtener_almacenes_publico")

  return (
    <main className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Inventario
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Traslado entre almacenes
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Mueve productos físicos o combos entre almacenes. Si seleccionas un
            combo, Krono trasladará automáticamente sus componentes.
          </p>
        </div>
      </section>

      <TrasladosForm productos={productos ?? []} almacenes={almacenes ?? []} />
    </main>
  )
}