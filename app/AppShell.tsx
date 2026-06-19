"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

type AppShellProps = {
  children: React.ReactNode
}

type Rol = "admin" | "operador" | "consulta" | "vendedor"

type Perfil = {
  nombre: string
  email: string
  rol: Rol
  activo: boolean
}

type MenuLink = {
  label: string
  href: string
}

function rutaInicioPorRol(rol: Rol) {
  if (rol === "operador") return "/inventario"
  if (rol === "vendedor") return "/ventas"
  if (rol === "consulta") return "/inventario"
  return "/"
}

function rutaPermitida(pathname: string, rol: Rol) {
  if (pathname === "/login") return true

  if (rol === "admin") return true

  if (rol === "operador") {
    return (
      pathname.startsWith("/inventario") ||
      pathname.startsWith("/ingresos") ||
      pathname.startsWith("/traslados") ||
      pathname.startsWith("/ventas") ||
      pathname.startsWith("/movimientos")
    )
  }

  if (rol === "consulta") {
    return (
      pathname === "/" ||
      pathname.startsWith("/inventario") ||
      pathname.startsWith("/reportes")
    )
  }

  if (rol === "vendedor") {
    return (
      pathname === "/" ||
      pathname.startsWith("/inventario") ||
      pathname.startsWith("/ventas")
    )
  }

  return false
}

