"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/lib/supabase"

export default function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(false)

  const iniciarSesion = async () => {
    setMensaje("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/")
      router.refresh()
    } catch (error: any) {
      setMensaje(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">
          Correo
        </label>

        <input
          type="email"
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@empresa.com"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Contraseña
        </label>

        <div className="relative mt-2">
          <input
            type={mostrarPassword ? "text" : "password"}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-16 text-sm outline-none focus:border-slate-950"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />

          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            {mostrarPassword ? "Ocultar" : "Ver"}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={iniciarSesion}
        disabled={loading}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {mensaje && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
          {mensaje}
        </div>
      )}
    </div>
  )
}