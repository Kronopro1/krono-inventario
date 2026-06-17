import { supabase } from "@/src/lib/supabase"

export const dynamic = "force-dynamic"

type Combo = {
  combo_id: string
  combo_sku: string
  combo_nombre: string
  descripcion: string | null
  detalle_componentes: string | null
  activo: boolean
}

export default async function CombosPage() {
  const { data } = await supabase.rpc("obtener_combos_publico")

  const combos = (data ?? []) as Combo[]

  const combosActivos =
    combos.filter((combo) => combo.activo).length

  const combosInactivos =
    combos.filter((combo) => !combo.activo).length

  return (
    <main>
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Configuración
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Combos
          </h1>

          <p className="mt-2 text-slate-500">
            Visualiza kits comerciales y sus componentes configurados.
          </p>
        </div>

        <a
          href="/configuracion/nuevo-combo"
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Nuevo combo
        </a>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Combos totales</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            {combos.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Activos</p>
          <h2 className="mt-3 text-3xl font-bold text-green-700">
            {combosActivos}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Inactivos</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-500">
            {combosInactivos}
          </h2>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">
            Listado de combos
          </h2>
          <p className="text-sm text-slate-500">
            Revisa la composición de cada kit.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Componentes</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              {combos.map((combo) => (
                <tr key={combo.combo_id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {combo.combo_sku}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {combo.combo_nombre}
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    {combo.descripcion || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="max-w-xl text-xs text-slate-600">
                      {combo.detalle_componentes || "Sin componentes"}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        combo.activo
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                      }`}
                    >
                      {combo.activo ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                </tr>
              ))}

              {combos.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No hay combos configurados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}