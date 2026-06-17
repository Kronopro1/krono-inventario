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

function rutaPermitida(pathname: string, rol: Rol) {
  if (pathname === "/" || pathname === "/login") return true
  if (rol === "admin") return true

  if (rol === "operador") {
    return (
      pathname.startsWith("/inventario") ||
      pathname.startsWith("/ingresos") ||
      pathname.startsWith("/traslados") ||
      pathname.startsWith("/ventas") ||
      pathname.startsWith("/movimientos") ||
      pathname.startsWith("/reportes")
    )
  }

  if (rol === "consulta") {
    return pathname.startsWith("/inventario") || pathname.startsWith("/reportes")
  }

  if (rol === "vendedor") {
    return pathname.startsWith("/inventario") || pathname.startsWith("/ventas")
  }

  return false
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [checking, setChecking] = useState(true)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [accesoDenegado, setAccesoDenegado] = useState(false)

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

  const puedeVerInventario =
    rol === "admin" ||
    rol === "operador" ||
    rol === "consulta" ||
    rol === "vendedor"

  const puedeOperarInventario = rol === "admin" || rol === "operador"
  const puedeVender = rol === "admin" || rol === "operador" || rol === "vendedor"
  const puedeVerMovimientos = rol === "admin" || rol === "operador"
  const puedeVerConfiguracion = rol === "admin"
  const puedeVerReportes = rol === "admin" || rol === "operador" || rol === "consulta"

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-screen w-72 overflow-y-auto border-r border-slate-800 bg-slate-950 px-5 py-6 text-white">
        <div className="mb-8">
          <div className="text-2xl font-bold tracking-tight">Krono</div>
          <div className="text-sm text-slate-400">Inventory System</div>
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
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              General
            </p>

            <Link
              className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
              href="/"
            >
              Dashboard
            </Link>
          </div>

          {puedeVerInventario && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Inventario
              </p>

              <Link
                className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                href="/inventario"
              >
                Inventario
              </Link>

              {puedeOperarInventario && (
                <>
                  <Link
                    className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                    href="/ingresos"
                  >
                    Ingresos
                  </Link>

                  <Link
                    className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                    href="/traslados"
                  >
                    Traslados
                  </Link>
                </>
              )}
            </div>
          )}

          {(puedeVender || puedeVerMovimientos) && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Operaciones
              </p>

              {puedeVender && (
                <Link
                  className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                  href="/ventas"
                >
                  Ventas Marketplace
                </Link>
              )}

              {puedeVerMovimientos && (
                <Link
                  className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                  href="/movimientos"
                >
                  Movimientos
                </Link>
              )}
            </div>
          )}

          {puedeVerConfiguracion && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Configuración
              </p>

              <Link
                className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                href="/configuracion/usuarios"
              >
                Usuarios
              </Link>

              <Link
                className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                href="/configuracion/productos"
              >
                Productos
              </Link>

              <Link
                className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                href="/configuracion/combos"
              >
                Combos
              </Link>

              <Link
                className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                href="/configuracion/nuevo-producto"
              >
                Nuevo Producto
              </Link>

              <Link
                className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                href="/configuracion/nuevo-combo"
              >
                Nuevo Combo
              </Link>
            </div>
          )}

          {puedeVerReportes && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Análisis
              </p>

              <Link
                className="block rounded-xl px-3 py-2 text-slate-200 hover:bg-slate-800"
                href="/reportes"
              >
                Reportes
              </Link>
            </div>
          )}

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

      <main className="ml-72 min-h-screen flex-1">
        <div className="mx-auto max-w-7xl px-8 py-8">
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
                  href="/"
                  className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Volver al Dashboard
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