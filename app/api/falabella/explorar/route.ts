import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

const ACCIONES_PERMITIDAS = [
  "GetOrders",
  "GetOrderComments",
  "GetOrder",
  "GetOrderItems",
  "GetMultipleOrderItems",
  "GetProducts",
  "GetStock",
  "FetchStock",
  "GetShipmentProviders",
  "GetManifestList",
  "GetManifestDocument",
  "GetDocument",
  "GetMetrics",
  "GetStatistics",
  "GetPayoutStatus",
  "GetQcStatus",
  "GetWarehouse",
  "GetWebhooks",
  "GetWebhookEntities",
]

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

function extraerTags(xml: string) {
  const tags: Record<string, string[]> = {}
  const regex = /<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g

  let match

  while ((match = regex.exec(xml)) !== null) {
    const tag = match[1]
    const valor = limpiarTexto(match[2])

    if (!tags[tag]) {
      tags[tag] = []
    }

    if (!valor.includes("<") && valor !== "") {
      tags[tag].push(valor)
    }
  }

  return tags
}

function limitarValores(tags: Record<string, string[]>) {
  const resultado: Record<string, string[]> = {}

  for (const [tag, valores] of Object.entries(tags)) {
    resultado[tag] = valores.slice(0, 5)
  }

  return resultado
}

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams

    const action = searchParams.get("action") || "GetOrder"
    const orderId = searchParams.get("orderId") || ""
    const orderItemIds = searchParams.get("orderItemIds") || ""
    const limit = searchParams.get("limit") || "10"
    const createdAfter = searchParams.get("createdAfter") || ""
    const createdBefore = searchParams.get("createdBefore") || ""

    if (!ACCIONES_PERMITIDAS.includes(action)) {
      return NextResponse.json({
        ok: false,
        error: "Acción no permitida en este explorador.",
        action_recibida: action,
        acciones_permitidas: ACCIONES_PERMITIDAS,
      })
    }

    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)

    const params: Record<string, string> = {
      Action: action,
      Format: "XML",
      Timestamp: new Date().toISOString(),
      UserID: userId,
      Version: "1.0",
    }

    if (action === "GetOrders") {
      params.CreatedAfter = createdAfter || hace30Dias.toISOString()

      if (createdBefore) {
        params.CreatedBefore = createdBefore
      }

      params.Limit = limit
    }

    if (action === "GetOrder") {
      if (!orderId) {
        return NextResponse.json({
          ok: false,
          error: "Para GetOrder debes enviar orderId.",
          ejemplo:
            "/api/falabella/explorar?action=GetOrder&orderId=5001810462",
        })
      }

      params.OrderId = orderId
    }

    if (action === "GetOrderItems") {
      if (!orderId) {
        return NextResponse.json({
          ok: false,
          error: "Para GetOrderItems debes enviar orderId.",
          ejemplo:
            "/api/falabella/explorar?action=GetOrderItems&orderId=5001810462",
        })
      }

      params.OrderId = orderId
    }

    if (action === "GetMultipleOrderItems") {
      if (!orderItemIds) {
        return NextResponse.json({
          ok: false,
          error:
            "Para GetMultipleOrderItems debes enviar orderItemIds separados por coma.",
          ejemplo:
            "/api/falabella/explorar?action=GetMultipleOrderItems&orderItemIds=52898658",
        })
      }

      params.OrderItemIds = orderItemIds
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
    const tagsDetectados = extraerTags(xml)

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      action,
      parametros_usados: {
        action,
        orderId: orderId || null,
        orderItemIds: orderItemIds || null,
        limit: action === "GetOrders" ? limit : null,
      },
      resumen_tags_detectados: limitarValores(tagsDetectados),
      respuesta_xml: xml,
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    })
  }
}