import { supabase } from "@/src/lib/supabase"

export const dynamic = "force-dynamic"

type Usuario = {
  nombre: string
  email: string
  rol: string
  activo: boolean
}

export default async function UsuariosPage() {
  const { data } = await supabase
    .from("perfiles")
    .select("nombre, email, rol, activo")
    .order("nombre")

  const usuarios = (data ?? []) as Usuario[]

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
          Administración de accesos y roles.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold">
            Usuarios registrados
          </h2>

          <p className="text-sm text-slate-500">
            Gestión de perfiles del sistema.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.email}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3 font-semibold">
                    {usuario.nombre}
                  </td>

                  <td className="px-4 py-3">
                    {usuario.email}
                  </td>

                  <td className="px-4 py-3">
                    {usuario.rol}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        usuario.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}