function NavLink({
  href,
  label,
  pathname,
  onClick,
}: {
  href: string
  label: string
  pathname: string
  onClick: () => void
}) {
  const activo =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      onClick={onClick}
      href={href}
      className={`block rounded-xl px-3 py-2 transition ${
        activo
          ? "bg-white font-semibold text-slate-950"
          : "text-slate-200 hover:bg-slate-800"
      }`}
    >
      {label}
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
  links: MenuLink[]
  pathname: string
  onClick: () => void
}) {
  if (links.length === 0) return null

  return (
    <div>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <div className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            pathname={pathname}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  )
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [checking, setChecking] = useState(true)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [accesoDenegado, setAccesoDenegado] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  const isLoginPage = pathname === "/login"

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    setPerfil(null)
    router.push("/login")
    router.refresh()
  }

  useEffect(() => {
    const verificarSesion = async () => {
      setChecking(true)
      setAccesoDenegado(false)

      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (!session && !isLoginPage) {
        router.replace("/login")
        return
      }

      if (session && isLoginPage) {
        router.replace("/")
        return
      }

      if (session?.user?.email) {
        const { data: perfilData } = await supabase
          .from("perfiles")
          .select("nombre, email, rol, activo")
          .eq("email", session.user.email)
          .single()

        if (!perfilData || perfilData.activo === false) {
          await supabase.auth.signOut()
          router.replace("/login")
          return
        }

        const perfilUsuario = perfilData as Perfil
        setPerfil(perfilUsuario)

        if (pathname === "/" && perfilUsuario.rol !== "admin") {
          router.replace(rutaInicioPorRol(perfilUsuario.rol))
          return
        }

        if (!rutaPermitida(pathname, perfilUsuario.rol)) {
          setAccesoDenegado(true)
        }
      }

      setChecking(false)
    }

    verificarSesion()
  }, [pathname, router, isLoginPage])

  if (checking && !isLoginPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Verificando sesión...</p>
      </div>
    )
  }

  if (isLoginPage) return <>{children}</>

  const rol = perfil?.rol

  const puedeVerGeneral =
    rol === "admin" || rol === "consulta" || rol === "vendedor"

  const puedeVerInventario =
    rol === "admin" ||
    rol === "operador" ||
    rol === "consulta" ||
    rol === "vendedor"

  const puedeOperarInventario = rol === "admin" || rol === "operador"

  const puedeVender =
    rol === "admin" || rol === "operador" || rol === "vendedor"

  const puedeVerMovimientos = rol === "admin" || rol === "operador"

  const puedeVerConfiguracion = rol === "admin"

  const puedeVerReportes = rol === "admin" || rol === "consulta"

  const cerrarMenuMovil = () => setMenuAbierto(false)

  const linksGeneral: MenuLink[] = puedeVerGeneral
    ? [{ label: "Dashboard", href: "/" }]
    : []

  const linksInventario: MenuLink[] = []

  if (puedeVerInventario) {
    linksInventario.push({ label: "Inventario", href: "/inventario" })
  }

  if (puedeOperarInventario) {
    linksInventario.push(
      { label: "Ingresos", href: "/ingresos" },
      { label: "Traslados", href: "/traslados" }
    )
  }

  const linksOperaciones: MenuLink[] = []

  if (puedeVender) {
    linksOperaciones.push(
      { label: "Ventas Marketplace", href: "/ventas" },
      { label: "Ventas importadas", href: "/ventas/importadas" }
    )
  }

  if (puedeVerMovimientos) {
    linksOperaciones.push({ label: "Movimientos", href: "/movimientos" })
  }

  const linksConfiguracion: MenuLink[] = puedeVerConfiguracion
    ? [
        { label: "Usuarios", href: "/configuracion/usuarios" },
        { label: "Productos", href: "/configuracion/productos" },
        { label: "Combos", href: "/configuracion/combos" },
      ]
    : []

  const linksReportes: MenuLink[] = puedeVerReportes
    ? [
        { label: "Centro de reportes", href: "/reportes" },
        { label: "Inventario", href: "/reportes/inventario" },
        { label: "Ventas", href: "/reportes/ventas" },
        { label: "Ranking", href: "/reportes/ranking" },
        { label: "Alertas", href: "/reportes/alertas" },
        { label: "Kardex", href: "/reportes/kardex" },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div>
          <div className="text-lg font-bold text-slate-950">Krono</div>
          <div className="text-xs text-slate-500">Inventory System</div>
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
        >
          {menuAbierto ? "Cerrar" : "Menú"}
        </button>
      </div>

      {menuAbierto && (
        <button
          type="button"
          onClick={cerrarMenuMovil}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 overflow-y-auto border-r border-slate-800 bg-slate-950 px-5 py-6 text-white transition-transform duration-300 md:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        } md:block`}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-bold tracking-tight">Krono</div>
            <div className="text-sm text-slate-400">Inventory System</div>
          </div>

          <button
            type="button"
            onClick={cerrarMenuMovil}
            className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-white md:hidden"
          >
            X
          </button>
        </div>

        {perfil && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-semibold text-white">{perfil.nombre}</p>
            <p className="mt-1 text-xs text-slate-400">{perfil.email}</p>
            <p className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-bold uppercase text-slate-200">
              {perfil.rol}
            </p>
          </div>
        )}

        <nav className="space-y-6 text-sm">
          <MenuSection
            title="General"
            links={linksGeneral}
            pathname={pathname}
            onClick={cerrarMenuMovil}
          />

          <MenuSection
            title="Inventario"
            links={linksInventario}
            pathname={pathname}
            onClick={cerrarMenuMovil}
          />

          <MenuSection
            title="Operaciones"
            links={linksOperaciones}
            pathname={pathname}
            onClick={cerrarMenuMovil}
          />

          <MenuSection
            title="Configuración"
            links={linksConfiguracion}
            pathname={pathname}
            onClick={cerrarMenuMovil}
          />

          <MenuSection
            title="Análisis"
            links={linksReportes}
            pathname={pathname}
            onClick={cerrarMenuMovil}
          />

          <div className="border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={cerrarSesion}
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>

      <main className="min-h-screen md:ml-72">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {accesoDenegado ? (
            <section className="flex min-h-[70vh] items-center justify-center">
              <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                <div className="text-5xl">🚫</div>

                <h1 className="mt-4 text-2xl font-bold text-slate-950">
                  Acceso denegado
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Tu rol actual no tiene permisos para acceder a esta sección.
                </p>

                <Link
                  href={perfil ? rutaInicioPorRol(perfil.rol) : "/login"}
                  className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Volver
                </Link>
              </div>
            </section>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  )
}