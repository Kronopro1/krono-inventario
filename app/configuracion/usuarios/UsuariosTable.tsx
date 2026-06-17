"use client"

import { useState } from "react"
import { supabase } from "@/src/lib/supabase"

type Usuario = {
  nombre: string
  email: string
  rol: string
  activo: boolean
}

export default function UsuariosTable({
  usuarios,
}: {
  usuarios: Usuario[]
}) {
  const [items, setItems] = useState<Usuario[]>(usuarios)
  const [editando, setEditando] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(false)

  const actualizarCampo = (
    email: string,
    campo: "nombre" | "rol" | "activo",
    valor: string | boolean
  ) => {
    setItems((actuales) =>
      actuales.map((item) =>
        item.email === email
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    )
  }

  const guardarUsuario = async (usuario: Usuario) => {
    setMensaje("")
    setLoading(true)

    try {
      const { error } = await supabase.rpc("actualizar_usuario_admin", {
        p_email: usuario.email,
        p_nombre: usuario.nombre,
        p_rol: usuario.rol,
        p_activo: usuario.activo,
      })

      if (error) throw error

      setMensaje("✅ Usuario actualizado correctamente.")
      setEditando(null)
    } catch (error: any) {
      setMensaje(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {mensaje && (
        <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-sm font-medium text-slate-700">
          {mensaje}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>

          <tbody>
            {items.map((usuario) => {
              const estaEditando = editando === usuario.email

              return (
                <tr key={usuario.email} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">
                    {estaEditando ? (
                      <input
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                        value={usuario.nombre}
                        onChange={(e) =>
                          actualizarCampo(
                            usuario.email,
                            "nombre",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      usuario.nombre
                    )}
                  </td>

                  <td className="px-4 py-3">{usuario.email}</td>

                  <td className="px-4 py-3">
                    {estaEditando ? (
                      <select
                        className="rounded-xl border border-slate-300 px-3 py-2"
                        value={usuario.rol}
                        onChange={(e) =>
                          actualizarCampo(usuario.email, "rol", e.target.value)
                        }
                      >
                        <option value="admin">admin</option>
                        <option value="operador">operador</option>
                        <option value="consulta">consulta</option>
                        <option value="vendedor">vendedor</option>
                      </select>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                        {usuario.rol}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {estaEditando ? (
                      <select
                        className="rounded-xl border border-slate-300 px-3 py-2"
                        value={usuario.activo ? "true" : "false"}
                        onChange={(e) =>
                          actualizarCampo(
                            usuario.email,
                            "activo",
                            e.target.value === "true"
                          )
                        }
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    ) : (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          usuario.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {estaEditando ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => guardarUsuario(usuario)}
                          className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          Guardar
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditando(null)}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditando(usuario.email)}
                        className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}