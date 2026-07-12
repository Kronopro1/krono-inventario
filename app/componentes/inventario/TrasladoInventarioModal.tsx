"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, X } from "lucide-react"

export type AlmacenTraslado = {
  almacen_id: string
  almacen_nombre: string
  stock_actual: number
}

type TrasladoInventarioModalProps = {
  abierto: boolean
  productoNombre: string
  productoSku: string
  almacenes: AlmacenTraslado[]
  onClose: () => void
  onConfirmar: (datos: {
    almacenOrigenId: string
    almacenDestinoId: string
    cantidad: number
    motivo: string
  }) => Promise<void> | void
}

export default function TrasladoInventarioModal({
  abierto,
  productoNombre,
  productoSku,
  almacenes,
  onClose,
  onConfirmar,
}: TrasladoInventarioModalProps) {
  const [almacenOrigenId, setAlmacenOrigenId] = useState("")
  const [almacenDestinoId, setAlmacenDestinoId] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [motivo, setMotivo] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!abierto) return

    setAlmacenOrigenId(almacenes[0]?.almacen_id ?? "")
    setAlmacenDestinoId(almacenes[1]?.almacen_id ?? "")
    setCantidad("")
    setMotivo("")
    setError("")
  }, [abierto, almacenes])

  const almacenOrigen = useMemo(
    () =>
      almacenes.find(
        (almacen) => almacen.almacen_id === almacenOrigenId
      ),
    [almacenes, almacenOrigenId]
  )

  const almacenDestino = useMemo(
    () =>
      almacenes.find(
        (almacen) => almacen.almacen_id === almacenDestinoId
      ),
    [almacenes, almacenDestinoId]
  )

  const cantidadNumerica = Number(cantidad || 0)

  const stockOrigenPosterior =
    (almacenOrigen?.stock_actual ?? 0) - cantidadNumerica

  const stockDestinoPosterior =
    (almacenDestino?.stock_actual ?? 0) + cantidadNumerica

  async function confirmarTraslado() {
    if (!almacenOrigenId) {
      setError("Selecciona el almacén de origen.")
      return
    }

    if (!almacenDestinoId) {
      setError("Selecciona el almacén de destino.")
      return
    }

    if (almacenOrigenId === almacenDestinoId) {
      setError("El almacén de origen y destino deben ser diferentes.")
      return
    }

    if (
      !Number.isFinite(cantidadNumerica) ||
      cantidadNumerica <= 0
    ) {
      setError("Ingresa una cantidad mayor que cero.")
      return
    }

    if (
      almacenOrigen &&
      cantidadNumerica > almacenOrigen.stock_actual
    ) {
      setError("El almacén de origen no tiene stock suficiente.")
      return
    }

    if (!motivo.trim()) {
      setError("Ingresa el motivo del traslado.")
      return
    }

    try {
      setGuardando(true)
      setError("")

      await onConfirmar({
        almacenOrigenId,
        almacenDestinoId,
        cantidad: cantidadNumerica,
        motivo: motivo.trim(),
      })

      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el traslado."
      )
    } finally {
      setGuardando(false)
    }
  }

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Traslado de inventario
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Desde
              </label>

              <select
                value={almacenOrigenId}
                onChange={(event) =>
                  setAlmacenOrigenId(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Selecciona un almacén</option>

                {almacenes.map((almacen) => (
                  <option
                    key={almacen.almacen_id}
                    value={almacen.almacen_id}
                  >
                    {almacen.almacen_nombre}
                  </option>
                ))}
              </select>

              {almacenOrigen && (
                <p className="mt-2 text-sm text-slate-500">
                  Stock actual:{" "}
                  <span className="font-semibold text-slate-900">
                    {almacenOrigen.stock_actual}
                  </span>
                </p>
              )}
            </div>

            <div className="hidden justify-center pb-3 text-slate-400 md:flex">
              <ArrowRight size={22} />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hacia
              </label>

              <select
                value={almacenDestinoId}
                onChange={(event) =>
                  setAlmacenDestinoId(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Selecciona un almacén</option>

                {almacenes.map((almacen) => (
                  <option
                    key={almacen.almacen_id}
                    value={almacen.almacen_id}
                  >
                    {almacen.almacen_nombre}
                  </option>
                ))}
              </select>

              {almacenDestino && (
                <p className="mt-2 text-sm text-slate-500">
                  Stock actual:{" "}
                  <span className="font-semibold text-slate-900">
                    {almacenDestino.stock_actual}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cantidad
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(event) => setCantidad(event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {almacenOrigen && almacenDestino && cantidadNumerica > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Origen después
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {stockOrigenPosterior}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Destino después
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {stockDestinoPosterior}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Motivo
            </label>

            <textarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Ejemplo: Reposición de inventario FBF"
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
            onClick={confirmarTraslado}
            disabled={guardando}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? "Trasladando..." : "Confirmar traslado"}
          </button>
        </div>
      </div>
    </div>
  )
}