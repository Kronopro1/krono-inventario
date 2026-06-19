import Link from "next/link"
import { supabase } from "@/src/lib/supabase"

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
  total_lineas: number | null
  lineas_mapeadas: number | null
  lineas_pendientes: number | null
}

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

function etiquetaEstadoKrono(estado: string) {
  if (estado === "pendiente_mapeo") {
    return {
      texto: "Pendiente de mapeo",
      clase: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
  }

  if (estado === "lista_para_procesar") {
    return {
      texto: "Lista para procesar",
      clase: "bg-blue-100 text-blue-800 border-blue-200",
    }
  }

  if (estado === "procesada") {
    return {
      texto: "Procesada",
      clase: "bg-green-100 text-green-800 border-green-200",
    }
  }

  if (estado === "error_stock") {
    return {
      texto: "Error de stock",
      clase: "bg-red-100 text-red-800 border-red-200",
    }
  }

  if (estado === "cancelada") {
    return {
      texto: "Cancelada",
      clase: "bg-gray-100 text-gray-800 border-gray-200",
    }
  }

  return {
    texto: estado,
    clase: "bg-gray-100 text-gray-800 border-gray-200",
  }
}

function etiquetaEstadoMarketplace(estado: string | null) {
  if (!estado) {
    return {
      texto: "-",
      clase: "bg-gray-100 text-gray-700 border-gray-200",
    }
  }

  if (estado === "ready_to_ship") {
    return {
      texto: "Lista para despacho",
      clase: "bg-green-100 text-green-800 border-green-200",
    }
  }

  if (estado === "pending") {
    return {
      texto: "Pendiente",
      clase: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
  }

  if (estado === "shipped") {
    return {
      texto: "Enviada",
      clase: "bg-blue-100 text-blue-800 border-blue-200",
    }
  }

  return {
    texto: estado,
    clase: "bg-gray-100 text-gray-700 border-gray-200",
  }
}

export default async function OrdenesImportadasPage() {
  const { data, error } = await supabase
    .from("vista_ordenes_importadas")
    .select("*")
    .order("fecha_importacion", { ascending: false })
    .limit(100)

  const ordenes = (data || []) as OrdenImportada[]

  const totalOrdenes = ordenes.length
  const pendientes = ordenes.filter(
    (orden) => orden.estado_krono === "pendiente_mapeo"
  ).length
  const listas = ordenes.filter(
    (orden) => orden.estado_krono === "lista_para_procesar"
  ).length
  const procesadas = ordenes.filter(
    (orden) => orden.estado_krono === "procesada"
  ).length

  const totalPendientesMapeo = ordenes.reduce(
    (total, orden) => total + Number(orden.lineas_pendientes || 0),
    0
  )

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">Ventas Marketplace</p>
        <h1 className="text-3xl font-bold text-gray-900">
          Órdenes importadas
        </h1>
        <p className="mt-2 text-gray-600">
          Bandeja de órdenes traídas desde Falabella antes de procesarlas como
          ventas reales. Estas órdenes todavía no descuentan stock.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total importadas</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalOrdenes}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pendientes de mapeo</p>
          <p className="mt-2 text-2xl font-bold text-yellow-700">
            {pendientes}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Listas para procesar</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{listas}</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Procesadas</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {procesadas}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Líneas sin mapear</p>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {totalPendientesMapeo}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Bandeja de borradores
            </h2>
            <p className="text-sm text-gray-500">
              Puedes importar nuevas órdenes y luego revisarlas antes de
              procesar la venta.
            </p>
          </div>

          <Link
            href="/api/falabella/importar-ordenes?limit=10"
            className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
          >
            Importar desde Falabella
          </Link>
        </div>

        {error ? (
          <div className="p-4 text-sm text-red-600">
            Error cargando órdenes importadas: {error.message}
          </div>
        ) : ordenes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Todavía no hay órdenes importadas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] divide-y text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Orden
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Estado Falabella
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Estado Krono
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    Envío
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">
                    Líneas
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">
                    Sin mapear
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Promesa despacho
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y bg-white">
                {ordenes.map((orden) => {
                  const estadoKrono = etiquetaEstadoKrono(orden.estado_krono)
                  const estadoMarket = etiquetaEstadoMarketplace(
                    orden.estado_marketplace
                  )

                  return (
                    <tr key={orden.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-gray-900">
                          {orden.order_number_marketplace}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {orden.order_id_marketplace}
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

                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${estadoMarket.clase}`}
                        >
                          {estadoMarket.texto}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${estadoKrono.clase}`}
                        >
                          {estadoKrono.texto}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right align-top font-medium text-gray-900">
                        {formatearMonto(orden.product_total, orden.moneda)}
                      </td>

                      <td className="px-4 py-3 text-right align-top font-medium text-gray-900">
                        {formatearMonto(
                          orden.shipping_fee_total,
                          orden.moneda
                        )}
                      </td>

                      <td className="px-4 py-3 text-right align-top font-bold text-gray-900">
                        {formatearMonto(orden.total, orden.moneda)}
                      </td>

                      <td className="px-4 py-3 text-center align-top text-gray-700">
                        {orden.total_lineas || 0}
                      </td>

                      <td className="px-4 py-3 text-center align-top">
                        <span
                          className={
                            Number(orden.lineas_pendientes || 0) > 0
                              ? "font-bold text-red-700"
                              : "font-medium text-green-700"
                          }
                        >
                          {orden.lineas_pendientes || 0}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-top text-gray-700">
                        {formatearFecha(orden.promised_shipping_time)}
                      </td>

                      <td className="px-4 py-3 text-right align-top">
                        <Link
                          href={`/ventas/importadas/${orden.id}`}
                          className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Revisar
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
        <strong>Nota:</strong> Esta pantalla solo muestra órdenes importadas
        como borrador. Todavía no se descuenta inventario ni se crean ventas
        reales.
      </div>
    </main>
  )
}