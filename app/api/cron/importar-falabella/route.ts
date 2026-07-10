import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  const esLocal = process.env.NODE_ENV !== "production"

  if (!esLocal) {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          ok: false,
          error: "No autorizado.",
        },
        { status: 401 }
      )
    }
  }

  try {
    const urlImportacion = new URL(
      "/api/falabella/importar-ordenes",
      request.url
    )

    urlImportacion.searchParams.set("limit", "30")

    const respuestaImportacion = await fetch(urlImportacion.toString(), {
      method: "GET",
      cache: "no-store",
    })

    const resultadoImportacion = await respuestaImportacion
      .json()
      .catch(() => null)

    if (!respuestaImportacion.ok || resultadoImportacion?.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error: "Falló la importación automática de Falabella.",
          resultado_importacion: resultadoImportacion,
        },
        { status: 500 }
      )
    }

    const urlDropshipping = new URL(
      "/api/falabella/procesar-dropshipping-auto",
      request.url
    )

    const respuestaDropshipping = await fetch(urlDropshipping.toString(), {
      method: "GET",
      cache: "no-store",
    })

    const resultadoDropshipping = await respuestaDropshipping
      .json()
      .catch(() => null)

    if (!respuestaDropshipping.ok || resultadoDropshipping?.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La importación terminó, pero falló el procesamiento automático Dropshipping.",
          resultado_importacion: resultadoImportacion,
          resultado_dropshipping: resultadoDropshipping,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      mensaje:
        "Cron Falabella ejecutado correctamente: importación + Dropshipping automático.",
      ejecutado_en: new Date().toISOString(),
      resultado_importacion: resultadoImportacion,
      resultado_dropshipping: resultadoDropshipping,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido ejecutando cron Falabella.",
      },
      { status: 500 }
    )
  }
}
