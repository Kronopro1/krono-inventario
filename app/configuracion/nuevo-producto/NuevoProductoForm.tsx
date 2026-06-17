"use client"

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"

export default function NuevoProductoForm() {
  const [sku, setSku] = useState("")
  const [nombre, setNombre] = useState("")
  const [costo, setCosto] = useState("")
  const [precioVenta, setPrecioVenta] = useState("")
  const [stockMinimo, setStockMinimo] = useState("5")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")

  const crearProducto = async () => {
    setMensaje("")
    setLoading(true)

    try {
      const { error } = await supabase.rpc("crear_producto_base", {
        p_sku: sku,
        p_nombre: nombre,
        p_costo_unitario: Number(costo),
        p_stock_minimo: Number(stockMinimo),
        p_precio_venta: Number(precioVenta),
      })

      if (error) throw error

      setMensaje("✅ Producto creado correctamente.")

      setSku("")
      setNombre("")
      setCosto("")
      setPrecioVenta("")
      setStockMinimo("5")
    } catch (error: any) {
      setMensaje(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 max-w-2xl rounded-xl bg-white p-6 shadow">
      <div className="grid grid-cols-1 gap-4">

        <div>
          <label className="block text-sm font-medium">
            SKU
          </label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="KRO-SH-PL50001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Nombre
          </label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Shampoo Krono Pro Plex 500ml"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Costo Unitario
          </label>

          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded border p-2"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Precio Venta
          </label>

          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded border p-2"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Stock Mínimo
          </label>

          <input
            type="number"
            className="mt-1 w-full rounded border p-2"
            value={stockMinimo}
            onChange={(e) => setStockMinimo(e.target.value)}
          />
        </div>

        <button
          onClick={crearProducto}
          disabled={loading}
          className="rounded bg-slate-900 px-4 py-3 text-white"
        >
          {loading ? "Creando..." : "Crear Producto"}
        </button>

        {mensaje && (
          <div className="rounded bg-slate-100 p-4">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  )
}