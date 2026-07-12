type Props = {
  nombre: string
  stock: number
  minimo: number
}

export default function AlmacenCard({
  nombre,
  stock,
  minimo,
}: Props) {
  const estado =
    stock <= 0
      ? "Sin stock"
      : stock <= minimo
      ? "Stock bajo"
      : "Disponible"

  const color =
    stock <= 0
      ? "bg-red-50 text-red-700"
      : stock <= minimo
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700"

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            📦 {nombre}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stock}
          </p>

          <p className="text-xs text-slate-500">
            Stock mínimo: {minimo}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}
        >
          {estado}
        </span>
      </div>
    </div>
  )
}