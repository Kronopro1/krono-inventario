import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export const dynamic = "force-dynamic"

type OrdenImportada = {
  orderId: string
  orderNumber: string
  fecha: string
  cliente: string
  estado: string
  total: number
  itemsCount: number
  paymentMethod: string
  shippingType: string
  ciudad: string
  region: string
  raw: Record<string, string>
}

type OrdenDetalleCompleto = {
  clienteDocumento: string
  shippingAddress1: string
  shippingAddress2: string
  shippingAddress3: string
  shippingAddress4: string
  shippingAddress5: string
  shippingWard: string
  shippingPostcode: string
  shippingCountry: string
  billingAddress1: string
  billingAddress2: string
  billingAddress3: string
  billingWard: string
  billingPostcode: string
  promisedShippingTime: string
  productTotal: number
  shippingFeeTotal: number
  invoiceRequired: boolean
  operatorCode: string
  extraAttributes: Record<string, unknown> | null
  extraBillingAttributes: Record<string, string>
  raw: Record<string, string>
}

type ItemImportado = {
  orderItemId: string
  orderId: string
  skuSeller: string
  skuMarketplace: string
  nombre: string
  cantidad: number
  precio: number
  estado: string
  trackingCode: string
  packageId: string
  shipmentProvider: string
  raw: Record<string, string>
}

function crearFirma(params: Record<string, string>, apiKey: string) {
  const ordenado = Object.keys(params)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&")

  return crypto.createHmac("sha256", apiKey).update(ordenado).digest("hex")
}

function limpiarTexto(valor: string) {
  return valor
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}

function extraerValor(xml: string, etiqueta: string) {
  const regex = new RegExp(`<${etiqueta}>(.*?)</${etiqueta}>`, "s")
  const resultado = xml.match(regex)
  return limpiarTexto(resultado?.[1]?.trim() || "")
}

function extraerBloque(xml: string, etiqueta: string) {
  const regex = new RegExp(`<${etiqueta}>[\\s\\S]*?<\\/${etiqueta}>`, "s")
  const resultado = xml.match(regex)
  return resultado?.[0] || ""
}

function extraerBloques(xml: string, etiqueta: string) {
  const regex = new RegExp(`<${etiqueta}>[\\s\\S]*?<\\/${etiqueta}>`, "g")
  return xml.match(regex) || []
}

function numero(valor: string, defecto = 0) {
  const limpio = valor.replace(",", ".").trim()
  const convertido = Number(limpio)
  return Number.isFinite(convertido) ? convertido : defecto
}

function booleano(valor: string) {
  return valor.toLowerCase() === "true" || valor === "1"
}

function jsonSeguro(valor: string) {
  if (!valor) return null

  try {
    return JSON.parse(valor)
  } catch {
    return null
  }
}

function extraerCamposSimples(xml: string) {
  const campos: Record<string, string> = {}
  const regex = /<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g

  let match

  while ((match = regex.exec(xml)) !== null) {
    const etiqueta = match[1]
    const valor = limpiarTexto(match[2])

    if (!valor.includes("<")) {
      campos[etiqueta] = valor
    }
  }

  return campos
}

