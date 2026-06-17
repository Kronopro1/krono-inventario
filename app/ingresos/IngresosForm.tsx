"use client"

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Producto = {
  id: string
  sku: string
  nombre: string
}

type Almacen = {
  id: string
  codigo: string
  nombre: string
}

type ItemIngreso = {
  productoId: string
  cantidad: number
}

export default function IngresosForm({
  productos,
  almacenes,
}: {
  productos: Producto[]
  almacenes: Almacen[]
}) {
  const hoy = new Date().toISOString().slice(0, 10)

  const [almacenId, setAlmacenId] = useState("")
  const [fecha, setFecha] = useState(hoy)
  const [observacion, setObservacion] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [items, setItems] = useState<ItemIngreso[]>([
    { productoId: "", cantidad: 1 },
  ])

  const almacenSeleccionado = almacenes.find((a) => a.id === almacenId)

  const itemsValidos = items.filter(
    (item) => item.productoId && Number(item.cantidad) > 0
  )

  const totalUnidades = itemsValidos.reduce(
    (sum, item) => sum + Number(item.cantidad),
    0
  )

  const agregarItem = () => {
    setItems([...items, { productoId: "", cantidad: 1 }])
  }

  const actualizarItem = (
    index: number,
    field: "productoId" | "cantidad",
    value: string | number
  ) => {
    const nuevos = [...items]
    nuevos[index] = {
      ...nuevos[index],
      [field]: value,
    }
    setItems(nuevos)
  }

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const registrarIngreso = async () => {
    setMensaje("")
    setLoading(true)

    try {
      if (!almacenId || !fecha) {
        throw new Error("Completa almacén y fecha.")
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

      setMensaje("✅ Ingreso registrado correctamente.")
      setItems([{ productoId: "", cantidad: 1 }])
      setObservacion("")
      setFecha(hoy)
    } catch (error: any) {
      setMensaje(`❌ ${error.message}`)
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
            Registra mercadería recibida y actualiza el stock del almacén seleccionado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Almacén destino
            </label>

            <select
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              value={almacenId}
              onChange={(e) => setAlmacenId(e.target.value)}
            >
              <option value="">Seleccionar almacén</option>
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
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Observación
            </label>

            <input
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. Ingreso reposición"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Productos del ingreso
            </h2>
            <p className="text-sm text-slate-500">
              Agrega una o más líneas de productos recibidos.
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
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
                <div className="md:col-span-5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Producto
                  </label>

                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
                    value={item.productoId}
                    onChange={(e) =>
                      actualizarItem(index, "productoId", e.target.value)
                    }
                  >
                    <option value="">Seleccionar producto</option>

                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.sku} - {producto.nombre}
                      </option>
                    ))}
                  </select>
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
                    onChange={(e) =>
                      actualizarItem(index, "cantidad", Number(e.target.value))
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
          ))}
        </div>

        {mensaje && (
          <div
            className={`mt-6 rounded-2xl p-4 text-sm font-medium ${
              mensaje.startsWith("✅")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Resumen
        </h2>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Almacén destino
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {almacenSeleccionado?.codigo || "No seleccionado"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Fecha
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {fecha}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Líneas
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {itemsValidos.length} productos / {totalUnidades} unidades
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Observación
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {observacion || "Sin observación"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={registrarIngreso}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registrar ingreso"}
        </button>

        <p className="mt-4 text-xs text-slate-400">
          Al registrar el ingreso, el sistema aumentará el stock en el almacén seleccionado.
        </p>
      </aside>
    </section>
  )
}