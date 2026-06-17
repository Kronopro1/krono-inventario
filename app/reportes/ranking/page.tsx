import { supabase } from "@/src/lib/supabase"

export const dynamic = "force-dynamic"

type TopProducto = {
  sku: string
  nombre: string
  es_combo: boolean
  unidades_vendidas: number
}

type TopCombo = {
  sku: string
  nombre: string
  unidades_vendidas: number
}

type TopCanal = {
  canal: string
  total_ordenes: number
}

export default async function RankingPage() {
  const { data: productosData } = await supabase.rpc(
    "obtener_top_productos_publico"
  )

  const { data: combosData } = await supabase.rpc(
    "obtener_top_combos_publico"
  )

  const { data: canalesData } = await supabase.rpc(
    "obtener_top_canales_publico"
  )

  const productos = (productosData ?? []) as TopProducto[]
  const combos = (combosData ?? []) as TopCombo[]
  const canales = (canalesData ?? []) as TopCanal[]

  return (
    <main>
      <section className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Business Intelligence
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Ranking Comercial
        </h1>

        <p className="mt-2 text-slate-500">
          Productos, combos y canales con mejor desempeño comercial.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            🏆 Top Productos
          </h2>

          <div className="space-y-3">
            {productos.map((item, index) => (
              <div
                key={item.sku}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3"
              >
                <div>
                  <p className="font-semibold">
                    #{index + 1} {item.nombre}
                  </p>

                  <p className="text-xs text-slate-400">
                    {item.sku}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {item.unidades_vendidas}
                  </p>

                  <p className="text-xs text-slate-400">
                    unidades
                  </p>
                </div>
              </div>
            ))}

            {productos.length === 0 && (
              <p className="text-sm text-slate-500">
                No hay productos vendidos.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            🧩 Top Combos
          </h2>

          <div className="space-y-3">
            {combos.map((item, index) => (
              <div
                key={item.sku}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3"
              >
                <div>
                  <p className="font-semibold">
                    #{index + 1} {item.nombre}
                  </p>

                  <p className="text-xs text-slate-400">
                    {item.sku}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {item.unidades_vendidas}
                  </p>

                  <p className="text-xs text-slate-400">
                    kits
                  </p>
                </div>
              </div>
            ))}

            {combos.length === 0 && (
              <p className="text-sm text-slate-500">
                No hay combos vendidos.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            📈 Top Canales
          </h2>

          <div className="space-y-3">
            {canales.map((item, index) => (
              <div
                key={item.canal}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3"
              >
                <div>
                  <p className="font-semibold">
                    #{index + 1} {item.canal}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {item.total_ordenes}
                  </p>

                  <p className="text-xs text-slate-400">
                    órdenes
                  </p>
                </div>
              </div>
            ))}

            {canales.length === 0 && (
              <p className="text-sm text-slate-500">
                No hay canales con ventas.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}