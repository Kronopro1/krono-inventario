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

export async function GET() {
  try {
    const apiUrl = process.env.FALABELLA_API_URL
    const userId = process.env.FALABELLA_USER_ID
    const apiKey = process.env.FALABELLA_API_KEY

    if (!apiUrl || !userId || !apiKey) {
      return NextResponse.json({
        ok: false,
        error: "Faltan variables de Falabella en .env.local",
        ejemplo: {
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

    const urlFinal = `${apiUrl}?${query.toString()}`

    const response = await fetch(urlFinal, {
      method: "GET",
      cache: "no-store",
    })

    const texto = await response.text()

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      accion: "GetOrders",
      mensaje: response.ok
        ? "Krono se conectó con Falabella."
        : "Falabella respondió, pero con error.",
      respuesta_falabella: texto,
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    })
  }
}