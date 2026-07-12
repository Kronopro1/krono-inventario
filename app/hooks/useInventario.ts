"use client"

import { useState } from "react"

type DetalleAlmacen = {
  almacen_id: string
  almacen_nombre: string
  stock_actual: number | string | null
  stock_minimo: number | string | null
}

export type ProductoInventario = {
  producto_id: string
  sku: string
  nombre: string
  detalle_almacenes: DetalleAlmacen[] | null
}

export function useInventario() {
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoInventario | null>(null)

  const [ajusteAbierto, setAjusteAbierto] = useState(false)

  const [trasladoAbierto, setTrasladoAbierto] = useState(false)

  function abrirAjuste(producto: ProductoInventario) {
    setProductoSeleccionado(producto)
    setAjusteAbierto(true)
  }

  function cerrarAjuste() {
    setAjusteAbierto(false)
    setProductoSeleccionado(null)
  }

  function abrirTraslado(producto: ProductoInventario) {
    setProductoSeleccionado(producto)
    setTrasladoAbierto(true)
  }

  function cerrarTraslado() {
    setTrasladoAbierto(false)
    setProductoSeleccionado(null)
  }

  return {
    productoSeleccionado,

    ajusteAbierto,
    abrirAjuste,
    cerrarAjuste,

    trasladoAbierto,
    abrirTraslado,
    cerrarTraslado,
  }
}