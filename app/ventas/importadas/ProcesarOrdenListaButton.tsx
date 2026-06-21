"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

type Props = {
  ordenId: string
  estadoKrono: string
  orderNumber?: string | null
}

export default function ProcesarOrdenListaButton({
  ordenId,
  estadoKrono,
  orderNumber,
}: Props) {
  const router = useRouter()
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const puedeProcesar =
    estadoKrono === "lista_para_procesar" || estadoKrono === "error_stock"

  if (!puedeProcesar) {
    return (
      <span className="text-xs font-medium text-gray-400">
        Resolver primero
      </span>
    )
  }

  async function procesarOrden() {
    if (procesando) return

    const confirmar = window.confirm(
      `Seguro que deseas procesar la orden ${
        orderNumber || ""
      }?\n\nEsto creara la venta y descontara stock.`
    )

    if (!confirmar) return

    setProcesando(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "procesar_orden_importada_falabella",
        {
          p_orden_importada_id: ordenId,
        }
      )

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      const resultado = Array.isArray(data) ? data[0] : data

      if (resultado?.ok === false || resultado?.success === false) {
        throw new Error(
          resultado?.error ||
            resultado?.mensaje ||
            "No se pudo procesar la orden."
        )
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setProcesando(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={procesarOrden}
        disabled={procesando}
        className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {procesando ? "Procesando..." : "Procesar"}
      </button>

      {error ? (
        <div className="max-w-[220px] text-right text-xs font-medium text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  )
}
