import Link from "next/link"
import { supabase } from "@/src/lib/supabase"

type Combo = {
  combo_id: string
  combo_sku: string
  combo_nombre: string
  combo_tipo: string | null
  combo_activo: boolean
  combo_precio_venta: number | null
  combo_costo_unitario: number | null
  total_componentes: number | null
  componentes: string | null
}

function formatearMonto(valor: number | null) {
  return `S/ ${Number(valor || 0).toFixed(2)}`
}

export default async function CombosPage() {
  const { data, error } = await supabase
    .from("vista_combos_web")
    .select("*")
    .order("combo_sku", { ascending: true })

  const combos = (data || []) as Combo[]

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Configuración</p>
          <h1 className="text-3xl font-bold text-gray-900">
            Combos y Kits
          </h1>
          <p className="mt-2 text-gray-600">
            Visualiza los combos existentes y los componentes que descuentan del inventario.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/configuracion/nuevo-combo"
            className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-700"
          >
            Nuevo combo
          </Link>

          <Link
            href="/configuracion"
            className="rounded-lg border bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Volver
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Error cargando combos: {error.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total combos</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {combos.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Activos</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {combos.filter((combo) => combo.combo_activo).length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Inactivos</p>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {combos.filter((combo) => !combo.combo_activo).length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Con componentes</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {
              combos.filter(
                (combo) => Number(combo.total_componentes || 0) > 0
              ).length
            }
          </p>
        </div>
      </div>

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Lista de combos existentes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Cuando se vende un combo, Krono descuenta sus componentes reales.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">SKU Combo</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Componentes</th>
                <th className="px-4 py-3">Precio venta</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>

            <tbody>
              {combos.map((combo) => (
                <tr key={combo.combo_id} className="border-t align-top">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {combo.combo_sku}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {combo.combo_nombre}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {combo.combo_tipo || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {combo.componentes ? (
                      <div className="max-w-xl">
                        {combo.componentes.split(" | ").map((item) => (
                          <div key={item} className="mb-1">
                            • {item}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800">
                        Sin componentes
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {formatearMonto(combo.combo_precio_venta)}
                  </td>

                  <td className="px-4 py-3">
                    {combo.combo_activo ? (
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800">
                        Inactivo
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/configuracion/combos/${combo.combo_id}`}
                      className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}

              {combos.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No hay combos registrados o la vista no está devolviendo datos.
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