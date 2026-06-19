import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import EditarComboForm from "./EditarComboForm"

type Combo = {
  id: string
  sku: string
  nombre: string
  tipo: string | null
  precio_venta: number | null
  costo_unitario: number | null
  activo: boolean
}

type ComboData = Combo & {
  es_combo: boolean
}

type Detalle = {
  combo_detalle_id: string
  combo_id: string
  combo_sku: string
  combo_nombre: string
  componente_id: string
  componente_sku: string
  componente_nombre: string
  cantidad: number
}

type Producto = {
  id: string
  sku: string
  nombre: string
  es_combo: boolean
  activo: boolean
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

export default async function EditarComboPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const idLimpio = String(id || "").trim()

  const tieneConfigSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!tieneConfigSupabase) {
    return (
      <main className="space-y-6">
        <Link
          href="/configuracion/combos"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a combos
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h1 className="text-xl font-bold">Falta configuración Supabase</h1>
          <p className="mt-2 text-sm">
            Revisa que exista SUPABASE_SERVICE_ROLE_KEY en tu archivo .env.local.
          </p>
        </div>
      </main>
    )
  }

  const { data: comboRows, error: comboError } = await supabaseAdmin
    .from("productos")
    .select("id, sku, nombre, tipo, precio_venta, costo_unitario, activo, es_combo")
    .eq("id", idLimpio)
    .limit(1)

  const comboData = comboRows?.[0] as ComboData | undefined

  if (comboError) {
    return (
      <main className="space-y-6">
        <Link
          href="/configuracion/combos"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a combos
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h1 className="text-xl font-bold">Error cargando combo</h1>
          <p className="mt-2 text-sm">{comboError.message}</p>
          <p className="mt-2 text-sm font-mono">ID recibido: {idLimpio}</p>
        </div>
      </main>
    )
  }

  if (!comboData) {
    const { data: pruebaProductos } = await supabaseAdmin
      .from("productos")
      .select("id, sku, nombre, es_combo, activo")
      .eq("es_combo", true)
      .limit(5)

    return (
      <main className="space-y-6">
        <Link
          href="/configuracion/combos"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a combos
        </Link>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-900">
          <h1 className="text-xl font-bold">Combo no encontrado</h1>
          <p className="mt-2 text-sm">
            No se encontró ningún producto con este ID.
          </p>
          <p className="mt-2 text-sm font-mono">ID recibido: {idLimpio}</p>

          <div className="mt-4 rounded-lg bg-white p-3 text-xs">
            <p className="font-semibold">Primeros combos visibles para la app:</p>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify(pruebaProductos, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    )
  }

  if (comboData.es_combo !== true) {
    return (
      <main className="space-y-6">
        <Link
          href="/configuracion/combos"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a combos
        </Link>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-900">
          <h1 className="text-xl font-bold">
            Este producto no está marcado como combo
          </h1>
          <p className="mt-2 text-sm">
            El producto existe, pero en la tabla productos no tiene es_combo = true.
          </p>
          <p className="mt-2 text-sm font-mono">ID recibido: {idLimpio}</p>
          <p className="mt-2 text-sm">
            SKU: {comboData.sku} — {comboData.nombre}
          </p>
        </div>
      </main>
    )
  }

  const { data: detalleData, error: detalleError } = await supabaseAdmin
    .from("vista_combo_detalle_web")
    .select("*")
    .eq("combo_id", idLimpio)
    .order("componente_sku", { ascending: true })

  const { data: productosData, error: productosError } = await supabaseAdmin
    .from("productos")
    .select("id, sku, nombre, es_combo, activo")
    .eq("activo", true)
    .eq("es_combo", false)
    .order("sku", { ascending: true })

  const combo = comboData as Combo
  const detalle = (detalleData || []) as Detalle[]
  const productos = (productosData || []) as Producto[]

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Configuración / Combos</p>
          <h1 className="text-3xl font-bold text-gray-900">Editar combo</h1>
          <p className="mt-2 text-gray-600">
            {combo.sku} — {combo.nombre}
          </p>
        </div>

        <Link
          href="/configuracion/combos"
          className="rounded-lg border bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a combos
        </Link>
      </div>

      {detalleError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Error cargando componentes: {detalleError.message}
        </div>
      )}

      {productosError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Error cargando productos disponibles: {productosError.message}
        </div>
      )}

      <EditarComboForm combo={combo} detalle={detalle} productos={productos} />
    </main>
  )
}