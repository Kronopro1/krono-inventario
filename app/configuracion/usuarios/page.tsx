import { supabase } from "@/src/lib/supabase"
import UsuariosTable from "./UsuariosTable"

export const dynamic = "force-dynamic"

type Usuario = {
  nombre: string
  email: string
  rol: string
  activo: boolean
}

export default async function UsuariosPage() {
  const { data, error } = await supabase.rpc("obtener_usuarios_admin")

  const usuarios = ((data ?? []) as Usuario[]).filter(Boolean)

  if (error) {
    return (
      <main>
        <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">
            Error cargando usuarios
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error.message}</p>
        </section>
      </main>
    )
  }

  return (
    <main>
      <section className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Configuración
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Usuarios
        </h1>

        <p className="mt-2 text-slate-500">
          Administración de accesos, roles y estado de usuarios.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Usuarios</p>
          <h2 className="mt-3 text-3xl font-bold">{usuarios.length}</h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Activos</p>
          <h2 className="mt-3 text-3xl font-bold text-green-700">
            {usuarios.filter((u) => u.activo).length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Inactivos</p>
          <h2 className="mt-3 text-3xl font-bold text-red-700">
            {usuarios.filter((u) => !u.activo).length}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Roles</p>
          <h2 className="mt-3 text-3xl font-bold">
            {new Set(usuarios.map((u) => u.rol)).size}
          </h2>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold">Usuarios registrados</h2>
          <p className="text-sm text-slate-500">
            Edita nombre, rol y estado del usuario.
          </p>
        </div>

        <UsuariosTable usuarios={usuarios} />
      </section>
    </main>
  )
}