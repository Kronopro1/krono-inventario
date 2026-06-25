import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en .env.local.",
      },
      { status: 500 }
    )
  }

  const mensaje = [
    "🎉 FELICIDADES, RECIBISTE UNA NUEVA ORDEN",
    "",
    "Orden: 3241772069",
    "SKU Falabella + Empresa: GSS Express - SKU-DE-PRUEBA",
    "Nombre de SKU: Producto de prueba",
    "Producto: Detalle de producto de prueba",
    "Fecha prometida: Prueba Telegram Krono",
  ].join("\n")

  const respuesta = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
      }),
    }
  )

  const resultado = await respuesta.json().catch(() => null)

  if (!respuesta.ok || resultado?.ok === false) {
    return NextResponse.json(
      {
        ok: false,
        error: "Telegram no pudo enviar el mensaje.",
        status: respuesta.status,
        resultado,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    mensaje: "Mensaje enviado correctamente a Telegram.",
    chat_id: chatId,
    resultado,
  })
}
