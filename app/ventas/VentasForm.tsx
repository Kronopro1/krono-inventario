"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Canal = {
  id: string
  nombre: string
}

type Empresa = {
  id: string
  nombre: string
  razon_social: string | null
  ruc: string | null
}

type Almacen = {
  id: string
  codigo: string
  nombre: string
}

type Producto = {
  id: string
  sku: string
  nombre: string
  es_combo: boolean
}

type Inventario = {
  sku: string
  producto: string
  codigo_almacen: string
  stock_actual: number
}

type VentaItem = {
  productoId: string
  cantidad: number
}

const ALMACEN_DEPOSITO_82_ID = "5d81da9f-4a03-42ba-952a-a76f1a8b8a9c"

function ProductoBuscador({
  index,
  item,
  productos,
  obtenerStock,
  obtenerProducto,
  actualizarItem,
}: {
  index: number
  item: VentaItem
  productos: Producto[]
  obtenerStock: (sku: string) => number | null
  obtenerProducto: (productoId: string) => Producto | undefined
  actualizarItem: (
    index: number,
    field: "productoId" | "cantidad",
    value: string | number
  ) => void
}) {
  const [busqueda, setBusqueda] = useState("")
  const [abierto, setAbierto] = useState(false)

  const productoSeleccionado = obtenerProducto(item.productoId)

  const stock = productoSeleccionado
    ? obtenerStock(productoSeleccionado.sku)
    : null

  const productosFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase()

    if (!textoBusqueda) return productos.slice(0, 10)

    return productos
      .filter((producto) => {
        const texto = `${producto.sku} ${producto.nombre}`.toLowerCase()
        return texto.includes(textoBusqueda)
      })
      .slice(0, 10)
  }, [busqueda, productos])

  return (
    <div>
      <label className="text-xs font-medium text-slate-500">
        Producto o combo
      </label>

      <input
        type="text"
        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
        placeholder="Buscar por SKU o nombre..."
        value={
          abierto
            ? busqueda
            : productoSeleccionado
              ? `${productoSeleccionado.sku} - ${productoSeleccionado.nombre}`
              : busqueda
        }
        onFocus={() => setAbierto(true)}
        onChange={(e) => {
          setBusqueda(e.target.value)
          setAbierto(true)
          actualizarItem(index, "productoId", "")
        }}
      />

      {abierto && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {productosFiltrados.map((producto) => {
            const productoStock = obtenerStock(producto.sku)

            return (
              <button
                key={producto.id}
                type="button"
                onClick={() => {
                  actualizarItem(index, "productoId", producto.id)
                  setBusqueda("")
                  setAbierto(false)
                }}
                className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-900">
                  {producto.sku} - {producto.nombre}
                  {producto.es_combo ? " (Combo)" : ""}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Stock disponible: {productoStock ?? 0}
                </div>
              </button>
            )
          })}

          {productosFiltrados.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">
              No se encontraron productos.
            </div>
          )}
        </div>
      )}

      {productoSeleccionado && stock !== null && (
        <p className="mt-2 text-xs text-slate-500">
          Producto seleccionado:{" "}
          <strong>
            {productoSeleccionado.sku} - {productoSeleccionado.nombre}
          </strong>
          <br />
          Stock disponible en almacén seleccionado: <strong>{stock}</strong>
        </p>
      )}
    </div>
  )
}

