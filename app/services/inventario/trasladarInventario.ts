import { supabase } from "@/src/lib/supabase"

export type TrasladarInventarioInput = {
  productoId: string
  almacenOrigenId: string
  almacenDestinoId: string
  cantidad: number
  motivo: string
}

export type TrasladarInventarioResultado = {
  movimiento_id: string
  numero_movimiento: string
  stock_origen_anterior: number
  stock_origen_nuevo: number
  stock_destino_anterior: number
  stock_destino_nuevo: number
}

export async function trasladarInventario(
  input: TrasladarInventarioInput
): Promise<TrasladarInventarioResultado> {
  if (!input.productoId) {
    throw new Error("El producto es obligatorio.")
  }

  if (!input.almacenOrigenId) {
    throw new Error("El almacén de origen es obligatorio.")
  }

  if (!input.almacenDestinoId) {
    throw new Error("El almacén de destino es obligatorio.")
  }

  if (input.almacenOrigenId === input.almacenDestinoId) {
    throw new Error(
      "El almacén de origen y destino deben ser diferentes."
    )
  }

  if (!Number.isFinite(input.cantidad) || input.cantidad <= 0) {
    throw new Error("La cantidad debe ser mayor que cero.")
  }

  if (!input.motivo.trim()) {
    throw new Error("El motivo del traslado es obligatorio.")
  }

  const { data, error } = await supabase.rpc(
    "trasladar_inventario_publico",
    {
      p_producto_id: input.productoId,
      p_almacen_origen_id: input.almacenOrigenId,
      p_almacen_destino_id: input.almacenDestinoId,
      p_cantidad: input.cantidad,
      p_motivo: input.motivo.trim(),
    }
  )

  if (error) {
    throw new Error(
      error.message || "No se pudo realizar el traslado."
    )
  }

  const resultado = data?.[0]

  if (!resultado) {
    throw new Error(
      "Supabase no devolvió el resultado del traslado."
    )
  }

  return {
    movimiento_id: resultado.movimiento_id,
    numero_movimiento: resultado.numero_movimiento,
    stock_origen_anterior: Number(
      resultado.stock_origen_anterior ?? 0
    ),
    stock_origen_nuevo: Number(
      resultado.stock_origen_nuevo ?? 0
    ),
    stock_destino_anterior: Number(
      resultado.stock_destino_anterior ?? 0
    ),
    stock_destino_nuevo: Number(
      resultado.stock_destino_nuevo ?? 0
    ),
  }
}