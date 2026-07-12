import { supabase } from "@/src/lib/supabase"

export type TipoAjusteInventario =
  | "aumentar"
  | "disminuir"
  | "establecer"

export type AjustarInventarioInput = {
  productoId: string
  almacenId: string
  tipoAjuste: TipoAjusteInventario
  cantidad: number
  motivo: string
}

export type AjustarInventarioResultado = {
  movimiento_id: string
  numero_movimiento: string
  stock_anterior: number
  stock_nuevo: number
}

export async function ajustarInventario(
  input: AjustarInventarioInput
): Promise<AjustarInventarioResultado> {
  if (!input.productoId) {
    throw new Error("El producto es obligatorio.")
  }

  if (!input.almacenId) {
    throw new Error("El almacén es obligatorio.")
  }

  if (
    !Number.isFinite(input.cantidad) ||
    input.cantidad < 0
  ) {
    throw new Error("La cantidad ingresada no es válida.")
  }

  if (!input.motivo.trim()) {
    throw new Error("El motivo del ajuste es obligatorio.")
  }

  const { data, error } = await supabase.rpc(
    "ajustar_inventario_publico",
    {
      p_producto_id: input.productoId,
      p_almacen_id: input.almacenId,
      p_tipo_ajuste: input.tipoAjuste,
      p_cantidad: input.cantidad,
      p_motivo: input.motivo.trim(),
    }
  )

  if (error) {
    throw new Error(
      error.message || "No se pudo realizar el ajuste de inventario."
    )
  }

  const resultado = data?.[0]

  if (!resultado) {
    throw new Error(
      "Supabase no devolvió el resultado del ajuste."
    )
  }

  return {
    movimiento_id: resultado.movimiento_id,
    numero_movimiento: resultado.numero_movimiento,
    stock_anterior: Number(resultado.stock_anterior ?? 0),
    stock_nuevo: Number(resultado.stock_nuevo ?? 0),
  }
}