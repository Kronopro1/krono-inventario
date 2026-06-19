"use client"

import { useMemo, useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Combo = {
  id: string
  sku: string
  nombre: string
  tipo: string | null
  precio_venta: number | null
  costo_unitario: number | null
  activo: boolean
}

type Detalle = {
  combo_detalle_id: string
  combo_id: string
  combo_sku: string
  combo_nombre: string
  componente_id: string
  componente_sku: string
  componente_nombre: string
  cantidad: number
}

type Producto = {
  id: string
  sku: string
  nombre: string
  es_combo: boolean
  activo: boolean
}

type Props = {
  combo: Combo
  detalle: Detalle[]
  productos: Producto[]
}

export default function EditarComboForm({
  combo,
  detalle,
  productos,
}: Props) {
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [nombre, setNombre] = useState(combo.nombre)
  const [tipo, setTipo] = useState(combo.tipo || "")
  const [precioVenta, setPrecioVenta] = useState(
    String(combo.precio_venta || 0)
  )
  const [activo, setActivo] = useState(combo.activo)

  const [componentes, setComponentes] = useState(
    detalle.map((item) => ({
      combo_detalle_id: item.combo_detalle_id,
      componente_id: item.componente_id,
      componente_sku: item.componente_sku,
      componente_nombre: item.componente_nombre,
      cantidad: String(item.cantidad),
      eliminar: false,
    }))
  )

  const [nuevoComponenteId, setNuevoComponenteId] = useState("")
  const [nuevaCantidad, setNuevaCantidad] = useState("1")

  const productosDisponibles = useMemo(() => {
    const idsActuales = new Set(
      componentes
        .filter((item) => !item.eliminar)
        .map((item) => item.componente_id)
    )

    return productos.filter((producto) => !idsActuales.has(producto.id))
  }, [productos, componentes])

  function agregarComponente() {
    setMensaje(null)
    setError(null)

    if (!nuevoComponenteId) {
      setError("Selecciona un componente.")
      return
    }

    const producto = productos.find((item) => item.id === nuevoComponenteId)

    if (!producto) {
      setError("No se encontró el producto seleccionado.")
      return
    }

    const cantidadNumero = Number(nuevaCantidad)

    if (!cantidadNumero || cantidadNumero <= 0) {
      setError("La cantidad debe ser mayor a cero.")
      return
    }

    setComponentes((actual) => [
      ...actual,
      {
        combo_detalle_id: `nuevo-${producto.id}`,
        componente_id: producto.id,
        componente_sku: producto.sku,
        componente_nombre: producto.nombre,
        cantidad: String(cantidadNumero),
        eliminar: false,
      },
    ])

    setNuevoComponenteId("")
    setNuevaCantidad("1")
  }

  async function guardarCambios() {
    setGuardando(true)
    setMensaje(null)
    setError(null)

    try {
      const precioNumero = Number(precioVenta || 0)

      const { error: errorCombo } = await supabase
        .from("productos")
        .update({
          nombre,
          tipo: tipo || null,
          precio_venta: precioNumero,
          activo,
        })
        .eq("id", combo.id)

      if (errorCombo) {
        setError(errorCombo.message)
        return
      }

      for (const item of componentes) {
        const cantidadNumero = Number(item.cantidad)

        if (!cantidadNumero || cantidadNumero <= 0) {
          setError(
            `La cantidad de ${item.componente_sku} debe ser mayor a cero.`
          )
          return
        }

        if (item.eliminar) {
          if (!item.combo_detalle_id.startsWith("nuevo-")) {
            const { error: errorEliminar } = await supabase
              .from("combo_detalle")
              .delete()
              .eq("id", item.combo_detalle_id)

            if (errorEliminar) {
              setError(errorEliminar.message)
              return
            }
          }

          continue
        }

        if (item.combo_detalle_id.startsWith("nuevo-")) {
          const { error: errorInsertar } = await supabase
            .from("combo_detalle")
            .insert({
              combo_producto_id: combo.id,
              componente_producto_id: item.componente_id,
              cantidad: cantidadNumero,
            })

          if (errorInsertar) {
            setError(errorInsertar.message)
            return
          }
        } else {
          const { error: errorActualizar } = await supabase
            .from("combo_detalle")
            .update({
              cantidad: cantidadNumero,
            })
            .eq("id", item.combo_detalle_id)

          if (errorActualizar) {
            setError(errorActualizar.message)
            return
          }
        }
      }

      setMensaje("Combo actualizado correctamente.")

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch {
      setError("Ocurrió un error inesperado al guardar el combo.")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-1">
        <h2 className="text-lg font-semibold text-gray-900">
          Datos del combo
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">SKU</label>
            <input
              value={combo.sku}
              disabled
              className="mt-1 w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <input
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
              placeholder="Kit, Dúo, Pack..."
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Precio venta
            </label>
            <input
              type="number"
              value={precioVenta}
              onChange={(event) => setPrecioVenta(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={activo}
              onChange={(event) => setActivo(event.target.checked)}
            />
            Combo activo
          </label>

          <button
            type="button"
            onClick={guardarCambios}
            disabled={guardando}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>

          {mensaje && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Componentes del combo
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Recuerda: el combo no tiene stock físico. Krono descontará estos
          componentes cuando se venda.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Producto</th>
                <th className="px-3 py-3">Cantidad</th>
                <th className="px-3 py-3">Acción</th>
              </tr>
            </thead>

            <tbody>
              {componentes.map((item, index) => (
                <tr
                  key={item.combo_detalle_id}
                  className={`border-t ${
                    item.eliminar ? "bg-red-50 opacity-60" : ""
                  }`}
                >
                  <td className="px-3 py-3 font-medium text-gray-900">
                    {item.componente_sku}
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {item.componente_nombre}
                  </td>

                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.cantidad}
                      disabled={item.eliminar}
                      onChange={(event) => {
                        const valor = event.target.value

                        setComponentes((actual) =>
                          actual.map((componente, i) =>
                            i === index
                              ? { ...componente, cantidad: valor }
                              : componente
                          )
                        )
                      }}
                      className="w-24 rounded-lg border px-3 py-2 text-sm"
                    />
                  </td>

                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setComponentes((actual) =>
                          actual.map((componente, i) =>
                            i === index
                              ? {
                                  ...componente,
                                  eliminar: !componente.eliminar,
                                }
                              : componente
                          )
                        )
                      }}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                        item.eliminar
                          ? "bg-white text-gray-700 hover:bg-gray-50"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {item.eliminar ? "Restaurar" : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}

              {componentes.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    Este combo no tiene componentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-lg border bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Agregar componente
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_120px_auto]">
            <select
              value={nuevoComponenteId}
              onChange={(event) => setNuevoComponenteId(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Seleccionar producto</option>

              {productosDisponibles.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.sku} - {producto.nombre}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={nuevaCantidad}
              onChange={(event) => setNuevaCantidad(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={agregarComponente}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Agregar
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}