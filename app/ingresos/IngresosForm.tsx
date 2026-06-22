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

type ItemIngreso = {
  productoId: string
  cantidad: number
  busqueda: string
  abierto: boolean
}

const ALMACEN_PRINCIPAL_ID = "5d81da9f-4a03-42ba-952a-a76f1a8b8a9c"

export default function IngresosForm({
  productos,
  almacenes,
}: {
  productos: Producto[]
  almacenes: Almacen[]
}) {
  const hoy = new Date().toISOString().slice(0, 10)

  const [almacenId, setAlmacenId] = useState(() => {
    const almacenPrincipal = almacenes.find(
      (almacen) => almacen.id === ALMACEN_PRINCIPAL_ID
    )

    return almacenPrincipal?.id || almacenes[0]?.id || ""
  })

  const [fecha, setFecha] = useState(hoy)
  const [observacion, setObservacion] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [items, setItems] = useState<ItemIngreso[]>([
    {
      productoId: "",
      cantidad: 1,
      busqueda: "",
      abierto: false,
    },
  ])

  const almacenSeleccionado = almacenes.find((almacen) => almacen.id === almacenId)

  const itemsValidos = items.filter(
    (item) => item.productoId && Number(item.cantidad) > 0
  )

  const totalUnidades = itemsValidos.reduce(
    (sum, item) => sum + Number(item.cantidad),
    0
  )

  const agregarItem = () => {
    setItems([
      ...items,
      {
        productoId: "",
        cantidad: 1,
        busqueda: "",
        abierto: false,
      },
    ])
  }

  const actualizarItem = (
    index: number,
    field: "productoId" | "cantidad" | "busqueda" | "abierto",
    value: string | number | boolean
  ) => {
    setItems((itemsActuales) => {
      const nuevos = [...itemsActuales]

      nuevos[index] = {
        ...nuevos[index],
        [field]: value,
      }

      return nuevos
    })
  }

  const eliminarItem = (index: number) => {
    if (items.length === 1) {
      setItems([
        {
          productoId: "",
          cantidad: 1,
          busqueda: "",
          abierto: false,
        },
      ])
      return
    }

    setItems(items.filter((_, i) => i !== index))
  }

  const filtrarProductos = (texto: string) => {
    const busqueda = texto.trim().toLowerCase()

    if (!busqueda) {
      return productos.slice(0, 30)
    }

    return productos
      .filter((producto) => {
        const sku = producto.sku?.toLowerCase() || ""
        const nombre = producto.nombre?.toLowerCase() || ""

        return sku.includes(busqueda) || nombre.includes(busqueda)
      })
      .slice(0, 30)
  }

  const seleccionarProducto = (index: number, producto: Producto) => {
    setItems((itemsActuales) => {
      const nuevos = [...itemsActuales]

      nuevos[index] = {
        ...nuevos[index],
        productoId: producto.id,
        busqueda: `${producto.sku} - ${producto.nombre}`,
        abierto: false,
      }

      return nuevos
    })
  }

  const registrarIngreso = async () => {
    setMensaje("")
    setLoading(true)

    try {
      if (!almacenId || !fecha) {
        throw new Error("Completa almacen y fecha.")
      }

      if (itemsValidos.length === 0) {
        throw new Error("Agrega al menos un producto.")
      }

      const payload = itemsValidos.map((item) => ({
        producto_id: item.productoId,
        cantidad: Number(item.cantidad),
      }))

      const { error } = await supabase.rpc("registrar_ingreso_multiple", {
        p_almacen_id: almacenId,
        p_fecha: fecha,
        p_observacion: observacion || "Ingreso registrado desde frontend",
        p_items: payload,
      })

      if (error) throw error

      setMensaje("Ingreso registrado correctamente.")
      setItems([
        {
          productoId: "",
          cantidad: 1,
          busqueda: "",
          abierto: false,
        },
      ])
      setObservacion("")
      setFecha(hoy)
    } catch (error: any) {
      setMensaje(error.message || "Error registrando ingreso.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-950">
            Datos del ingreso
          </h2>
          <p className="text-sm text-slate-500">
            Registra mercaderia recibida y actualiza el stock del almacen seleccionado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Almacen destino
            </label>

            <select
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              value={almacenId}
              onChange={(event) => setAlmacenId(event.target.value)}
            >
              <option value="">Seleccionar almacen</option>
              {almacenes.map((almacen) => (
                <option key={almacen.id} value={almacen.id}>
                  {almacen.codigo} - {almacen.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Fecha
            </label>

            <input
              type="date"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Observacion
            </label>

            <input
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              value={observacion}
              onChange={(event) => setObservacion(event.target.value)}
              placeholder="Ej. Ingreso reposicion"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Productos del ingreso
            </h2>
            <p className="text-sm text-slate-500">
              Busca por SKU o nombre y agrega una o mas lineas de productos recibidos.
            </p>
          </div>

          <button
            type="button"
            onClick={agregarItem}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            + Agregar producto
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item, index) => {
            const productoSeleccionado = productos.find(
              (producto) => producto.id === item.productoId
            )

            const productosFiltrados = filtrarProductos(item.busqueda)

            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
                  <div className="relative md:col-span-5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Producto
                    </label>

                    <input
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
                      value={item.busqueda}
                      onChange={(event) => {
                        const texto = event.target.value

                        setItems((itemsActuales) => {
                          const nuevos = [...itemsActuales]

                          nuevos[index] = {
                            ...nuevos[index],
                            busqueda: texto,
                            productoId: "",
                            abierto: true,
                          }

                          return nuevos
                        })
                      }}
                      onFocus={() => actualizarItem(index, "abierto", true)}
                      placeholder="Buscar por SKU o nombre"
                    />

                    {item.abierto && (
                      <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                        {productosFiltrados.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-red-600">
                            No se encontraron productos.
                          </div>
                        ) : (
                          productosFiltrados.map((producto) => (
                            <button
                              key={producto.id}
                              type="button"
                              onMouseDown={(event) => {
                                event.preventDefault()
                                seleccionarProducto(index, producto)
                              }}
                              className="flex w-full items-start justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
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
                          ))
                        )}
                      </div>
                    )}

                    {productoSeleccionado && (
                      <p className="mt-2 text-xs font-medium text-green-700">
                        Seleccionado: {productoSeleccionado.sku}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Cantidad
                    </label>

                    <input
                      type="number"
                      min="1"
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
                      value={item.cantidad}
                      onChange={(event) =>
                        actualizarItem(index, "cantidad", Number(event.target.value))
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      className="w-full rounded-2xl bg-red-50 px-3 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {mensaje && (
          <div
            className={`mt-6 rounded-2xl p-4 text-sm font-medium ${
              mensaje.includes("correctamente")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Resumen</h2>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Almacen destino
            </p>
            <p className="mt-2 font-bold text-slate-950">
              {almacenSeleccionado
                ? `${almacenSeleccionado.codigo} - ${almacenSeleccionado.nombre}`
                : "Sin seleccionar"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Fecha
            </p>
            <p className="mt-2 font-bold text-slate-950">{fecha}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Lineas
            </p>
            <p className="mt-2 font-bold text-slate-950">
              {itemsValidos.length} productos / {totalUnidades} unidades
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Observacion
            </p>
            <p className="mt-2 font-bold text-slate-950">
              {observacion || "Sin observacion"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={registrarIngreso}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registrando..." : "Registrar ingreso"}
        </button>

        <p className="mt-4 text-xs text-slate-500">
          Al registrar el ingreso, el sistema aumentara el stock en el almacen seleccionado.
        </p>
      </aside>
    </section>
  )
}
