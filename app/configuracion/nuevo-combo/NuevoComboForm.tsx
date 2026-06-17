"use client"

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Producto = {
  id: string
  sku: string
  nombre: string
}

type Componente = {
  productoId: string
  cantidad: number
}

export default function NuevoComboForm({
  productos,
}: {
  productos: Producto[]
}) {
  const [sku, setSku] = useState("")
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [componentes, setComponentes] = useState<Componente[]>([
    { productoId: "", cantidad: 1 },
  ])
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")

  const agregarComponente = () => {
    setComponentes([...componentes, { productoId: "", cantidad: 1 }])
  }

  const actualizarComponente = (
    index: number,
    field: "productoId" | "cantidad",
    value: string | number
  ) => {
    const nuevos = [...componentes]
    nuevos[index] = {
      ...nuevos[index],
      [field]: value,
    }
    setComponentes(nuevos)
  }

  const eliminarComponente = (index: number) => {
    setComponentes(componentes.filter((_, i) => i !== index))
  }

  const crearCombo = async () => {
    setMensaje("")
    setLoading(true)

    try {
      if (!sku || !nombre) {
        throw new Error("Completa SKU y nombre del combo.")
      }

      const componentesValidos = componentes.filter(
        (item) => item.productoId && Number(item.cantidad) > 0
      )

      if (componentesValidos.length < 2) {
        throw new Error("Un combo debe tener al menos 2 componentes.")
      }

      const payload = componentesValidos.map((item) => ({
        producto_id: item.productoId,
        cantidad: Number(item.cantidad),
      }))

      const { error } = await supabase.rpc("crear_combo_con_componentes", {
        p_sku: sku,
        p_nombre: nombre,
        p_items: payload,
      })

      if (error) throw error

      if (descripcion) {
        await supabase
          .from("productos")
          .update({ descripcion })
          .eq("sku", sku.toUpperCase().trim())
      }

      setMensaje("✅ Combo creado correctamente.")
      setSku("")
      setNombre("")
      setDescripcion("")
      setComponentes([{ productoId: "", cantidad: 1 }])
    } catch (error: any) {
      setMensaje(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 max-w-5xl rounded-xl bg-white p-6 shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">SKU Combo</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="KRO-KIT-PLEX-02"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Nombre Combo</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Kit Reparación Krono Pro Plex"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            className="mt-1 w-full rounded border p-2"
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción interna o comercial del combo"
          />
        </div>
      </div>

      <h2 className="mt-8 text-xl font-bold">Componentes del combo</h2>

      <div className="mt-4 space-y-3">
        {componentes.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <select
              className="md:col-span-4 rounded border p-2"
              value={item.productoId}
              onChange={(e) =>
                actualizarComponente(index, "productoId", e.target.value)
              }
            >
              <option value="">Seleccionar producto base</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.sku} - {producto.nombre}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              className="rounded border p-2"
              value={item.cantidad}
              onChange={(e) =>
                actualizarComponente(index, "cantidad", Number(e.target.value))
              }
            />

            <button
              type="button"
              onClick={() => eliminarComponente(index)}
              className="rounded bg-red-100 px-3 py-2 text-red-700"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={agregarComponente}
          className="rounded bg-slate-200 px-4 py-2"
        >
          + Agregar componente
        </button>

        <button
          type="button"
          onClick={crearCombo}
          disabled={loading}
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          {loading ? "Creando..." : "Crear Combo"}
        </button>
      </div>

      {mensaje && (
        <div className="mt-6 rounded bg-slate-100 p-4 font-medium">
          {mensaje}
        </div>
      )}
    </div>
  )
}