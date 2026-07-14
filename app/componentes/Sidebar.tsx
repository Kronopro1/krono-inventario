"use client"

import Link from "next/link"

import {
  LayoutDashboard,
  Boxes,
  ArrowDownCircle,
  ArrowRightLeft,
  PackageSearch,
  ShoppingCart,
  CloudDownload,
  Package,
  Layers3,
  Users,
  LogOut,
  ChevronDown,
} from "lucide-react"

export type SidebarPerfil = {
  nombre: string
  email: string
  rol: string
}

import { ReactNode, useMemo, useState } from "react"

type SidebarLink = {
  label: string
  href: string
  icon: ReactNode
}

type SidebarProps = {
  pathname: string
  perfil: SidebarPerfil | null
  menuAbierto: boolean
  puedeVerGeneral: boolean
  puedeVerInventario: boolean
  puedeOperarInventario: boolean
  puedeVender: boolean
  puedeVerMovimientos: boolean
  puedeVerConfiguracion: boolean
  onClose: () => void
  onLogout: () => void
}

function NavLink({
  link,
  pathname,
  onClick,
}: {
  link: SidebarLink
  pathname: string
  onClick: () => void
}) {
  const activo =
    link.href === "/"
      ? pathname === "/"
      : pathname === link.href || pathname.startsWith(`${link.href}/`)

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
        activo
  ? "bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg scale-[1.02]"
  : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
      }`}
    >
      <span className="w-5 text-center">{link.icon}</span>
      <span>{link.label}</span>
    </Link>
  )
}

function MenuSection({
  title,
  links,
  pathname,
  onClick,
}: {
  title: string
  links: SidebarLink[]
  pathname: string
  onClick: () => void
}) {
  const [abierto, setAbierto] = useState(true)

  if (links.length === 0) return null

  return (
    <section>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 transition hover:bg-slate-900 hover:text-slate-300"
      >
        <span>{title}</span>
        <ChevronDown
  size={16}
  className={`transition-transform ${
    abierto ? "rotate-180" : ""
  }`}
/>
      </button>

      {abierto && (
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.href}
              link={link}
              pathname={pathname}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default function Sidebar({
  pathname,
  perfil,
  menuAbierto,
  puedeVerGeneral,
  puedeVerInventario,
  puedeOperarInventario,
  puedeVender,
  puedeVerMovimientos,
  puedeVerConfiguracion,
  onClose,
  onLogout,
}: SidebarProps) {
    const [busqueda, setBusqueda] = useState("")
    const filtrarLinks = (links: SidebarLink[]) => {
  const termino = busqueda.trim().toLowerCase()

  if (!termino) return links

  return links.filter((link) =>
    link.label.toLowerCase().includes(termino)
  )
}
  const principal: SidebarLink[] = puedeVerGeneral
  ? [
      {
        label: "Inicio",
        href: "/",
        icon: <LayoutDashboard size={18} />,
      },
    ]
  : []

  const inventario: SidebarLink[] = []

  if (puedeVerInventario) {
    inventario.push({
      label: "Inventario",
      href: "/inventario",
      icon: "▦",
    })
  }

  if (puedeOperarInventario) {
    inventario.push(
      { label: "Ingresos", href: "/ingresos", icon: <ArrowDownCircle size={18} /> },
      { label: "Traslados", href: "/traslados", icon: <ArrowRightLeft size={18} /> }
    )
  }

  if (puedeVerMovimientos) {
    inventario.push({
      label: "Kardex",
      href: "/movimientos",
      icon: <PackageSearch size={18} />,
    })
  }

  const catalogo: SidebarLink[] = puedeVerConfiguracion
    ? [
        {
          label: "Productos",
          href: "/configuracion/productos",
          icon: <Package size={18} />,
        },
        {
          label: "Combos",
          href: "/configuracion/combos",
          icon: <Layers3 size={18} />,
        },
      ]
    : []

  const marketplace: SidebarLink[] = puedeVender
    ? [
        { label: "Ventas", href: "/ventas", icon: <ShoppingCart size={18} /> },
        {
          label: "Importaciones Falabella",
          href: "/ventas/importadas",
          icon: <CloudDownload size={18} />,
        },
      ]
    : []

  const administracion: SidebarLink[] = puedeVerConfiguracion
    ? [
        {
          label: "Usuarios",
          href: "/configuracion/usuarios",
          icon: <Users size={18} />,
        },
      ]
    : []

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl transition-transform duration-300 md:translate-x-0 ${
        menuAbierto ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-slate-800 px-5 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-bold tracking-tight">Krono</p>
            <p className="mt-1 text-sm text-slate-400">ERP Comercial</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold md:hidden"
          >
            X
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-5">
  <input
    type="search"
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    placeholder="Buscar módulo..."
    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
  />
</div>
        {perfil && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-semibold">{perfil.nombre}</p>
            <p className="mt-1 truncate text-xs text-slate-400">
              {perfil.email}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-200">
              {perfil.rol}
            </span>
          </div>
        )}

        <nav className="space-y-8 text-sm">
          <MenuSection
            title="Principal"
            links={filtrarLinks(principal)}
            pathname={pathname}
            onClick={onClose}
          />

          <MenuSection
            title="Inventario"
            links={filtrarLinks(inventario)}
            pathname={pathname}
            onClick={onClose}
          />

          <MenuSection
            title="Catálogo"
            links={filtrarLinks(catalogo)}
            pathname={pathname}
            onClick={onClose}
          />

          <MenuSection
            title="Marketplace"
            links={filtrarLinks(marketplace)}
            pathname={pathname}
            onClick={onClose}
          />

          <MenuSection
            title="Administración"
            links={filtrarLinks(administracion)}
            pathname={pathname}
            onClick={onClose}
          />
        </nav>
      </div>

      <div className="border-t border-slate-800 p-5">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
        >
          <span className="flex items-center justify-center gap-2">
  <LogOut size={17} />
  Cerrar sesión
</span>
        </button>
      </div>
    </aside>
  )
}