import { supabase } from "@/src/lib/supabase"
import TrasladosForm from "./TrasladosForm"

export default async function TrasladosPage() {
  const { data: productos } = await supabase.rpc("obtener_productos_publico")
  const { data: almacenes } = await supabase.rpc("obtener_almacenes_publico")

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold">Traslado entre almacenes</h1>
      <p className="mt-2 text-slate-600">
        Mueve productos entre depósitos sin alterar el stock total.
      </p>

      <TrasladosForm
        productos={productos ?? []}
        almacenes={almacenes ?? []}
      />
    </main>
  )
}