export default function VentasForm({
  canales,
  empresas,
  almacenes,
  productos,
  inventario,
}: {
  canales: Canal[]
  empresas: Empresa[]
  almacenes: Almacen[]
  productos: Producto[]
  inventario: Inventario[]
}) {
  const almacenPredeterminadoId = useMemo(() => {
    const deposito82PorId = almacenes.find(
      (almacen) => almacen.id === ALMACEN_DEPOSITO_82_ID
    )

    if (deposito82PorId) return deposito82PorId.id

    const deposito82PorNombre = almacenes.find((almacen) =>
      `${almacen.codigo} ${almacen.nombre}`.toLowerCase().includes("82")
    )

    return deposito82PorNombre?.id || ""
  }, [almacenes])

  const [canalId, setCanalId] = useState("")
  const [empresaId, setEmpresaId] = useState("")
  const [almacenId, setAlmacenId] = useState("")
  const [numeroOrden, setNumeroOrden] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [items, setItems] = useState<VentaItem[]>([
    { productoId: "", cantidad: 1 },
  ])

  useEffect(() => {
    if (!almacenId && almacenPredeterminadoId) {
      setAlmacenId(almacenPredeterminadoId)
    }
  }, [almacenId, almacenPredeterminadoId])

  const almacenSeleccionado = almacenes.find((a) => a.id === almacenId)
  const canalSeleccionado = canales.find((c) => c.id === canalId)
  const empresaSeleccionada = empresas.find((e) => e.id === empresaId)

  const itemsValidos = items.filter(
    (item) => item.productoId && Number(item.cantidad) > 0
  )

  const totalUnidades = itemsValidos.reduce(
    (sum, item) => sum + Number(item.cantidad),
    0
  )

  const obtenerStock = (sku: string) => {
    if (!almacenSeleccionado) return null

    const registro = inventario.find(
      (inv) =>
        inv.sku === sku &&
        inv.codigo_almacen === almacenSeleccionado.codigo
    )

    return registro?.stock_actual ?? 0
  }

  const obtenerProducto = (productoId: string) => {
    return productos.find((producto) => producto.id === productoId)
  }

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
      [field]: field === "cantidad" ? Number(value) : value,
    }

    setItems(nuevos)
  }

  const eliminarItem = (index: number) => {
    if (items.length === 1) {
      setItems([{ productoId: "", cantidad: 1 }])
      return
    }

    setItems(items.filter((_, i) => i !== index))
  }

  const registrarVenta = async () => {
    setMensaje("")
    setLoading(true)

    try {
      if (!canalId || !empresaId || !almacenId || !numeroOrden.trim()) {
        throw new Error("Completa canal, empresa, almacén y número de orden.")
      }

      if (itemsValidos.length === 0) {
        throw new Error("Agrega al menos un producto válido.")
      }

      for (const item of itemsValidos) {
        const producto = obtenerProducto(item.productoId)

        if (!producto) {
          throw new Error("Uno de los productos seleccionados no existe.")
        }

        const stockDisponible = obtenerStock(producto.sku)

        if (stockDisponible !== null && Number(item.cantidad) > stockDisponible) {
          throw new Error(
            `Stock insuficiente para ${producto.sku}. Disponible: ${stockDisponible}.`
          )
        }
      }

      const { data: orden, error: ordenError } = await supabase
        .from("ordenes_marketplace")
        .insert({
          canal_venta_id: canalId,
          empresa_id: empresaId,
          numero_orden: numeroOrden.trim(),
          almacen_id: almacenId,
          comentario: "Registrado desde frontend Krono Inventario",
        })
        .select("id")
        .single()

      if (ordenError) throw ordenError

      const detalle = itemsValidos.map((item) => ({
        orden_id: orden.id,
        producto_vendido_id: item.productoId,
        cantidad: Number(item.cantidad),
      }))

      const { error: detalleError } = await supabase
        .from("ordenes_marketplace_detalle")
        .insert(detalle)

      if (detalleError) throw detalleError

      const { error: rpcError } = await supabase.rpc(
        "registrar_orden_marketplace",
        {
          p_orden_id: orden.id,
        }
      )

      if (rpcError) throw rpcError

      setMensaje("✅ Venta registrada y stock descontado correctamente.")
      setCanalId("")
      setEmpresaId("")
      setAlmacenId(almacenPredeterminadoId)
      setNumeroOrden("")
      setItems([{ productoId: "", cantidad: 1 }])
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
            Datos de la venta
          </h2>
          <p className="text-sm text-slate-500">
            Selecciona canal, empresa vendedora, almacén de salida y productos vendidos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Canal
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              value={canalId}
              onChange={(e) => setCanalId(e.target.value)}
            >
              <option value="">Seleccionar canal</option>
              {canales.map((canal) => (
                <option key={canal.id} value={canal.id}>
                  {canal.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Empresa
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
            >
              <option value="">Seleccionar empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Número de orden
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              value={numeroOrden}
              onChange={(e) => setNumeroOrden(e.target.value)}
              placeholder="Ej. ML-123456"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Almacén de salida
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
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Productos vendidos
            </h2>
            <p className="text-sm text-slate-500">
              Busca por SKU, nombre de producto o combo.
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
              key={`${index}-${item.productoId || "nuevo"}`}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-6"
            >
              <div className="md:col-span-4">
                <ProductoBuscador
                  index={index}
                  item={item}
                  productos={productos}
                  obtenerStock={obtenerStock}
                  obtenerProducto={obtenerProducto}
                  actualizarItem={actualizarItem}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
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
                  {items.length === 1 ? "Limpiar" : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={registrarVenta}
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrar venta"}
          </button>
        </div>

        {mensaje && (
          <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm font-medium text-slate-700">
            {mensaje}
          </div>
        )}
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Resumen
        </h2>

        <div className="mt-5 space-y-4 text-sm">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-slate-500">Canal</p>
            <p className="mt-1 font-semibold text-slate-950">
              {canalSeleccionado?.nombre || "No seleccionado"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-slate-500">Empresa</p>
            <p className="mt-1 font-semibold text-slate-950">
              {empresaSeleccionada?.nombre || "No seleccionada"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-slate-500">Almacén</p>
            <p className="mt-1 font-semibold text-slate-950">
              {almacenSeleccionado
                ? `${almacenSeleccionado.codigo} - ${almacenSeleccionado.nombre}`
                : "No seleccionado"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-slate-500">Productos válidos</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {itemsValidos.length}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-slate-500">Unidades vendidas</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {totalUnidades}
            </p>
          </div>
        </div>
      </aside>
    </section>
  )
}