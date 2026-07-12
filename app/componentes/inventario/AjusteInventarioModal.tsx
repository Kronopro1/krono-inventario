"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

export type AlmacenAjuste = {
  almacen_id: string
  almacen_nombre: string
  stock_actual: number
}

type AjusteInventarioModalProps = {
  abierto: boolean
  productoNombre: string
  productoSku: string
  almacenes: AlmacenAjuste[]
  onClose: () => void
  onConfirmar: (datos: {
    almacenId: string
    tipoAjuste: "aumentar" | "disminuir" | "establecer"
    cantidad: number
    motivo: string
  }) => Promise<void> | void
}

export default function AjusteInventarioModal({
  abierto,
  productoNombre,
  productoSku,
  almacenes,
  onClose,
  onConfirmar,
}: AjusteInventarioModalProps) {
  const [almacenId, setAlmacenId] = useState("")
  const [tipoAjuste, setTipoAjuste] = useState<
    "aumentar" | "disminuir" | "establecer"
  >("aumentar")
  const [cantidad, setCantidad] = useState("")
  const [motivo, setMotivo] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!abierto) return

    setAlmacenId(almacenes[0]?.almacen_id ?? "")
    setTipoAjuste("aumentar")
    setCantidad("")
    setMotivo("")
    setError("")
  }, [abierto, almacenes])

  if (!abierto) return null

  const almacenSeleccionado = almacenes.find(
    (almacen) => almacen.almacen_id === almacenId
  )

  async function confirmarAjuste() {
    const cantidadNumerica = Number(cantidad)

    if (!almacenId) {
      setError("Selecciona un almacén.")
      return
    }

    if (!Number.isFinite(cantidadNumerica) || cantidadNumerica < 0) {
      setError("Ingresa una cantidad válida.")
      return
    }

    if (!motivo.trim()) {
      setError("Ingresa el motivo del ajuste.")
      return
    }

    try {
      setGuardando(true)
      setError("")

      await onConfirmar({
        almacenId,
        tipoAjuste,
        cantidad: cantidadNumerica,
        motivo: motivo.trim(),
      })

      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el ajuste."
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ajuste de inventario
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {productoNombre}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              SKU: {productoSku}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Almacén
            </label>

            <select
              value={almacenId}
              onChange={(event) => setAlmacenId(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {almacenes.map((almacen) => (
                <option
                  key={almacen.almacen_id}
                  value={almacen.almacen_id}
                >
                  {almacen.almacen_nombre}
                </option>
              ))}
            </select>

            {almacenSeleccionado && (
              <p className="mt-2 text-sm text-slate-500">
                Stock actual:{" "}
                <span className="font-semibold text-slate-900">
                  {almacenSeleccionado.stock_actual}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipo de ajuste
            </label>

            <select
              value={tipoAjuste}
              onChange={(event) =>
                setTipoAjuste(
                  event.target.value as
                    | "aumentar"
                    | "disminuir"
                    | "establecer"
                )
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="aumentar">Aumentar stock</option>
              <option value="disminuir">Disminuir stock</option>
              <option value="establecer">Establecer cantidad exacta</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cantidad
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={cantidad}
              onChange={(event) => setCantidad(event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Motivo
            </label>

            <textarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Ejemplo: Corrección por conteo físico"
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmarAjuste}
            disabled={guardando}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Confirmar ajuste"}
          </button>
        </div>
      </div>
    </div>
  )
}
