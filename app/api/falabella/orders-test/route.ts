import { NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function crearFirma(params: Record<string, string>, apiKey: string) {
  const ordenado = Object.keys(params)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&")

  return crypto
    .createHmac("sha256", apiKey)
    .update(ordenado)
    .digest("hex")
}

function extraerValor(xml: string, etiqueta: string) {
  const regex = new RegExp(`<${etiqueta}>(.*?)</${etiqueta}>`, "s")
  const resultado = xml.match(regex)
  return resultado?.[1]?.trim() || ""
}

function extraerBloquesOrdenes(xml: string) {
  const bloques = xml.match(/<Order>[\s\S]*?<\/Order>/g)
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

    const ahora = new Date()
    const hace30Dias = new Date()
    hace30Dias.setDate(ahora.getDate() - 30)

    const params: Record<string, string> = {
      Action: "GetOrders",
      Format: "XML",
      Timestamp: ahora.toISOString(),
      UserID: userId,
      Version: "1.0",
      CreatedAfter: hace30Dias.toISOString(),
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

    const bloquesOrdenes = extraerBloquesOrdenes(xml)

    const ordenes = bloquesOrdenes.map((bloque) => {
      const firstName = limpiarTexto(extraerValor(bloque, "CustomerFirstName"))
      const lastName = limpiarTexto(extraerValor(bloque, "CustomerLastName"))

      return {
        orderId: limpiarTexto(extraerValor(bloque, "OrderId")),
        orderNumber: limpiarTexto(extraerValor(bloque, "OrderNumber")),
        fecha: limpiarTexto(extraerValor(bloque, "CreatedAt")),
        cliente: `${firstName} ${lastName}`.trim(),
        estado: limpiarTexto(extraerValor(bloque, "Status")),
        total: limpiarTexto(extraerValor(bloque, "GrandTotal")),
        itemsCount: limpiarTexto(extraerValor(bloque, "ItemsCount")),
        paymentMethod: limpiarTexto(extraerValor(bloque, "PaymentMethod")),
        shippingType: limpiarTexto(extraerValor(bloque, "ShippingType")),
        ciudad: limpiarTexto(extraerValor(bloque, "City")),
        region: limpiarTexto(extraerValor(bloque, "Region")),
      }
    })

    return NextResponse.json({
      ok: true,
      status: response.status,
      mensaje: "Órdenes leídas correctamente desde Falabella.",
      total: ordenes.length,
      ordenes,
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    })
  }
}