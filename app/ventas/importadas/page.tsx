
import Link from "next/link"
import { supabase } from "@/src/lib/supabase"
import ProcesarOrdenListaButton from "./ProcesarOrdenListaButton"

export const dynamic = "force-dynamic"
export const revalidate = 0

type TipoDespacho =
  | "dropshipping"
  | "fulfillment_by_falabella"
  | "desconocido"
  | string

type OrdenImportada = {
  id: string
  marketplace: string
  order_id_marketplace: string
  order_number_marketplace: string
  cliente_nombre: string | null
  cliente_ciudad: string | null
  cliente_region: string | null
  estado_marketplace: string | null
  estado_krono: string
  tipo_despacho: TipoDespacho | null
  total: number | null
  moneda: string | null
  product_total: number | null
  shipping_fee_total: number | null
  items_count: number | null
  payment_method: string | null
  shipping_type: string | null
  promised_shipping_time: string | null
  fecha_orden: string | null
  fecha_importacion: string | null
  total_lineas?: number | null
  lineas_mapeadas?: number | null
  lineas_pendientes?: number | null
  lineas?: number | null
  lineas_sin_mapear?: number | null
}

type DetalleOrden = {
  orden_importada_id: string
  sku_seller: string | null
  nombre_marketplace: string | null
  cantidad: number | null
  producto_krono_nombre: string | null
  mapeado: boolean | null
}

const ALMACEN_DROPSHIPPING = "Deposito Sotano Nro. 82"
const ALMACEN_FBF = "FBF - Fulfillment by Falabella"

const ESTADOS_PENDIENTES = [
  "lista_para_procesar",
  "pendiente_mapeo",
  "error_stock",
  "error_procesamiento",
]

