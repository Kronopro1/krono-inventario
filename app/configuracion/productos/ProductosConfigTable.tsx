"use client"

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"

type ProductoConfig = {
  id: string
  sku: string
  nombre: string
  costo_unitario: number
  precio_venta: number
  stock_minimo_total: number
}

export default function ProductosConfigTable({
  productos,
}: {
  productos: ProductoConfig[]
}) {
  const [items, setItems] = useState(productos)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState("")

  const actualizarCampo = (
    index: number,
    field: "nombre" | "costo_unitario" | "precio_venta" | "stock_minimo_total",
    value: string | number
  ) => {
    const nuevos = [...items]
    nuevos[index] = {
      ...nuevos[index],
      [field]: value,
    }
    setItems(nuevos)
  }

  const guardarProducto = async (producto: ProductoConfig) => {
    setMensaje("")

    const { error } = await supabase.rpc("actualizar_producto_config", {
      p_producto_id: producto.id,
      p_nombre: producto.nombre,
      p_costo_unitario: Number(producto.costo_unitario),
      p_precio_venta: Number(producto.precio_venta),
      p_stock_minimo: Number(producto.stock_minimo_total),
    })

    if (error) {
      setMensaje(`❌ ${error.message}`)
      return
    }

    setEditandoId(null)
    setMensaje(`✅ Producto ${producto.sku} actualizado correctamente.`)
  }

  return (
    <div className="mt-8 rounded-xl bg-white shadow overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-200">
          <tr>
            <th className="p-3">SKU</th>
            <th className="p-3">Nombre / Descripción</th>
            <th className="p-3">Costo Unitario</th>
            <th className="p-3">Precio Venta</th>
            <th className="p-3">Stock Mínimo</th>
            <th className="p-3">Acción</th>
          </tr>
        </thead>

        <tbody>
          {items.map((producto, index) => {
            const estaEditando = editandoId === producto.id

            return (
              <tr key={producto.id} className="border-t">
                <td className="p-3 font-medium">{producto.sku}</td>

                <td className="p-3">
                  <input
                    disabled={!estaEditando}
                    className={`w-full rounded border p-2 ${
                      estaEditando ? "bg-white" : "bg-slate-100 text-slate-500"
                    }`}
                    value={producto.nombre}
                    onChange={(e) =>
                      actualizarCampo(index, "nombre", e.target.value)
                    }
                  />
                </td>

                <td className="p-3">
                  <input
                    disabled={!estaEditando}
                    type="number"
                    step="0.01"
                    className={`w-28 rounded border p-2 ${
                      estaEditando ? "bg-white" : "bg-slate-100 text-slate-500"
                    }`}
                    value={producto.costo_unitario}
                    onChange={(e) =>
                      actualizarCampo(
                        index,
                        "costo_unitario",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td className="p-3">
                  <input
                    disabled={!estaEditando}
                    type="number"
                    step="0.01"
                    className={`w-28 rounded border p-2 ${
                      estaEditando ? "bg-white" : "bg-slate-100 text-slate-500"
                    }`}
                    value={producto.precio_venta}
                    onChange={(e) =>
                      actualizarCampo(
                        index,
                        "precio_venta",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td className="p-3">
                  <input
                    disabled={!estaEditando}
                    type="number"
                    step="1"
                    className={`w-28 rounded border p-2 ${
                      estaEditando ? "bg-white" : "bg-slate-100 text-slate-500"
                    }`}
                    value={producto.stock_minimo_total}
                    onChange={(e) =>
                      actualizarCampo(
                        index,
                        "stock_minimo_total",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td className="p-3">
                  {estaEditando ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => guardarProducto(producto)}
                        className="rounded bg-slate-900 px-3 py-2 text-white"
                      >
                        Guardar
                      </button>

                      <button
                        onClick={() => setEditandoId(null)}
                        className="rounded bg-slate-200 px-3 py-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditandoId(producto.id)}
                      className="rounded bg-slate-200 px-3 py-2"
                    >
                      ✏️ Editar
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {mensaje && (
        <div className="p-4 font-medium">
          {mensaje}
        </div>
      )}
    </div>
  )
}