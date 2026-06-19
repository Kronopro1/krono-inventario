import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/src/lib/supabase"
import ProcesarOrdenButton from "./ProcesarOrdenButton"

type OrdenImportada = {
  id: string
  marketplace: string
  order_id_marketplace: string
  order_number_marketplace: string
  cliente_nombre: string | null
  cliente_ciudad: string | null
  cliente_region: string | null
  cliente_documento: string | null
  shipping_address1: string | null
  shipping_address2: string | null
  shipping_address3: string | null
  shipping_ward: string | null
  shipping_postcode: string | null
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
  venta_procesada_id?: string | null
}

type OrdenDetalle = {
  id: string
  orden_importada_id: string
  marketplace: string
  order_item_id_marketplace: string | null
  sku_seller: string | null
  sku_marketplace: string | null
  nombre_marketplace: string | null
  cantidad: number | null
  precio_unitario: number | null
  total_linea: number | null
  estado_item_marketplace: string | null
  tracking_code: string | null
  package_id: string | null
  shipment_provider: string | null
  producto_krono_id: string | null
  producto_krono_nombre: string | null
  mapeado: boolean
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

function construirDireccion(orden: OrdenImportada) {
  const partes = [
    orden.shipping_address1,
    orden.shipping_address2,
    orden.shipping_address3,
  ].filter(Boolean)

  if (partes.length === 0) return "-"

  return partes.join(" ")
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

export default async function OrdenImportadaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: ordenData, error: ordenError } = await supabase
    .from("vista_ordenes_importadas")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (ordenError || !ordenData) {
    notFound()
  }

  const orden = ordenData as OrdenImportada

  const { data: detallesData } = await supabase
    .from("vista_ordenes_importadas_detalle")
    .select("*")
    .eq("orden_importada_id", id)
    .order("sku_seller", { ascending: true })

  const detalles = (detallesData || []) as OrdenDetalle[]
  const estadoKrono = etiquetaEstadoKrono(orden.estado_krono)

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Ventas Marketplace</p>
          <h1 className="text-3xl font-bold text-gray-900">
            Orden importada #{orden.order_number_marketplace}
          </h1>
          <p className="mt-2 text-gray-600">
            Revisión del borrador antes de procesar la venta.
          </p>
        </div>

        <Link
          href="/ventas/importadas"
          className="rounded-lg border bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a órdenes importadas
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Estado Krono</p>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${estadoKrono.clase}`}
            >
              {estadoKrono.texto}
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Estado Falabella</p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {orden.estado_marketplace || "-"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Líneas sin mapear</p>
          <p className="mt-2 text-xl font-bold text-red-700">
            {orden.lineas_pendientes || 0}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total orden</p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatearMonto(orden.total, orden.moneda)}
          </p>
        </div>
      </div>

      <ProcesarOrdenButton
        ordenId={orden.id}
        estadoKrono={orden.estado_krono}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Datos del cliente
          </h2>

          <div className="mt-4 grid gap-3 text-sm">
            <div>
              <p className="text-gray-500">Cliente</p>
              <p className="font-medium text-gray-900">
                {orden.cliente_nombre || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Documento</p>
              <p className="font-medium text-gray-900">
                {orden.cliente_documento || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Ciudad / Región</p>
              <p className="font-medium text-gray-900">
                {[orden.cliente_ciudad, orden.cliente_region]
                  .filter(Boolean)
                  .join(" / ") || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Distrito</p>
              <p className="font-medium text-gray-900">
                {orden.shipping_ward || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Dirección despacho</p>
              <p className="font-medium text-gray-900">
                {construirDireccion(orden)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Código postal</p>
              <p className="font-medium text-gray-900">
                {orden.shipping_postcode || "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Datos de la orden
          </h2>

          <div className="mt-4 grid gap-3 text-sm">
            <div>
              <p className="text-gray-500">Marketplace</p>
              <p className="font-medium text-gray-900">
                {orden.marketplace || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="font-medium text-gray-900">
                {orden.order_id_marketplace || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Fecha orden</p>
              <p className="font-medium text-gray-900">
                {formatearFecha(orden.fecha_orden)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Promesa despacho</p>
              <p className="font-medium text-gray-900">
                {formatearFecha(orden.promised_shipping_time)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Producto total</p>
              <p className="font-medium text-gray-900">
                {formatearMonto(orden.product_total, orden.moneda)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Envío</p>
              <p className="font-medium text-gray-900">
                {formatearMonto(orden.shipping_fee_total, orden.moneda)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-bold text-gray-900">
                {formatearMonto(orden.total, orden.moneda)}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Productos importados
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Revisa que todos los productos estén correctamente mapeados antes de
            procesar.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">SKU Seller</th>
                <th className="px-4 py-3">SKU Falabella</th>
                <th className="px-4 py-3">Producto Marketplace</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Total línea</th>
                <th className="px-4 py-3">Producto Krono</th>
                <th className="px-4 py-3">Tracking</th>
              </tr>
            </thead>

            <tbody>
              {detalles.map((detalle) => (
                <tr key={detalle.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {detalle.sku_seller || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {detalle.sku_marketplace || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {detalle.nombre_marketplace || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {Number(detalle.cantidad || 0)}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {formatearMonto(detalle.precio_unitario, orden.moneda)}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {formatearMonto(detalle.total_linea, orden.moneda)}
                  </td>

                  <td className="px-4 py-3">
                    {detalle.mapeado ? (
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-800">
                        {detalle.producto_krono_nombre || "Mapeado"}
                      </span>
                    ) : (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800">
                        Sin mapear
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {detalle.tracking_code || "-"}
                  </td>
                </tr>
              ))}

              {detalles.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Esta orden no tiene productos importados.
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