function formatearFecha(fecha: string | null) {
  if (!fecha) return "-"

  const date = new Date(fecha)

  if (Number.isNaN(date.getTime())) {
    return fecha
  }

  return date.toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatearMonto(valor: number | null, moneda: string | null = "PEN") {
  const numero = Number(valor || 0)
  return `${moneda || "PEN"} ${numero.toFixed(2)}`
}

function obtenerLineasPendientes(orden: OrdenImportada) {
  return Number(orden.lineas_pendientes ?? orden.lineas_sin_mapear ?? 0)
}

function esDropshipping(orden: OrdenImportada) {
  return orden.tipo_despacho === "dropshipping"
}

function esFBF(orden: OrdenImportada) {
  return orden.tipo_despacho === "fulfillment_by_falabella"
}

function obtenerDespacho(orden: OrdenImportada) {
  if (esDropshipping(orden)) {
    return {
      texto: "Dropshipping",
      descripcion: "Tu preparas y despachas",
      clase: "bg-blue-50 text-blue-800 border-blue-200",
    }
  }

  if (esFBF(orden)) {
    return {
      texto: "FBF",
      descripcion: "Falabella despacha",
      clase: "bg-purple-50 text-purple-800 border-purple-200",
    }
  }

  return {
    texto: "Sin identificar",
    descripcion: orden.shipping_type || "Revisar despacho",
    clase: "bg-gray-100 text-gray-700 border-gray-200",
  }
}

function obtenerOrigenStock(orden: OrdenImportada) {
  if (esDropshipping(orden)) return ALMACEN_DROPSHIPPING
  if (esFBF(orden)) return ALMACEN_FBF
  return "Pendiente de definir"
}

function obtenerAccionPendiente(orden: OrdenImportada) {
  const lineasPendientes = obtenerLineasPendientes(orden)

  if (!orden.tipo_despacho || orden.tipo_despacho === "desconocido") {
    return {
      texto: "Revisar tipo de despacho",
      clase: "bg-gray-100 text-gray-800 border-gray-200",
    }
  }

  if (lineasPendientes > 0 || orden.estado_krono === "pendiente_mapeo") {
    return {
      texto: "Falta mapear SKU",
      clase: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
  }

  if (orden.estado_krono === "error_stock") {
    if (esFBF(orden)) {
      return {
        texto: "Sin stock en FBF",
        clase: "bg-red-100 text-red-800 border-red-200",
      }
    }

    return {
      texto: "Sin stock en Deposito 82",
      clase: "bg-red-100 text-red-800 border-red-200",
    }
  }

  if (orden.estado_krono === "lista_para_procesar") {
    if (esFBF(orden)) {
      return {
        texto: "Descontar stock FBF",
        clase: "bg-purple-100 text-purple-800 border-purple-200",
      }
    }

    return {
      texto: "Preparar pedido",
      clase: "bg-blue-100 text-blue-800 border-blue-200",
    }
  }

  return {
    texto: "Revisar",
    clase: "bg-gray-100 text-gray-800 border-gray-200",
  }
}

function ordenarPorPromesa(a: OrdenImportada, b: OrdenImportada) {
  const fechaA = a.promised_shipping_time
    ? new Date(a.promised_shipping_time).getTime()
    : Number.MAX_SAFE_INTEGER

  const fechaB = b.promised_shipping_time
    ? new Date(b.promised_shipping_time).getTime()
    : Number.MAX_SAFE_INTEGER

  return fechaA - fechaB
}

function DetalleOrdenResumen({
  detalles,
}: {
  detalles: DetalleOrden[]
}) {
  if (!detalles || detalles.length === 0) {
    return <span className="text-xs text-gray-400">Sin detalle</span>
  }

  const visibles = detalles.slice(0, 3)
  const ocultos = detalles.length - visibles.length

  return (
    <div className="max-w-[360px] space-y-2">
      {visibles.map((detalle, index) => (
        <div
          key={`${detalle.orden_importada_id}-${detalle.sku_seller}-${index}`}
          className="rounded-lg border border-slate-200 bg-slate-50 p-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs font-bold text-slate-900">
              {detalle.sku_seller || "SKU sin codigo"}
            </div>

            <div className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
              Cant: {Number(detalle.cantidad || 0)}
            </div>
          </div>

          <div className="mt-1 text-xs text-slate-700">
            {detalle.nombre_marketplace || "Producto marketplace sin nombre"}
          </div>

          <div className="mt-1 text-xs">
            {detalle.mapeado ? (
              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 font-medium text-green-800">
                {detalle.producto_krono_nombre || "Mapeado"}
              </span>
            ) : (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-medium text-red-800">
                Sin mapear
              </span>
            )}
          </div>
        </div>
      ))}

      {ocultos > 0 && (
        <div className="text-xs font-medium text-slate-500">
          + {ocultos} producto(s) mas
        </div>
      )}
    </div>
  )
}

function TablaOrdenes({
  ordenes,
  detallesPorOrden,
  titulo,
  descripcion,
  vacio,
  prioridad,
}: {
  ordenes: OrdenImportada[]
  detallesPorOrden: Record<string, DetalleOrden[]>
  titulo: string
  descripcion: string
  vacio: string
  prioridad?: "alta" | "media" | "problema"
}) {
  const borde =
    prioridad === "alta"
      ? "border-blue-200"
      : prioridad === "media"
        ? "border-purple-200"
        : prioridad === "problema"
          ? "border-yellow-200"
          : "border-gray-200"

  return (
    <section className={`rounded-xl border ${borde} bg-white shadow-sm`}>
      <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
          <p className="text-sm text-gray-500">{descripcion}</p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
          {ordenes.length} orden(es)
        </span>
      </div>

      {ordenes.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">{vacio}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] divide-y text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Orden
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Fecha prometida
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Despacho
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Origen de stock
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Accion pendiente
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Detalle de la orden
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Producto
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Envio
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Total
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Accion
                </th>
              </tr>
            </thead>

            <tbody className="divide-y bg-white">
              {ordenes.map((orden) => {
                const despacho = obtenerDespacho(orden)
                const accionPendiente = obtenerAccionPendiente(orden)
                const detalles = detallesPorOrden[orden.id] || []

                return (
                  <tr key={orden.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-gray-900">
                        {orden.order_number_marketplace}
                      </div>
                      <div className="text-xs text-gray-500">
                        {orden.marketplace}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-gray-900">
                        {orden.cliente_nombre || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {orden.cliente_ciudad || "-"} /{" "}
                        {orden.cliente_region || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top text-gray-700">
                      {formatearFecha(orden.promised_shipping_time)}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${despacho.clase}`}
                      >
                        {despacho.texto}
                      </span>
                      <div className="mt-1 text-xs text-gray-500">
                        {despacho.descripcion}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-gray-900">
                        {obtenerOrigenStock(orden)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {esDropshipping(orden)
                          ? "Stock fisico propio"
                          : esFBF(orden)
                            ? "Stock entregado a Falabella"
                            : "Debe revisarse"}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${accionPendiente.clase}`}
                      >
                        {accionPendiente.texto}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <DetalleOrdenResumen detalles={detalles} />
                    </td>

                    <td className="px-4 py-3 text-right align-top font-medium text-gray-900">
                      {formatearMonto(orden.product_total, orden.moneda)}
                    </td>

                    <td className="px-4 py-3 text-right align-top font-medium text-gray-900">
                      {formatearMonto(orden.shipping_fee_total, orden.moneda)}
                    </td>

                    <td className="px-4 py-3 text-right align-top font-bold text-gray-900">
                      {formatearMonto(orden.total, orden.moneda)}
                    </td>

		<td className="px-3 py-3 text-right align-top">
		  <div className="flex min-w-[90px] flex-col items-end gap-2">
		    <Link
		      href={`/ventas/importadas/${orden.id}`}
      		className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    			>
      			Revisar
    		</Link>

    <ProcesarOrdenListaButton
      ordenId={orden.id}
      estadoKrono={orden.estado_krono}
      orderNumber={orden.order_number_marketplace}
    />
  </div>
</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default async function OrdenesImportadasPage() {
  const { data, error } = await supabase
    .from("vista_ordenes_importadas")
    .select("*")
    .in("estado_krono", ESTADOS_PENDIENTES)
    .order("promised_shipping_time", { ascending: true, nullsFirst: false })
    .limit(300)

  const { count: procesadasCount } = await supabase
    .from("ordenes_importadas")
    .select("*", { count: "exact", head: true })
    .eq("estado_krono", "procesada")

  const ordenes = ((data || []) as OrdenImportada[])
    .filter((orden) =>
      ESTADOS_PENDIENTES.includes(String(orden.estado_krono || "").trim())
    )
    .sort(ordenarPorPromesa)

  const ordenIds = ordenes.map((orden) => orden.id)

  let detallesPorOrden: Record<string, DetalleOrden[]> = {}

  if (ordenIds.length > 0) {
    const { data: detallesData } = await supabase
      .from("vista_ordenes_importadas_detalle")
      .select(
        "orden_importada_id, sku_seller, nombre_marketplace, cantidad, producto_krono_nombre, mapeado"
      )
      .in("orden_importada_id", ordenIds)

    detallesPorOrden = ((detallesData || []) as DetalleOrden[]).reduce(
      (acumulado, detalle) => {
        if (!acumulado[detalle.orden_importada_id]) {
          acumulado[detalle.orden_importada_id] = []
        }

        acumulado[detalle.orden_importada_id].push(detalle)

        return acumulado
      },
      {} as Record<string, DetalleOrden[]>
    )
  }

  const dropshippingParaPreparar = ordenes
    .filter(
      (orden) =>
        esDropshipping(orden) &&
        (orden.estado_krono === "lista_para_procesar" ||
          orden.estado_krono === "error_stock")
    )
    .sort(ordenarPorPromesa)

  const fbfParaControl = ordenes
    .filter(
      (orden) =>
        esFBF(orden) &&
        (orden.estado_krono === "lista_para_procesar" ||
          orden.estado_krono === "error_stock")
    )
    .sort(ordenarPorPromesa)

  const ordenesConProblemas = ordenes
    .filter((orden) => {
      const lineasPendientes = obtenerLineasPendientes(orden)

      return (
        orden.estado_krono === "pendiente_mapeo" ||
        lineasPendientes > 0 ||
        !orden.tipo_despacho ||
        orden.tipo_despacho === "desconocido"
      )
    })
    .sort(ordenarPorPromesa)

  const totalPendientesMapeo = ordenes.reduce(
    (total, orden) => total + obtenerLineasPendientes(orden),
    0
  )

  const totalErrorStock = ordenes.filter(
    (orden) => orden.estado_krono === "error_stock"
  ).length

  const totalPendientes =
    dropshippingParaPreparar.length +
    fbfParaControl.length +
    ordenesConProblemas.length

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Ventas Marketplace</p>
          <h1 className="text-3xl font-bold text-gray-900">
            Ordenes importadas de Falabella
          </h1>
          <p className="mt-2 max-w-3xl text-gray-600">
            Pantalla operativa para procesar unicamente ordenes pendientes.
            Cuando una orden se procesa correctamente, desaparece de esta lista.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/ventas/importadas"
            className="rounded-lg border px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Actualizar lista
          </Link>

          <Link
            href="/api/falabella/importar-ordenes?limit=10"
            className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
          >
            Importar desde Falabella
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
        <strong>Modo limpieza:</strong> trabaja de arriba hacia abajo. Al
        procesar una orden correctamente, volvera a esta pantalla y la orden ya
        no aparecera en pendientes.
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pendientes visibles</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalPendientes}
          </p>
          <p className="mt-1 text-xs text-gray-500">No incluye procesadas</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Para preparar</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {dropshippingParaPreparar.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">Dropshipping / Deposito 82</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Control FBF</p>
          <p className="mt-2 text-2xl font-bold text-purple-700">
            {fbfParaControl.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">Fulfillment by Falabella</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Con problemas</p>
          <p className="mt-2 text-2xl font-bold text-yellow-700">
            {ordenesConProblemas.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">Mapeo o despacho</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Procesadas historicas</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {procesadasCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Lineas sin mapear: {totalPendientesMapeo}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error cargando ordenes importadas: {error.message}
        </div>
      ) : (
        <>
          <TablaOrdenes
            titulo="Ordenes para preparar - Dropshipping"
            descripcion="Prioridad operativa. Estas ordenes se preparan fisicamente desde Deposito 82 y luego se descuenta stock al procesarlas."
            vacio="No hay ordenes Dropshipping listas para preparar."
            ordenes={dropshippingParaPreparar}
            detallesPorOrden={detallesPorOrden}
            prioridad="alta"
          />

          <TablaOrdenes
            titulo="Ordenes FBF - Control de stock Falabella"
            descripcion="Estas ordenes no las preparas fisicamente. Falabella las despacha, pero Krono descuenta el stock desde el almacen FBF."
            vacio="No hay ordenes FBF pendientes de control."
            ordenes={fbfParaControl}
            detallesPorOrden={detallesPorOrden}
            prioridad="media"
          />

          <TablaOrdenes
            titulo="Ordenes con problemas"
            descripcion="Ordenes que necesitan mapeo de SKU o revision del tipo de despacho antes de poder procesarse."
            vacio="No hay ordenes con problemas pendientes."
            ordenes={ordenesConProblemas}
            detallesPorOrden={detallesPorOrden}
            prioridad="problema"
          />
        </>
      )}

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <strong>Regla operativa:</strong> Dropshipping descuenta desde{" "}
        <strong>Deposito 82</strong>. FBF descuenta desde{" "}
        <strong>FBF - Fulfillment by Falabella</strong>. Las ordenes procesadas
        se ocultan automaticamente de esta pantalla para evitar confusion.
      </div>
    </main>
  )
}
