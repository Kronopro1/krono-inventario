import { supabase } from "@/src/lib/supabase"
import NuevoComboForm from "./NuevoComboForm"

export const dynamic = "force-dynamic"

export default async function NuevoComboPage() {
  const { data: productos } = await supabase.rpc(
    "obtener_productos_base_publico"
  )

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold">Nuevo Combo</h1>

      <p className="mt-2 text-slate-600">
        Crea kits compuestos por productos existentes.
      </p>

      <NuevoComboForm productos={productos ?? []} />
    </main>
  )
}