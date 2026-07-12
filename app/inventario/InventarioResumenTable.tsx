"use client"

import { Fragment, useMemo, useState } from "react"
import AlmacenCard from "@/app/componentes/inventario/AlmacenCard"
import ActionMenu from "@/app/componentes/ui/ActionMenu"
import { useInventario } from "@/app/hooks/useInventario"
import { useRouter } from "next/navigation"
import { trasladarInventario } from "../services/inventario/trasladarInventario"
import TrasladoInventarioModal from "@/app/componentes/inventario/TrasladoInventarioModal"
import { ajustarInventario } from "../services/inventario/ajustarInventario"
import AjusteInventarioModal from "@/app/componentes/inventario/AjusteInventarioModal"
import { ChevronRight, ChevronDown } from "lucide-react"

type DetalleAlmacen = {
  almacen_id: string
  almacen_nombre: string
  stock_actual: number | string | null
  stock_minimo: number | string | null
}


export type ItemInventarioResumen = {
  producto_id: string
  sku: string
  nombre: string
  marca: string | null
  tipo: string | null
  es_combo: boolean
  activo: boolean
  precio_venta: number | string | null
  costo_unitario: number | string | null
  stock_deposito_82: number | string | null
  stock_total: number | string | null
  detalle_almacenes: DetalleAlmacen[] | null
  estado_inventario: string | null
}

function obtenerEstado(item: ItemInventarioResumen) {
  const estado = item.estado_inventario?.toUpperCase() ?? "OK"

  if (estado === "SIN STOCK") {
    return {
      texto: "Agotado",
      clase: "bg-red-50 text-red-700 ring-red-200",
    }
  }

  if (estado === "STOCK BAJO") {
    return {
      texto: "Reponer",
      clase: "bg-amber-50 text-amber-700 ring-amber-200",
    }
  }

  if (estado === "COMBO") {
    return {
      texto: "Combo",
      clase: "bg-violet-50 text-violet-700 ring-violet-200",
    }
  }

  return {
    texto: "Disponible",
    clase: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  }
}

function obtenerTipo(item: ItemInventarioResumen) {
  if (item.es_combo) return "Combo"
  return item.tipo || "Individual"
}

function normalizarDetalle(
  detalle: ItemInventarioResumen["detalle_almacenes"]
): DetalleAlmacen[] {
  if (!Array.isArray(detalle)) return []

  return detalle.map((item) => ({
    ...item,
    stock_actual: Number(item.stock_actual ?? 0),
    stock_minimo: Number(item.stock_minimo ?? 0),
  }))
}

export default function InventarioResumenTable({
  inventario,
}: {
  inventario: ItemInventarioResumen[]
}) {
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroAlmacen, setFiltroAlmacen] = useState("")
  const router = useRouter()
  const [filasAbiertas, setFilasAbiertas] = useState<Set<string>>(new Set())
