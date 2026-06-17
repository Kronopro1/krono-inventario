import Link from "next/link"
import { supabase } from "@/src/lib/supabase"
import DashboardCharts from "./componentes/DashboardCharts"

export const dynamic = "force-dynamic"

type InventarioTotal = {
  sku: string
  producto: string
  stock_total: number
  costo_unitario: number
  precio_venta: number
  costo_total: number
  valor_venta_total: number
  margen_potencial: number
}

type AlmacenResumen = {
  codigo_almacen: string
  almacen: string
  unidades: number
  costo_total: number
  valor_venta_total: number
  margen_potencial: number
}

type TopProducto = {
  sku: string
  nombre: string
  es_combo: boolean
  unidades_vendidas: number
}

export default async function Home() {
  const { data: inventarioData } = await supabase.rpc(
    "obtener_inventario_total_publico"
  )

  const { data: almacenesData } = await supabase.rpc(
    "obtener_valor_inventario_por_almacen"
  )

  const { data: dashboardComercial } = await supabase.rpc(
    "obtener_dashboard_comercial_publico"
  )

  const { data: topProductosData } = await supabase.rpc(
    "obtener_top_productos_publico"
  )

  const inventarioTotal = (inventarioData ?? []) as InventarioTotal[]
  const almacenes = (almacenesData ?? []) as AlmacenResumen[]
  const topProductos = (topProductosData ?? []) as TopProducto[]
  const comercial = dashboardComercial?.[0]

  const { data: kits } = await supabase
    .from("vista_resumen_kits")
    .select("*")
    .order("combo_sku")

  const { data: alertas } = await supabase
    .from("vista_alertas_reposicion")
    .select("*")
    .neq("estado", "OK")
    .limit(6)

  const productosCount = inventarioTotal.length

  const unidadesTotales = inventarioTotal.reduce(
    (sum, item) => sum + Number(item.stock_total ?? 0),
    0
  )

  const costoTotalInventario = inventarioTotal.reduce(
    (sum, item) => sum + Number(item.costo_total ?? 0),
    0
  )

  const valorVentaTotal = inventarioTotal.reduce(
    (sum, item) => sum + Number(item.valor_venta_total ?? 0),
    0
  )

  const margenPotencial = inventarioTotal.reduce(
    (sum, item) => sum + Number(item.margen_potencial ?? 0),
    0
  )

  const maxCostoAlmacen = Math.max(
    ...almacenes.map((a) => Number(a.costo_total ?? 0)),
    1
  )

  const productosTopValor = [...inventarioTotal]
    .sort((a, b) => Number(b.costo_total ?? 0) - Number(a.costo_total ?? 0))
    .slice(0, 5)

  const cards = [
    {
      label: "Costo inventario",
      value: `S/ ${costoTotalInventario.toFixed(2)}`,
      helper: "Valor a costo unitario",
      icon: "💰",
    },
    {
      label: "Venta potencial",
      value: `S/ ${valorVentaTotal.toFixed(2)}`,
      helper: "Valor estimado a precio venta",
      icon: "💵",
    },
    {
      label: "Margen potencial",
      value: `S/ ${margenPotencial.toFixed(2)}`,
      helper: "Venta potencial menos costo",
      icon: "📈",
    },
    {
      label: "Unidades totales",
      value: unidadesTotales,
      helper: "Inventario físico consolidado",
      icon: "📦",
    },
    {
      label: "Órdenes",
      value: comercial?.total_ordenes ?? 0,
      helper: "Ventas registradas",
      icon: "🛒",
    },
    {
      label: "Unidades vendidas",
      value: comercial?.unidades_vendidas ?? 0,
      helper: "Movimiento comercial",
      icon: "📈",
    },
    {
      label: "Productos vendidos",
      value: comercial?.productos_distintos ?? 0,
      helper: "SKUs comercializados",
      icon: "🏷️",
    },
    {
      label: "Combos vendidos",
      value: comercial?.combos_vendidos ?? 0,
      helper: "Kits vendidos",
      icon: "🔥",
    },
  ]

  return (
    <main>
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Krono Inventory
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Dashboard ejecutivo
          </h1>

          <p className="mt-2 text-slate-500">
            Vista gerencial del valor de inventario, margen potencial, almacenes,
            kits, ventas y alertas.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/ventas"
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Nueva venta
          </Link>

          <Link
            href="/ingresos"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Nuevo ingreso
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-slate-100 p-3 text-xl">
                {card.icon}
              </div>

              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                Live
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              {card.label}
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {card.value}
            </h2>

            <p className="mt-2 text-sm text-slate-400">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">
              Distribución por almacén
            </h2>

            <p className="text-sm text-slate-500">
              Valor del inventario por ubicación.
            </p>
          </div>

          <div className="space-y-4">
            {almacenes.map((almacen) => {
              const porcentaje =
                (Number(almacen.costo_total ?? 0) / maxCostoAlmacen) * 100

              return (
                <div key={almacen.codigo_almacen}>
                  <div className="mb-1 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-700">
                        {almacen.codigo_almacen}
                      </span>
                      <p className="text-xs text-slate-400">
                        {almacen.almacen}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        S/ {Number(almacen.costo_total ?? 0).toFixed(2)}
                      </span>
                      <p className="text-xs text-slate-400">
                        {almacen.unidades} unidades
                      </p>
                    </div>
                  </div>

                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-slate-900"
                      style={{
                        width: `${porcentaje}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">
              Resumen ejecutivo
            </h2>

            <p className="text-sm text-slate-500">
              Indicadores estratégicos del inventario.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Valor inventario
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                S/ {costoTotalInventario.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Venta potencial
              </p>

              <p className="mt-1 text-2xl font-bold text-green-700">
                S/ {valorVentaTotal.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Margen potencial
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-700">
                S/ {margenPotencial.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Productos críticos
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {alertas?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <DashboardCharts almacenes={almacenes} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Productos con mayor valor en inventario
              </h2>
              <p className="text-sm text-slate-500">
                Ranking por costo total acumulado.
              </p>
            </div>

            <Link
              href="/inventario"
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Ver inventario
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Costo total</th>
                  <th className="px-4 py-3">Venta potencial</th>
                </tr>
              </thead>

              <tbody>
                {productosTopValor.map((item) => (
                  <tr key={item.sku} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {item.sku}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {item.producto}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-950">
                      {item.stock_total}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-900">
                      S/ {Number(item.costo_total).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      S/ {Number(item.valor_venta_total).toFixed(2)}
                    </td>
                  </tr>
                ))}

                {productosTopValor.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No hay productos con stock valorizado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">
              Indicadores operativos
            </h2>

            <p className="text-sm text-slate-500">
              Estado general del catálogo.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Productos base
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {productosCount}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Combos configurados
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {kits?.length ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Alertas activas
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {alertas?.length ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Unidades totales
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {unidadesTotales}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Kits disponibles
              </h2>

              <p className="text-sm text-slate-500">
                Capacidad de venta según stock actual.
              </p>
            </div>

            <Link
              href="/configuracion/combos"
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Ver combos
            </Link>
          </div>

          <div className="space-y-3">
            {kits?.map((kit) => (
              <div
                key={kit.combo_sku}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {kit.combo_nombre}
                  </p>

                  <p className="text-xs text-slate-400">{kit.combo_sku}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-950">
                    {kit.kits_disponibles}
                  </p>

                  <p className="text-xs text-slate-400">disponibles</p>
                </div>
              </div>
            ))}

            {(!kits || kits.length === 0) && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No hay kits configurados.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">
              Alertas de reposición
            </h2>

            <p className="text-sm text-slate-500">
              Productos bajo mínimo o críticos.
            </p>
          </div>

          <div className="space-y-3">
            {alertas?.map((item) => (
              <div
                key={item.sku}
                className="rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.producto}
                    </p>

                    <p className="text-xs text-slate-400">{item.sku}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.estado === "CRITICO"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.estado}
                  </span>
                </div>
              </div>
            ))}

            {(!alertas || alertas.length === 0) && (
              <div className="rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-700">
                Sin alertas activas.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">
            🏆 Top productos vendidos
          </h2>

          <p className="text-sm text-slate-500">
            Ranking comercial según unidades vendidas.
          </p>
        </div>

        <div className="space-y-3">
          {topProductos.map((producto, index) => (
            <div
              key={producto.sku}
              className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold">
                  #{index + 1}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {producto.nombre}
                  </p>

                  <p className="text-xs text-slate-400">
                    {producto.sku}
                    {producto.es_combo ? " · Combo" : ""}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-slate-950">
                  {producto.unidades_vendidas}
                </p>

                <p className="text-xs text-slate-400">unidades</p>
              </div>
            </div>
          ))}

          {topProductos.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              No hay ventas registradas todavía.
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Accesos rápidos</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Link
            href="/ventas"
            className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
          >
            <p className="text-xl">🛒</p>
            <p className="mt-2 font-semibold">Registrar venta</p>
            <p className="text-sm text-slate-500">Marketplace o canal directo</p>
          </Link>

          <Link
            href="/ingresos"
            className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
          >
            <p className="text-xl">📥</p>
            <p className="mt-2 font-semibold">Registrar ingreso</p>
            <p className="text-sm text-slate-500">Reposición de mercadería</p>
          </Link>

          <Link
            href="/traslados"
            className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
          >
            <p className="text-xl">🔄</p>
            <p className="mt-2 font-semibold">Registrar traslado</p>
            <p className="text-sm text-slate-500">Entre almacenes</p>
          </Link>

          <Link
            href="/configuracion/nuevo-producto"
            className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
          >
            <p className="text-xl">➕</p>
            <p className="mt-2 font-semibold">Nuevo producto</p>
            <p className="text-sm text-slate-500">Crear SKU físico</p>
          </Link>
        </div>
      </section>
    </main>
  )
}