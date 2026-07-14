"use client"

import { useMemo, useState } from "react"

type Movimiento = {
  fecha: string
  tipo: string
  numero_movimiento: string
  numero_orden: string | null
  sku: string
  producto: string
  cantidad: number
  almacen_origen: string | null
  almacen_destino: string | null
}

function tipoBadge(tipo: string) {
  const normalizado = tipo.toLowerCase()

  if (normalizado.includes("ingreso")) {
    return "bg-green-50 text-green-700 ring-green-200"
  }

  if (
    normalizado.includes("venta") ||
    normalizado.includes("salida")
  ) {
    return "bg-red-50 text-red-700 ring-red-200"
  }

  if (normalizado.includes("traslado")) {
    return "bg-blue-50 text-blue-700 ring-blue-200"
  }

  return "bg-slate-100 text-slate-700 ring-slate-200"
}

export default function MovimientosTable({
  movimientos,
}: {
  movimientos: Movimiento[]
}) {
  const [busqueda, setBusqueda] = useState("")
  const [tipo, setTipo] = useState("")
  const [almacen, setAlmacen] = useState("")

  const almacenes = Array.from(
    new Set(
      movimientos.flatMap((m) => [
        m.almacen_origen,
        m.almacen_destino,
      ])
    )
  ).filter(Boolean)

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((item) => {
      const texto =
        `${item.sku} ${item.producto}`.toLowerCase()

      const coincideBusqueda =
        texto.includes(busqueda.toLowerCase())

      const coincideTipo =
        tipo === ""
          ? true
          : item.tipo.toLowerCase().includes(tipo)

      const coincideAlmacen =
        almacen === ""
          ? true
          : item.almacen_origen === almacen ||
            item.almacen_destino === almacen

      return (
        coincideBusqueda &&
        coincideTipo &&
        coincideAlmacen
      )
    })
  }, [movimientos, busqueda, tipo, almacen])

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar SKU o producto..."
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Todos los tipos</option>
          <option value="ingreso">Ingresos</option>
          <option value="venta">Ventas</option>
          <option value="traslado">Traslados</option>
        </select>

        <select
          value={almacen}
          onChange={(e) => setAlmacen(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Todos los almacenes</option>

          {almacenes.map((item) => (
            <option key={item} value={item ?? ""}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-medium">
          {movimientosFiltrados.length} registros
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Movimiento</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Destino</th>
            </tr>
          </thead>

          <tbody>
            {movimientosFiltrados.map((item, index) => (
              <tr
                key={index}
                className="border-t border-slate-100"
              >
                <td className="px-4 py-3">
                  {new Date(item.fecha).toLocaleDateString(
                    "es-PE"
                  )}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${tipoBadge(
                      item.tipo
                    )}`}
                  >
                    {item.tipo}
                  </span>
                </td>

                <td className="px-4 py-3 font-semibold">
                  {item.numero_movimiento}
                </td>

                <td className="px-4 py-3">
                  {item.numero_orden ?? "-"}
                </td>

                <td className="px-4 py-3 font-semibold">
                  {item.sku}
                </td>

                <td className="px-4 py-3">
                  {item.producto}
                </td>

                <td className="px-4 py-3 font-bold">
                  {item.cantidad}
                </td>

                <td className="px-4 py-3">
                  {item.almacen_origen ?? "-"}
                </td>

                <td className="px-4 py-3">
                  {item.almacen_destino ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}