const {
  productoSeleccionado,
  ajusteAbierto,
  abrirAjuste,
  cerrarAjuste,
  trasladoAbierto,
  abrirTraslado,
  cerrarTraslado,
} = useInventario()

  const almacenesDisponibles = useMemo(() => {
    const almacenes = new Set<string>()

    inventario.forEach((item) => {
      normalizarDetalle(item.detalle_almacenes).forEach((detalle) => {
        if (detalle.almacen_nombre) {
          almacenes.add(detalle.almacen_nombre)
        }
      })
    })

    return Array.from(almacenes).sort((a, b) => a.localeCompare(b))
  }, [inventario])

  const inventarioFiltrado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return inventario.filter((item) => {
      const detalle = normalizarDetalle(item.detalle_almacenes)

      const coincideBusqueda =
        !termino ||
        [
          item.sku,
          item.nombre,
          item.marca ?? "",
          item.tipo ?? "",
          ...detalle.map((almacen) => almacen.almacen_nombre),
        ]
          .join(" ")
          .toLowerCase()
          .includes(termino)

      const coincideTipo =
        !filtroTipo ||
        (filtroTipo === "combo" && item.es_combo) ||
        (filtroTipo === "individual" && !item.es_combo)

      const estado = item.estado_inventario?.toUpperCase() ?? "OK"

      const coincideEstado =
        !filtroEstado ||
        (filtroEstado === "con-stock" && Number(item.stock_total ?? 0) > 0) ||
        (filtroEstado === "sin-stock" && Number(item.stock_total ?? 0) <= 0) ||
        (filtroEstado === "stock-bajo" && estado === "STOCK BAJO")

      const coincideAlmacen =
        !filtroAlmacen ||
        detalle.some(
          (almacen) =>
            almacen.almacen_nombre === filtroAlmacen &&
            Number(almacen.stock_actual ?? 0) !== 0
        )

      return (
        coincideBusqueda &&
        coincideTipo &&
        coincideEstado &&
        coincideAlmacen
      )
    })
  }, [inventario, busqueda, filtroTipo, filtroEstado, filtroAlmacen])

  function alternarFila(productoId: string) {
    setFilasAbiertas((actual) => {
      const siguiente = new Set(actual)

      if (siguiente.has(productoId)) {
        siguiente.delete(productoId)
      } else {
        siguiente.add(productoId)
      }

      return siguiente
    })
  }

  function limpiarFiltros() {
    setBusqueda("")
    setFiltroTipo("")
    setFiltroEstado("")
    setFiltroAlmacen("")
  }

  const hayFiltros =
    busqueda || filtroTipo || filtroEstado || filtroAlmacen

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Buscar
          </label>

          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por SKU, producto, marca o almacén..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tipo
          </label>

          <select
            value={filtroTipo}
            onChange={(event) => setFiltroTipo(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          >
            <option value="">Todos</option>
            <option value="individual">Individual</option>
            <option value="combo">Combo</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Estado
          </label>

          <select
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          >
            <option value="">Todos</option>
            <option value="con-stock">Con stock</option>
            <option value="sin-stock">Sin stock</option>
            <option value="stock-bajo">Stock bajo</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Almacén
          </label>

          <select
            value={filtroAlmacen}
            onChange={(event) => setFiltroAlmacen(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          >
            <option value="">Todos los almacenes</option>

            {almacenesDisponibles.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="my-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          Productos encontrados:{" "}
          <span className="font-semibold text-slate-950">
            {inventarioFiltrado.length}
          </span>
        </p>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="self-start rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 sm:self-auto"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-12 px-4 py-3"></th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3 text-right">Depósito 82</th>
              <th className="px-4 py-3 text-right">Stock total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>

          <tbody>
            {inventarioFiltrado.map((item) => {
              const abierto = filasAbiertas.has(item.producto_id)
              const estado = obtenerEstado(item)
              const detalleAlmacenes = normalizarDetalle(
                item.detalle_almacenes
              )

              return (
                <Fragment key={item.producto_id}>
                  <tr className="border-t border-slate-100 transition hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <button
  type="button"
  onClick={() => alternarFila(item.producto_id)}
  aria-label={
    abierto
      ? "Cerrar distribución"
      : "Ver distribución"
  }
  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
>
  {abierto ? (
    <ChevronDown size={18} />
  ) : (
    <ChevronRight size={18} />
  )}
</button>
                    </td>



                    <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                                    item.es_combo
                                        ? "bg-violet-50 text-violet-700"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                >
                                  {item.es_combo ? "📦" : "🧴"}
                                </div>

                            <div>
  <p className="text-sm font-semibold text-slate-900">
    {item.nombre}
  </p>

  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
    <span>SKU: {item.sku}</span>

    <span>•</span>

    <span>{item.marca ?? "Sin marca"}</span>

    <span>•</span>

    <span>{item.es_combo ? "Combo" : "Producto"}</span>
  </div>
</div>
                </div>
            </td>

                    <td className="px-4 py-4 text-slate-600">
                      {item.marca || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.es_combo
                            ? "bg-violet-50 text-violet-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {obtenerTipo(item)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right font-medium text-slate-700">
                      {Number(item.stock_deposito_82 ?? 0)}
                    </td>

                    <td className="px-4 py-4 text-right text-lg font-bold text-slate-950">
                      {Number(item.stock_total ?? 0)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${estado.clase}`}
                      >
                        {estado.texto}
                      </span>
                    </td>
                  </tr>

                  {abierto && (
  <tr className="border-t border-slate-100 bg-slate-50/60">
    <td colSpan={7} className="px-6 py-6">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4">
            <h3 className="font-bold text-slate-950">
              Distribución por almacén
            </h3>

            <p className="text-sm text-slate-500">
              Existencia física actual del producto.
            </p>
          </div>

          {detalleAlmacenes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {detalleAlmacenes.map((detalle) => (
                <AlmacenCard
                  key={detalle.almacen_id}
                  nombre={detalle.almacen_nombre}
                  stock={Number(detalle.stock_actual ?? 0)}
                  minimo={Number(detalle.stock_minimo ?? 0)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Este producto no tiene almacenes registrados.
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <span className="font-semibold text-slate-700">
              Stock total
            </span>

            <span className="text-2xl font-bold text-slate-950">
              {Number(item.stock_total ?? 0)}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-950">
            Acciones
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Herramientas disponibles para este producto.
          </p>

          <div className="mt-4">
  <ActionMenu
    items={[
      {
  label: "Ajustar inventario",
  onClick: () => abrirAjuste(item),
},
      {
  label: "Trasladar inventario",
  onClick: () => abrirTraslado(item),
},
      {
        label: "Ver Kardex",
        href: `/reportes/kardex?producto_id=${item.producto_id}`,
      },
      {
        label: "Ver movimientos",
        href: `/movimientos?producto_id=${item.producto_id}`,
      },
      {
        label: "Ver componentes del combo",
        href: `/configuracion/combos/${item.producto_id}`,
        hidden: !item.es_combo,
      },
    ]}
  />
</div>
        </div>
      </div>
    </td>
  </tr>
)}
                </Fragment>
              )
            })}

            {inventarioFiltrado.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No se encontraron productos para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
<AjusteInventarioModal
  abierto={ajusteAbierto}
  productoNombre={productoSeleccionado?.nombre ?? ""}
  productoSku={productoSeleccionado?.sku ?? ""}
  almacenes={
    productoSeleccionado?.detalle_almacenes?.map((almacen) => ({
      almacen_id: almacen.almacen_id,
      almacen_nombre: almacen.almacen_nombre,
      stock_actual: Number(almacen.stock_actual ?? 0),
    })) ?? []
  }
  onClose={cerrarAjuste}
  onConfirmar={async (datos) => {
    if (!productoSeleccionado) {
      throw new Error("No hay un producto seleccionado.")
    }

    const resultado = await ajustarInventario({
      productoId: productoSeleccionado.producto_id,
      almacenId: datos.almacenId,
      tipoAjuste: datos.tipoAjuste,
      cantidad: datos.cantidad,
      motivo: datos.motivo,
    })

    alert(
      `Movimiento ${resultado.numero_movimiento} registrado correctamente.\n\n` +
        `Stock anterior: ${resultado.stock_anterior}\n` +
        `Stock nuevo: ${resultado.stock_nuevo}`
    )

    cerrarAjuste()
    router.refresh()
  }}
/>
<AjusteInventarioModal
  abierto={ajusteAbierto}
  productoNombre={productoSeleccionado?.nombre ?? ""}
  productoSku={productoSeleccionado?.sku ?? ""}
  almacenes={
    productoSeleccionado?.detalle_almacenes?.map((almacen) => ({
      almacen_id: almacen.almacen_id,
      almacen_nombre: almacen.almacen_nombre,
      stock_actual: Number(almacen.stock_actual ?? 0),
    })) ?? []
  }
  onClose={cerrarAjuste}
  onConfirmar={async (datos) => {
    if (!productoSeleccionado) {
      throw new Error("No hay un producto seleccionado.")
    }

    const resultado = await ajustarInventario({
      productoId: productoSeleccionado.producto_id,
      almacenId: datos.almacenId,
      tipoAjuste: datos.tipoAjuste,
      cantidad: datos.cantidad,
      motivo: datos.motivo,
    })

    alert(
      `Movimiento ${resultado.numero_movimiento} registrado correctamente.\n\n` +
        `Stock anterior: ${resultado.stock_anterior}\n` +
        `Stock nuevo: ${resultado.stock_nuevo}`
    )

    cerrarAjuste()
    router.refresh()
  }}
/>

<TrasladoInventarioModal
  abierto={trasladoAbierto}
  productoNombre={productoSeleccionado?.nombre ?? ""}
  productoSku={productoSeleccionado?.sku ?? ""}
  almacenes={
    productoSeleccionado?.detalle_almacenes?.map((almacen) => ({
      almacen_id: almacen.almacen_id,
      almacen_nombre: almacen.almacen_nombre,
      stock_actual: Number(almacen.stock_actual ?? 0),
    })) ?? []
  }
  onClose={cerrarTraslado}
  onConfirmar={async (datos) => {
  if (!productoSeleccionado) {
    throw new Error("No hay un producto seleccionado.")
  }

  const resultado = await trasladarInventario({
    productoId: productoSeleccionado.producto_id,
    almacenOrigenId: datos.almacenOrigenId,
    almacenDestinoId: datos.almacenDestinoId,
    cantidad: datos.cantidad,
    motivo: datos.motivo,
  })

  alert(
    `Movimiento ${resultado.numero_movimiento} registrado correctamente.\n\n` +
      `Origen: ${resultado.stock_origen_anterior} → ${resultado.stock_origen_nuevo}\n` +
      `Destino: ${resultado.stock_destino_anterior} → ${resultado.stock_destino_nuevo}`
  )

  cerrarTraslado()
  router.refresh()
}}
/>     
    </div>
  )
}