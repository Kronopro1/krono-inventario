import { NextResponse } from "next/server"
import { enviarMensajeTelegram } from "@/src/lib/telegram"

export const dynamic = "force-dynamic"

export async function GET() {
  const mensaje = [
    "🎉 FELICIDADES, RECIBISTE UNA NUEVA ORDEN",
    "",
    "Orden: 3241772069",
    "SKU Falabella + Empresa: GSS Express - SKU-DE-PRUEBA",
    "Nombre de SKU: Producto de prueba",
    "Producto: Detalle de producto de prueba",
    "Fecha prometida: Prueba Telegram Krono",
  ].join("\n")

  const resultado = await enviarMensajeTelegram({ mensaje })

  if (!resultado.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: resultado.error,
        resultado,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    mensaje: "Mensaje enviado correctamente a Telegram usando src/lib/telegram.ts.",
    resultado,
  })
}
