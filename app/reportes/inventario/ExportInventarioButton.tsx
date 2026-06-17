"use client"

import * as XLSX from "xlsx"

type InventarioItem = {
  sku: string
  producto: string
  stock_total: number
  costo_unitario: number
  precio_venta: number
  costo_total: number
  valor_venta_total: number
  margen_potencial: number
}

export default function ExportInventarioButton({
  inventario,
}: {
  inventario: InventarioItem[]
}) {
  const exportarExcel = () => {
    const data = inventario.map((item) => ({
      SKU: item.sku,
      Producto: item.producto,
      Stock: item.stock_total,
      "Costo Unitario": item.costo_unitario,
      "Precio Venta": item.precio_venta,
      "Costo Total": item.costo_total,
      "Venta Potencial": item.valor_venta_total,
      "Margen Potencial": item.margen_potencial,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario")

    XLSX.writeFile(workbook, "inventario_valorizado.xlsx")
  }

  return (
    <button
      type="button"
      onClick={exportarExcel}
      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
    >
      Exportar Excel
    </button>
  )
}