async function llamarFalabella(paramsBase: Record<string, string>) {
  const apiUrl = process.env.FALABELLA_API_URL
  const userId = process.env.FALABELLA_USER_ID
  const apiKey = process.env.FALABELLA_API_KEY

  if (!apiUrl || !userId || !apiKey) {
    throw new Error("Faltan variables de entorno de Falabella.")
  }

  const params: Record<string, string> = {
    Format: "XML",
    Timestamp: new Date().toISOString(),
    UserID: userId,
    Version: "1.0",
    ...paramsBase,
  }

  const signature = crearFirma(params, apiKey)

  const query = new URLSearchParams({
    ...params,
    Signature: signature,
  })

  const response = await fetch(`${apiUrl}?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
  })

  const xml = await response.text()

  if (!response.ok) {
    throw new Error(`Falabella respondió con error ${response.status}: ${xml}`)
  }

  return xml
}

function parsearOrdenes(xml: string): OrdenImportada[] {
  const bloquesOrdenes = extraerBloques(xml, "Order")

  return bloquesOrdenes.map((bloque) => {
    const firstName = extraerValor(bloque, "CustomerFirstName")
    const lastName = extraerValor(bloque, "CustomerLastName")
    const campos = extraerCamposSimples(bloque)

    return {
      orderId: extraerValor(bloque, "OrderId"),
      orderNumber: extraerValor(bloque, "OrderNumber"),
      fecha: extraerValor(bloque, "CreatedAt"),
      cliente: `${firstName} ${lastName}`.trim(),
      estado: extraerValor(bloque, "Status"),
      total: numero(extraerValor(bloque, "GrandTotal")),
      itemsCount: numero(extraerValor(bloque, "ItemsCount")),
      paymentMethod: extraerValor(bloque, "PaymentMethod"),
      shippingType: extraerValor(bloque, "ShippingType"),
      ciudad: extraerValor(bloque, "City"),
      region: extraerValor(bloque, "Region"),
      raw: campos,
    }
  })
}

function parsearOrdenCompleta(xml: string): OrdenDetalleCompleto {
  const bloqueOrden = extraerBloque(xml, "Order")
  const shipping = extraerBloque(bloqueOrden, "AddressShipping")
  const billing = extraerBloque(bloqueOrden, "AddressBilling")
  const extraBilling = extraerBloque(bloqueOrden, "ExtraBillingAttributes")

  return {
    clienteDocumento: extraerValor(bloqueOrden, "NationalRegistrationNumber"),

    shippingAddress1: extraerValor(shipping, "Address1"),
    shippingAddress2: extraerValor(shipping, "Address2"),
    shippingAddress3: extraerValor(shipping, "Address3"),
    shippingAddress4: extraerValor(shipping, "Address4"),
    shippingAddress5: extraerValor(shipping, "Address5"),
    shippingWard: extraerValor(shipping, "Ward"),
    shippingPostcode: extraerValor(shipping, "PostCode"),
    shippingCountry: extraerValor(shipping, "Country"),

    billingAddress1: extraerValor(billing, "Address1"),
    billingAddress2: extraerValor(billing, "Address2"),
    billingAddress3: extraerValor(billing, "Address3"),
    billingWard: extraerValor(billing, "Ward"),
    billingPostcode: extraerValor(billing, "PostCode"),

    promisedShippingTime: extraerValor(bloqueOrden, "PromisedShippingTime"),
    productTotal: numero(extraerValor(bloqueOrden, "ProductTotal")),
    shippingFeeTotal: numero(extraerValor(bloqueOrden, "ShippingFeeTotal")),
    invoiceRequired: booleano(extraerValor(bloqueOrden, "InvoiceRequired")),
    operatorCode: extraerValor(bloqueOrden, "OperatorCode"),

    extraAttributes: jsonSeguro(extraerValor(bloqueOrden, "ExtraAttributes")),
    extraBillingAttributes: extraerCamposSimples(extraBilling),
    raw: extraerCamposSimples(bloqueOrden),
  }
}

function parsearItems(xml: string): ItemImportado[] {
  const bloquesItems = extraerBloques(xml, "OrderItem")

  return bloquesItems.map((bloque) => {
    const cantidad =
      numero(extraerValor(bloque, "Quantity"), 0) ||
      numero(extraerValor(bloque, "Qty"), 0) ||
      1

    const precio = numero(extraerValor(bloque, "PaidPrice"))
    const campos = extraerCamposSimples(bloque)

    return {
      orderItemId: extraerValor(bloque, "OrderItemId"),
      orderId: extraerValor(bloque, "OrderId"),
      skuSeller: extraerValor(bloque, "Sku"),
      skuMarketplace: extraerValor(bloque, "ShopSku"),
      nombre: extraerValor(bloque, "Name"),
      cantidad,
      precio,
      estado: extraerValor(bloque, "Status"),
      trackingCode: extraerValor(bloque, "TrackingCode"),
      packageId: extraerValor(bloque, "PackageId"),
      shipmentProvider: extraerValor(bloque, "ShipmentProvider"),
      raw: campos,
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        ok: false,
        error:
          "Faltan variables de Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const searchParams = request.nextUrl.searchParams
    const limit = Number(searchParams.get("limit") || "10")

    const ahora = new Date()
    const hace30Dias = new Date()
    hace30Dias.setDate(ahora.getDate() - 30)

    const xmlOrdenes = await llamarFalabella({
      Action: "GetOrders",
      CreatedAfter: hace30Dias.toISOString(),
    })

    const ordenes = parsearOrdenes(xmlOrdenes).slice(0, limit)

    let ordenesImportadas = 0
    let ordenesActualizadas = 0
    let detallesImportados = 0
    let detallesMapeados = 0
    let detallesCompletosLeidos = 0

    const errores: string[] = []

    for (const orden of ordenes) {
      try {
        if (!orden.orderId || !orden.orderNumber) {
          errores.push("Orden sin OrderId u OrderNumber. Se omitió.")
          continue
        }

        const { data: ordenExistente } = await supabase
          .from("ordenes_importadas")
          .select("id, estado_krono")
          .eq("marketplace", "Falabella")
          .eq("order_id_marketplace", orden.orderId)
          .maybeSingle()

        const estadoKronoInicial =
          ordenExistente?.estado_krono === "procesada"
            ? "procesada"
            : "pendiente_mapeo"

        let detalleCompleto: OrdenDetalleCompleto | null = null

        try {
          const xmlOrdenCompleta = await llamarFalabella({
            Action: "GetOrder",
            OrderId: orden.orderId,
          })

          detalleCompleto = parsearOrdenCompleta(xmlOrdenCompleta)
          detallesCompletosLeidos += 1
        } catch (error: any) {
          errores.push(
            `No se pudo leer GetOrder para ${orden.orderNumber}: ${error.message}`
          )
        }

        const { data: ordenGuardada, error: errorOrden } = await supabase
          .from("ordenes_importadas")
          .upsert(
            {
              marketplace: "Falabella",
              order_id_marketplace: orden.orderId,
              order_number_marketplace: orden.orderNumber,

              cliente_nombre: orden.cliente,
              cliente_ciudad: orden.ciudad,
              cliente_region: orden.region,
              cliente_documento: detalleCompleto?.clienteDocumento || null,

              shipping_address1: detalleCompleto?.shippingAddress1 || null,
              shipping_address2: detalleCompleto?.shippingAddress2 || null,
              shipping_address3: detalleCompleto?.shippingAddress3 || null,
              shipping_address4: detalleCompleto?.shippingAddress4 || null,
              shipping_address5: detalleCompleto?.shippingAddress5 || null,
              shipping_ward: detalleCompleto?.shippingWard || null,
              shipping_postcode: detalleCompleto?.shippingPostcode || null,
              shipping_country: detalleCompleto?.shippingCountry || null,

              billing_address1: detalleCompleto?.billingAddress1 || null,
              billing_address2: detalleCompleto?.billingAddress2 || null,
              billing_address3: detalleCompleto?.billingAddress3 || null,
              billing_ward: detalleCompleto?.billingWard || null,
              billing_postcode: detalleCompleto?.billingPostcode || null,

              estado_marketplace: orden.estado,
              estado_krono: estadoKronoInicial,

              total: orden.total,
              moneda: "PEN",
              product_total: detalleCompleto?.productTotal || 0,
              shipping_fee_total: detalleCompleto?.shippingFeeTotal || 0,

              items_count: orden.itemsCount,
              payment_method: orden.paymentMethod,
              shipping_type: orden.shippingType,

              promised_shipping_time:
                detalleCompleto?.promisedShippingTime || null,

              invoice_required: detalleCompleto?.invoiceRequired || false,
              operator_code: detalleCompleto?.operatorCode || null,
              extra_attributes: detalleCompleto?.extraAttributes || null,
              extra_billing_attributes:
                detalleCompleto?.extraBillingAttributes || null,

              fecha_orden: orden.fecha || null,
              raw_data: detalleCompleto?.raw || orden.raw,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "marketplace,order_id_marketplace",
            }
          )
          .select("id")
          .single()

        if (errorOrden || !ordenGuardada) {
          errores.push(
            `No se pudo guardar la orden ${orden.orderNumber}: ${
              errorOrden?.message || "sin detalle"
            }`
          )
          continue
        }

        if (ordenExistente) {
          ordenesActualizadas += 1
        } else {
          ordenesImportadas += 1
        }

        const xmlItems = await llamarFalabella({
          Action: "GetOrderItems",
          OrderId: orden.orderId,
        })

        const items = parsearItems(xmlItems)

        let totalItemsOrden = 0
        let totalMapeadosOrden = 0

        for (const item of items) {
          totalItemsOrden += 1

          const { data: mapeo } = await supabase
            .from("mapeo_skus_marketplace")
            .select("producto_krono_id, producto_krono_nombre")
            .eq("marketplace", "Falabella")
            .eq("sku_seller", item.skuSeller)
            .eq("activo", true)
            .maybeSingle()

          const estaMapeado = Boolean(mapeo?.producto_krono_id)

          if (estaMapeado) {
            detallesMapeados += 1
            totalMapeadosOrden += 1
          }

          const { error: errorDetalle } = await supabase
            .from("ordenes_importadas_detalle")
            .upsert(
              {
                orden_importada_id: ordenGuardada.id,
                marketplace: "Falabella",
                order_item_id_marketplace: item.orderItemId,
                sku_seller: item.skuSeller,
                sku_marketplace: item.skuMarketplace,
                nombre_marketplace: item.nombre,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                total_linea: item.cantidad * item.precio,
                estado_item_marketplace: item.estado,
                tracking_code: item.trackingCode,
                package_id: item.packageId,
                shipment_provider: item.shipmentProvider,
                producto_krono_id: mapeo?.producto_krono_id || null,
                producto_krono_nombre: mapeo?.producto_krono_nombre || null,
                mapeado: estaMapeado,
                raw_data: item.raw,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "orden_importada_id,order_item_id_marketplace",
              }
            )

          if (errorDetalle) {
            errores.push(
              `No se pudo guardar item ${item.orderItemId} de la orden ${orden.orderNumber}: ${errorDetalle.message}`
            )
          } else {
            detallesImportados += 1
          }
        }

        const nuevoEstado =
          totalItemsOrden > 0 && totalItemsOrden === totalMapeadosOrden
            ? "lista_para_procesar"
            : "pendiente_mapeo"

        if (estadoKronoInicial !== "procesada") {
          await supabase
            .from("ordenes_importadas")
            .update({
              estado_krono: nuevoEstado,
              updated_at: new Date().toISOString(),
            })
            .eq("id", ordenGuardada.id)
        }
      } catch (error: any) {
        errores.push(
          `Error procesando orden ${orden.orderNumber || orden.orderId}: ${
            error.message
          }`
        )
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Importación de órdenes Falabella finalizada.",
      resumen: {
        limite_usado: limit,
        ordenes_leidas_desde_falabella: ordenes.length,
        ordenes_nuevas: ordenesImportadas,
        ordenes_actualizadas: ordenesActualizadas,
        detalles_completos_get_order: detallesCompletosLeidos,
        detalles_importados_o_actualizados: detallesImportados,
        detalles_mapeados: detallesMapeados,
        errores: errores.length,
      },
      errores,
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    })
  }
}