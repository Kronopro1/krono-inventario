"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  RotateCcw,
  UserRound,
  KanbanSquare,
  ListChecks,
  Plus,
} from "lucide-react"
import { supabase } from "@/src/lib/supabase"

type CrmContacto = {
  id: string
  nombre: string
  apellido: string | null
  empresa_salon: string | null
  tipo_contacto: string
  estado_comercial: string
  whatsapp: string | null
  email: string | null
  ciudad: string | null
  fuente_contacto: string | null
  valor_potencial: number | string | null
  proxima_accion: string | null
  activo: boolean
}

export default function ContactosDesactivadosPage() {
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reactivandoId, setReactivandoId] = useState<string | null>(null)

  useEffect(() => {
    cargarContactos()
  }, [])

  const cargarContactos = async () => {
    setLoading(true)
    setError("")

    const { data, error } = await supabase
      .from("crm_contactos")
      .select("*")
      .eq("activo", false)
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setContactos((data || []) as CrmContacto[])
    }

    setLoading(false)
  }

  const reactivarContacto = async (contactoId: string) => {
    const confirmar = window.confirm(
      "¿Deseas reactivar este contacto? Volverá a aparecer en el CRM, contactos y pipeline."
    )

    if (!confirmar) return

    setReactivandoId(contactoId)
    setError("")

    const { error } = await supabase
      .from("crm_contactos")
      .update({
        activo: true,
        ultima_interaccion: new Date().toISOString(),
      })
      .eq("id", contactoId)

    if (error) {
      setError(error.message)
      setReactivandoId(null)
      return
    }

    await supabase.from("crm_actividades").insert({
      contacto_id: contactoId,
      tipo: "Reactivación",
      titulo: "Contacto reactivado",
      descripcion: "El contacto fue reactivado y volvió al CRM.",
    })

    await cargarContactos()
    setReactivandoId(null)
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/crm/contactos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#737563] hover:text-[#1F1F1F]"
          >
            <ArrowLeft size={16} />
            Volver a contactos
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737563]">
              CRM / CONTACTOS DESACTIVADOS
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              Contactos Desactivados
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              Contactos ocultos del CRM. Puedes revisarlos y reactivarlos sin
              perder historial, notas ni tareas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/crm/tareas"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              <ListChecks size={18} />
              Ver tareas
            </Link>

            <Link
              href="/crm/pipeline"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              <KanbanSquare size={18} />
              Ver pipeline
            </Link>

            <Link
              href="/crm/contactos/nuevo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#737563] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F]"
            >
              <Plus size={18} />
              Nuevo contacto
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Contactos desactivados</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : contactos.length}
            </h2>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#1F1F1F]">
              Lista de desactivados
            </h2>

            <p className="mt-1 text-sm text-[#737563]">
              Puedes reactivar un contacto para que vuelva a aparecer en el CRM.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2DA] text-left text-xs uppercase tracking-[0.12em] text-[#737563]">
                  <th className="py-3 pr-4 font-semibold">Contacto</th>
                  <th className="py-3 pr-4 font-semibold">Empresa / Salón</th>
                  <th className="py-3 pr-4 font-semibold">Tipo</th>
                  <th className="py-3 pr-4 font-semibold">Estado</th>
                  <th className="py-3 pr-4 font-semibold">Ciudad</th>
                  <th className="py-3 pr-4 font-semibold">WhatsApp</th>
                  <th className="py-3 pr-4 font-semibold">Valor</th>
                  <th className="py-3 pr-4 font-semibold">Acción</th>
                </tr>
              </thead>

              <tbody>
                {contactos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm text-[#737563]"
                    >
                      {loading
                        ? "Cargando contactos desactivados..."
                        : "No hay contactos desactivados."}
                    </td>
                  </tr>
                ) : (
                  contactos.map((contacto) => (
                    <tr
                      key={contacto.id}
                      className="border-b border-[#F0EDE7] text-sm text-[#4A4A4A]"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
                            <UserRound size={18} />
                          </div>

                          <div>
                            <div className="font-semibold text-[#1F1F1F]">
                              {contacto.nombre} {contacto.apellido || ""}
                            </div>

                            <div className="text-xs text-[#737563]">
                              {contacto.email || "Sin email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        {contacto.empresa_salon || "Sin empresa"}
                      </td>

                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-[#F7F6F2] px-3 py-1 text-xs font-semibold text-[#737563]">
                          {contacto.tipo_contacto}
                        </span>
                      </td>

                      <td className="py-4 pr-4">
                        {contacto.estado_comercial}
                      </td>

                      <td className="py-4 pr-4">
                        {contacto.ciudad || "-"}
                      </td>

                      <td className="py-4 pr-4">
                        {contacto.whatsapp || "-"}
                      </td>

                      <td className="py-4 pr-4 font-semibold text-[#1F1F1F]">
                        S/ {Number(contacto.valor_potencial || 0).toFixed(2)}
                      </td>

                      <td className="py-4 pr-4">
                        <button
                          onClick={() => reactivarContacto(contacto.id)}
                          disabled={reactivandoId === contacto.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#737563] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RotateCcw size={15} />
                          {reactivandoId === contacto.id
                            ? "Reactivando..."
                            : "Reactivar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}