"use client"

import { useState } from "react"

type ItemInventario = {
  sku: string
  producto: string
  codigo_almacen: string
  almacen: string
  stock_actual: number
  stock_minimo: number
}

function estadoStock(stock: number, minimo: number) {
  if (stock <= 0) {
    return {
      texto: "CRÍTICO",
      clase: "bg-red-50 text-red-700 ring-red-200",
    }
  }

  if (stock <= minimo) {
    return {
      texto: "BAJO",
      clase: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    }
  }

  return {
    texto: "OK",
    clase: "bg-green-50 text-green-700 ring-green-200",
  }
}

export default function InventarioTable({
  inventario,
}: {
  inventario: ItemInventario[]
}) {
  const [busqueda, setBusqueda] = useState("")
  const [almacen, setAlmacen] = useState("")

  const almacenesDisponibles = Array.from(
    new Set(inventario.map((item) => item.codigo_almacen))
  )

  const filtrado = inventario.filter((item) => {
    const texto =
      `${item.sku} ${item.producto} ${item.codigo_almacen} ${item.almacen}`.toLowerCase()

    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideAlmacen = almacen ? item.codigo_almacen === almacen : true

    return coincideBusqueda && coincideAlmacen
  })

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Buscar
          </label>

          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950"
            placeholder="Buscar por SKU, producto o almacén..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Almacén
          </label>

          <select
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950"
            value={almacen}
            onChange={(e) => setAlmacen(e.target.value)}
          >
            <option value="">Todos los almacenes</option>

            {almacenesDisponibles.map((codigo) => (
              <option key={codigo} value={codigo}>
                {codigo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Registros encontrados:{" "}
          <span className="font-semibold text-slate-900">
            {filtrado.length}
          </span>
        </p>

        {(busqueda || almacen) && (
          <button
            onClick={() => {
              setBusqueda("")
              setAlmacen("")
            }}
            className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Almacén</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>

          <tbody>
            {filtrado.map((item, index) => {
              const estado = estadoStock(
                Number(item.stock_actual),
                Number(item.stock_minimo)
              )

              return (
                <tr key={index} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.sku}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {item.producto}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {item.codigo_almacen}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-bold text-slate-950">
                    {item.stock_actual}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {item.stock_minimo}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${estado.clase}`}
                    >
                      {estado.texto}
                    </span>
                  </td>
                </tr>
              )
            })}

            {filtrado.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No se encontraron resultados para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}