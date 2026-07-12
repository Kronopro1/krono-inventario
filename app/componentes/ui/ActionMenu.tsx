"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { MoreVertical } from "lucide-react"

export type ActionMenuItem = {
  label: string
  icon?: ReactNode
  onClick?: () => void
  href?: string
  danger?: boolean
  hidden?: boolean
}

type ActionMenuProps = {
  items: ActionMenuItem[]
  buttonLabel?: string
}

export default function ActionMenu({
  items,
  buttonLabel = "Acciones",
}: ActionMenuProps) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  const itemsVisibles = items.filter((item) => !item.hidden)

  useEffect(() => {
    function cerrarAlHacerClickFuera(event: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false)
      }
    }

    document.addEventListener("mousedown", cerrarAlHacerClickFuera)

    return () => {
      document.removeEventListener("mousedown", cerrarAlHacerClickFuera)
    }
  }, [])

  function ejecutarAccion(item: ActionMenuItem) {
    setAbierto(false)

    if (item.onClick) {
      item.onClick()
    }

    if (item.href) {
      window.location.href = item.href
    }
  }

  if (itemsVisibles.length === 0) return null

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
      >
        <span>{buttonLabel}</span>
        <MoreVertical size={18} />
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 min-w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {itemsVisibles.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => ejecutarAccion(item)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.icon && (
                <span className="flex h-5 w-5 items-center justify-center">
                  {item.icon}
                </span>
              )}

              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}