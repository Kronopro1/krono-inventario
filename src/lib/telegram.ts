type EnviarTelegramParams = {
  mensaje: string
}

export async function enviarMensajeTelegram({
  mensaje,
}: EnviarTelegramParams) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return {
      ok: false,
      error: "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID.",
    }
  }

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
    return {
      ok: false,
      error: "Telegram no pudo enviar el mensaje.",
      status: respuesta.status,
      resultado,
    }
  }

  return {
    ok: true,
    resultado,
  }
}
