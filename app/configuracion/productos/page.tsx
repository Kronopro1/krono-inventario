import Link from "next/link"
import { supabase } from "@/src/lib/supabase"
import ProductosConfigTable from "./ProductosConfigTable"

export const dynamic = "force-dynamic"

export default async function ProductosConfigPage() {
  const { data: productos } = await supabase.rpc(
    "obtener_productos_config_publico"
  )

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Configuración</p>

          <h1 className="text-3xl font-bold text-slate-950">
            Productos
          </h1>

          <p className="mt-2 text-slate-600">
            Administra los productos individuales, costos y stock mínimo.
          </p>
        </div>

        <Link
          href="/configuracion/nuevo-producto"
          className="rounded-xl bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
        >
          Nuevo producto
        </Link>
      </div>

      <ProductosConfigTable productos={productos ?? []} />
    </main>
  )
}