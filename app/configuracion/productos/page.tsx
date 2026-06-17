import { supabase } from "@/src/lib/supabase"
import ProductosConfigTable from "./ProductosConfigTable"

export const dynamic = "force-dynamic"

export default async function ProductosConfigPage() {
  const { data: productos } = await supabase.rpc(
    "obtener_productos_config_publico"
  )

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold">Configuración de Productos</h1>
      <p className="mt-2 text-slate-600">
        Edita costo unitario y stock mínimo por producto.
      </p>

      <ProductosConfigTable productos={productos ?? []} />
    </main>
  )
}