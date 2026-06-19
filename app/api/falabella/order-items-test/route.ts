import { NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

const ORDER_ID_PRUEBA = "5001810462"

function crearFirma(params: Record<string, string>, apiKey: string) {
  const ordenado = Object.keys(params)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&")

  return crypto.createHmac("sha256", apiKey).update(ordenado).digest("hex")
}

function extraerValor(xml: string, etiqueta: string) {
  const regex = new RegExp(`<${etiqueta}>(.*?)</${etiqueta}>`, "s")
  const resultado = xml.match(regex)
  return resultado?.[1]?.trim() || ""
}

function extraerBloquesItems(xml: string) {
  const bloques = xml.match(/<OrderItem>[\s\S]*?<\/OrderItem>/g)
  return bloques || []
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

function extraerTodosLosTags(xml: string) {
  const tags: Record<string, string> = {}
  const regex = /<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g

  let match

  while ((match = regex.exec(xml)) !== null) {
    const tag = match[1]
    const valor = limpiarTexto(match[2])

    if (!valor.includes("<") && valor !== "") {
      tags[tag] = valor
    }
  }

  return tags
}

export async function GET() {
  try {
    const apiUrl = process.env.FALABELLA_API_URL
    const userId = process.env.FALABELLA_USER_ID
    const apiKey = process.env.FALABELLA_API_KEY

    if (!apiUrl || !userId || !apiKey) {
      return NextResponse.json({
        ok: false,
        error: "Faltan variables de Falabella en .env.local",
        variables: {
          FALABELLA_API_URL: Boolean(apiUrl),
          FALABELLA_USER_ID: Boolean(userId),
          FALABELLA_API_KEY: Boolean(apiKey),
        },
      })
    }

    const params: Record<string, string> = {
      Action: "GetOrderItems",
      Format: "XML",
      Timestamp: new Date().toISOString(),
      UserID: userId,
      Version: "1.0",
      OrderId: ORDER_ID_PRUEBA,
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
      return NextResponse.json({
        ok: false,
        status: response.status,
        mensaje: "Falabella respondió con error.",
        respuesta_falabella: xml,
      })
    }

    const bloquesItems = extraerBloquesItems(xml)

    const items = bloquesItems.map((bloque) => {
      const todosLosCampos = extraerTodosLosTags(bloque)

      return {
        resumen: {
          orderItemId: limpiarTexto(extraerValor(bloque, "OrderItemId")),
          orderId: limpiarTexto(extraerValor(bloque, "OrderId")),

          // Este campo aparentemente es tu SKU Seller
          skuSellerProbable: limpiarTexto(extraerValor(bloque, "Sku")),

          // Estos campos los revisaremos para ubicar el SKU interno de Falabella
          shopSku: limpiarTexto(extraerValor(bloque, "ShopSku")),
          sellerSku: limpiarTexto(extraerValor(bloque, "SellerSku")),
          productId: limpiarTexto(extraerValor(bloque, "ProductId")),
          productSellerId: limpiarTexto(extraerValor(bloque, "ProductSellerId")),

          nombreProducto: limpiarTexto(extraerValor(bloque, "Name")),
          cantidad:
            limpiarTexto(extraerValor(bloque, "Quantity")) ||
            limpiarTexto(extraerValor(bloque, "Qty")) ||
            "1",
          precio: limpiarTexto(extraerValor(bloque, "PaidPrice")),
          estado: limpiarTexto(extraerValor(bloque, "Status")),
          trackingCode: limpiarTexto(extraerValor(bloque, "TrackingCode")),
          packageId: limpiarTexto(extraerValor(bloque, "PackageId")),
          shipmentProvider: limpiarTexto(extraerValor(bloque, "ShipmentProvider")),
        },

        todosLosCamposDetectados: todosLosCampos,

        xmlCrudoDelItem: bloque,
      }
    })

    return NextResponse.json({
      ok: true,
      status: response.status,
      mensaje:
        "Items leídos correctamente. Esta versión muestra todos los campos para identificar SKUs.",
      orderIdConsultado: ORDER_ID_PRUEBA,
      totalItems: items.length,
      items,
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    })
  }
}