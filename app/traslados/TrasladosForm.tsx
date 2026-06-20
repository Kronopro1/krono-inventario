"use client"

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Producto = {
  id: string
  sku: string
  nombre: string
  es_combo?: boolean | null
}

type Almacen = {
  id: string
  codigo: string
  nombre: string
}

type ItemTraslado = {
  productoId: string
  cantidad: number
  busqueda: string
  abierto: boolean
  indiceActivo: number
}

const ALMACEN_DEPOSITO_82_ID = "5d81da9f-4a03-42ba-952a-a76f1a8b8a9c"
const ALMACEN_FBF_ID = "12f4cb4d-93ae-485f-9a24-90f8145fd8bd"

function crearItemVacio(): ItemTraslado {
  return {
    productoId: "",
    cantidad: 1,
    busqueda: "",
    abierto: false,
    indiceActivo: 0,
  }
}

export default function TrasladosForm({
  productos,
  almacenes,
}: {
  productos: Producto[]
  almacenes: Almacen[]
}) {
  const hoy = new Date().toISOString().slice(0, 10)

  const [almacenOrigenId, setAlmacenOrigenId] = useState(
    ALMACEN_DEPOSITO_82_ID
  )
  const [almacenDestinoId, setAlmacenDestinoId] = useState("")
  const [fecha, setFecha] = useState(hoy)
  const [observacion, setObservacion] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [items, setItems] = useState<ItemTraslado[]>([crearItemVacio()])

  const origen = almacenes.find((a) => a.id === almacenOrigenId)
  const destino = almacenes.find((a) => a.id === almacenDestinoId)

  const itemsValidos = items.filter(
    (item) => item.productoId && Number(item.cantidad) > 0
  )

  const totalUnidades = itemsValidos.reduce(
    (sum, item) => sum + Number(item.cantidad),
    0
  )

  const contieneCombos = itemsValidos.some((item) => {
    const producto = productos.find((p) => p.id === item.productoId)
    return Boolean(producto?.es_combo)
  })

  const actualizarItemCompleto = (
    index: number,
    cambios: Partial<ItemTraslado>
  ) => {
    setItems((itemsActuales) => {
      const nuevos = [...itemsActuales]

      nuevos[index] = {
        ...nuevos[index],
        ...cambios,
      }

      return nuevos
    })
  }

  const agregarItem = () => {
    setItems((itemsActuales) => [...itemsActuales, crearItemVacio()])
  }

  const eliminarItem = (index: number) => {
    setItems((itemsActuales) => {
      if (itemsActuales.length === 1) {
        return [crearItemVacio()]
      }

      return itemsActuales.filter((_, i) => i !== index)
    })
  }

  const prepararEnvioFbf = () => {
    setAlmacenOrigenId(ALMACEN_DEPOSITO_82_ID)
    setAlmacenDestinoId(ALMACEN_FBF_ID)
    setObservacion("Traslado a FBF - Fulfillment by Falabella")
    setMensaje("")
  }

  const filtrarProductos = (busqueda: string) => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) {
      return productos.slice(0, 50)
    }

    return productos
      .filter((producto) => {
        const tipo = producto.es_combo ? "combo" : "producto"
        const contenido =
          `${producto.sku} ${producto.nombre} ${tipo}`.toLowerCase()

        return contenido.includes(texto)
      })
      .slice(0, 50)
  }

  const seleccionarProducto = (index: number, producto: Producto) => {
    actualizarItemCompleto(index, {
      productoId: producto.id,
      busqueda: `${producto.sku} - ${producto.nombre}`,
      abierto: false,
      indiceActivo: 0,
    })
  }

  const registrarTraslado = async () => {
    setMensaje("")
    setLoading(true)

    try {
      if (!almacenOrigenId || !almacenDestinoId || !fecha) {
        throw new Error("Completa almacén origen, destino y fecha.")
      }

      if (almacenOrigenId === almacenDestinoId) {
        throw new Error("El almacén origen y destino no pueden ser iguales.")
      }

      if (itemsValidos.length === 0) {
        throw new Error("Agrega al menos un producto o combo.")
      }

      const payload = itemsValidos.map((item) => ({
        producto_id: item.productoId,
        cantidad: Number(item.cantidad),
      }))

      const { error } = await supabase.rpc("registrar_traslado_multiple", {
        p_almacen_origen_id: almacenOrigenId,
        p_almacen_destino_id: almacenDestinoId,
        p_fecha: fecha,
        p_observacion:
          observacion ||
          (contieneCombos
            ? "Traslado de combo desde frontend"
            : "Traslado registrado desde frontend"),
        p_items: payload,
      })

      if (error) throw error

      setMensaje("✅ Traslado registrado correctamente.")
      setItems([crearItemVacio()])
      setObservacion("")
      setFecha(hoy)
    } catch (error: any) {
      setMensaje(`❌ ${error.message || "No se pudo registrar el traslado."}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Registrar traslado
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Puedes trasladar productos físicos o combos. Si seleccionas un
              combo, Krono moverá automáticamente sus componentes.
            </p>
          </div>

          <button
            type="button"
            onClick={prepararEnvioFbf}
            className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-800 hover:bg-purple-100"
          >
            Preparar envío a FBF
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Almacén origen
            </label>
            <select
              value={almacenOrigenId}
              onChange={(event) => setAlmacenOrigenId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar origen</option>
              {almacenes.map((almacen) => (
                <option key={almacen.id} value={almacen.id}>
                  {almacen.codigo} - {almacen.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Almacén destino
            </label>
            <select
              value={almacenDestinoId}
              onChange={(event) => setAlmacenDestinoId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar destino</option>
              {almacenes.map((almacen) => (
                <option key={almacen.id} value={almacen.id}>
                  {almacen.codigo} - {almacen.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">
            Resumen del movimiento
          </p>

          <div className="mt-2 grid gap-3 text-sm md:grid-cols-3">
            <div>
              <span className="text-slate-500">Origen:</span>{" "}
              <span className="font-medium text-slate-900">
                {origen ? `${origen.codigo} - ${origen.nombre}` : "-"}
              </span>
            </div>

            <div>
              <span className="text-slate-500">Destino:</span>{" "}
              <span className="font-medium text-slate-900">
                {destino ? `${destino.codigo} - ${destino.nombre}` : "-"}
              </span>
            </div>

            <div>
              <span className="text-slate-500">Cantidad indicada:</span>{" "}
              <span className="font-medium text-slate-900">
                {totalUnidades}
              </span>
            </div>
          </div>

          {contieneCombos && (
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              Estás trasladando uno o más combos. Krono no moverá el combo como
              stock físico; moverá sus componentes.
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Productos o combos
            </h3>

            <button
              type="button"
              onClick={agregarItem}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Agregar línea
            </button>
          </div>

          {items.map((item, index) => {
            const productoSeleccionado = productos.find(
              (producto) => producto.id === item.productoId
            )

            const productosFiltrados = filtrarProductos(item.busqueda)
            const indiceActivoSeguro = Math.min(
              item.indiceActivo,
              Math.max(productosFiltrados.length - 1, 0)
            )

            return (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_140px_110px]"
              >
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Buscar producto o combo
                  </label>

                  <input
                    type="text"
                    value={item.busqueda}
                    onChange={(event) => {
                      actualizarItemCompleto(index, {
                        busqueda: event.target.value,
                        productoId: "",
                        abierto: true,
                        indiceActivo: 0,
                      })
                    }}
                    onFocus={() => {
                      actualizarItemCompleto(index, {
                        abierto: true,
                      })
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        actualizarItemCompleto(index, {
                          abierto: false,
                        })
                      }, 150)
                    }}
                    onKeyDown={(event) => {
                      if (!item.abierto && event.key !== "Tab") {
                        actualizarItemCompleto(index, {
                          abierto: true,
                        })
                        return
                      }

                      if (event.key === "ArrowDown") {
                        event.preventDefault()

                        actualizarItemCompleto(index, {
                          indiceActivo:
                            productosFiltrados.length === 0
                              ? 0
                              : Math.min(
                                  indiceActivoSeguro + 1,
                                  productosFiltrados.length - 1
                                ),
                        })
                      }

                      if (event.key === "ArrowUp") {
                        event.preventDefault()

                        actualizarItemCompleto(index, {
                          indiceActivo: Math.max(indiceActivoSeguro - 1, 0),
                        })
                      }

                      if (event.key === "Enter") {
                        event.preventDefault()

                        const producto = productosFiltrados[indiceActivoSeguro]

                        if (producto) {
                          seleccionarProducto(index, producto)
                        }
                      }

                      if (event.key === "Escape") {
                        actualizarItemCompleto(index, {
                          abierto: false,
                        })
                      }
                    }}
                    placeholder="Escribe SKU o nombre. Ejemplo: BRA-KIT, AMA-SHAC..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />

                  {item.abierto && (
                    <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                      {productosFiltrados.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-red-600">
                          No se encontraron coincidencias.
                        </div>
                      ) : (
                        productosFiltrados.map((producto, productoIndex) => {
                          const activo = productoIndex === indiceActivoSeguro

                          return (
                            <button
                              key={producto.id}
                              type="button"
                              onMouseDown={(event) => {
                                event.preventDefault()
                                seleccionarProducto(index, producto)
                              }}
                              className={`flex w-full items-start justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left text-sm ${
                                activo ? "bg-slate-100" : "hover:bg-slate-50"
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {producto.sku}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {producto.nombre}
                                </div>
                              </div>

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  producto.es_combo
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {producto.es_combo ? "Combo" : "Producto"}
                              </span>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}

                  {productoSeleccionado?.es_combo && (
                    <p className="mt-2 text-xs font-medium text-purple-700">
                      Combo seleccionado: se trasladarán sus componentes.
                    </p>
                  )}

                  {productoSeleccionado && !productoSeleccionado.es_combo && (
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Producto físico seleccionado.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.cantidad}
                    onChange={(event) =>
                      actualizarItemCompleto(index, {
                        cantidad: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => eliminarItem(index)}
                    className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Observación
          </label>
          <textarea
            value={observacion}
            onChange={(event) => setObservacion(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ejemplo: Envío de combos a FBF"
          />
        </div>

        {mensaje && (
          <div
            className={`mt-4 rounded-xl border p-3 text-sm ${
              mensaje.startsWith("✅")
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {mensaje}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={registrarTraslado}
            disabled={loading}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Registrar traslado"}
          </button>
        </div>
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Resumen</h2>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Origen
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {origen?.codigo || "No seleccionado"}
            </p>
            <p className="text-xs text-slate-500">{origen?.nombre || "-"}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Destino
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {destino?.codigo || "No seleccionado"}
            </p>
            <p className="text-xs text-slate-500">{destino?.nombre || "-"}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Fecha
            </p>
            <p className="mt-1 font-semibold text-slate-900">{fecha}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Líneas
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {itemsValidos.length} línea(s) / {totalUnidades} unidad(es)
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
          Si seleccionas un combo, el sistema trasladará sus componentes físicos.
          No se creará stock duplicado del combo.
        </p>
      </aside>
    </section>
  )
}