"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

type Props = {
  ordenId: string
  estadoKrono: string
}

export default function ProcesarOrdenButton({ ordenId, estadoKrono }: Props) {
  const router = useRouter()

  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const puedeProcesar =
    estadoKrono === "lista_para_procesar" || estadoKrono === "error_stock"

  async function procesarOrden() {
    const confirmar = window.confirm(
      estadoKrono === "error_stock"
        ? "Esta orden tiene error de stock. Si tienes activo el permiso temporal, se procesará y podría dejar stock negativo. ¿Deseas continuar?"
        : "¿Seguro que deseas procesar esta orden? Esto creará la venta y descontará stock real."
    )

    if (!confirmar) return

    setProcesando(true)
    setMensaje(null)
    setError(null)

    try {
      const { data, error } = await supabase.rpc(
        "procesar_orden_importada_falabella",
        {
          p_orden_importada_id: ordenId,
        }
      )

      if (error) {
        setError(error.message)
        setProcesando(false)
        return
      }

      if (!data?.ok) {
        setError(data?.error || "No se pudo procesar la orden.")
        setProcesando(false)
        return
      }

      setMensaje("✅ Venta procesada correctamente. Volviendo a la lista...")

      setTimeout(() => {
        router.push("/ventas/importadas")
        router.refresh()
      }, 1500)
    } catch {
      setError("Ocurrió un error inesperado al procesar la orden.")
      setProcesando(false)
    }
  }

  if (estadoKrono === "procesada") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Esta orden ya fue procesada como venta.
      </div>
    )
  }

  if (!puedeProcesar) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        Esta orden no está lista para procesar. Estado actual:{" "}
        <strong>{estadoKrono}</strong>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Procesar venta
        </h3>

        <p className="text-sm text-slate-600">
          Esto creará la venta real y descontará stock del almacén configurado.
        </p>

        {estadoKrono === "error_stock" && (
          <p className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Esta orden tiene error de stock. Puedes procesarla solo si tienes
            activo el permiso temporal para stock negativo.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={procesarOrden}
        disabled={procesando}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {procesando ? "Procesando..." : "Procesar venta"}
      </button>

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  )
}