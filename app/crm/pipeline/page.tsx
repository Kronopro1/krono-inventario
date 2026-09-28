"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  UserRound,
  Users,
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
  valor_potencial: number | string | null
  proxima_accion: string | null
  created_at: string
}

const etapas = [
  "Nuevo Lead",
  "Primer Contacto",
  "Respondió",
  "Lead Calificado",
  "Presentación de Marca",
  "Interesado",
  "Kit / Muestra Ofrecida",
  "Kit / Muestra Enviada",
  "Seguimiento de Prueba",
  "Cotización Enviada",
  "Negociación",
  "Primera Compra",
  "Cliente Activo",
  "Recompra",
  "Salón Embajador",
  "Distribuidor Potencial",
  "No Interesado",
  "Perdido",
]

export default function PipelinePage() {
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    cargarContactos()
  }, [])

  const cargarContactos = async () => {
    setLoading(true)
    setError("")

    const { data, error } = await supabase
      .from("crm_contactos")
      .select("*")
      .eq("activo", true)
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setContactos((data || []) as CrmContacto[])
    }

    setLoading(false)
  }

  const cambiarEtapa = async (contactoId: string, nuevaEtapa: string) => {
    const { error } = await supabase
      .from("crm_contactos")
      .update({
        estado_comercial: nuevaEtapa,
        ultima_interaccion: new Date().toISOString(),
      })
      .eq("id", contactoId)

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from("crm_actividades").insert({
      contacto_id: contactoId,
      tipo: "Cambio de etapa",
      titulo: `Contacto movido a ${nuevaEtapa}`,
      descripcion: "El contacto fue actualizado dentro del pipeline comercial.",
    })

    await cargarContactos()
  }

  const valorTotalPipeline = contactos.reduce((total, contacto) => {
    return total + Number(contacto.valor_potencial || 0)
  }, 0)

  return (
    <main className="min-h-screen bg-[#F7F6F2] p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6">
          <Link
            href="/crm"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#737563] hover:text-[#1F1F1F]"
          >
            <ArrowLeft size={16} />
            Volver al CRM
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737563]">
              CRM / PIPELINE
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              Pipeline Comercial
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              Seguimiento visual de prospectos, salones, distribuidores y
              oportunidades comerciales.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/crm/contactos"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              <Users size={18} />
              Ver contactos
            </Link>

            <Link
              href="/crm/tareas"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              <ListChecks size={18} />
              Ver tareas
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

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Contactos en pipeline</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : contactos.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Valor total pipeline</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : `S/ ${valorTotalPipeline.toFixed(2)}`}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Etapas comerciales</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {etapas.length}
            </h2>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-6 text-sm text-[#737563]">
            Cargando pipeline...
          </div>
        ) : (
          <section className="flex gap-4 overflow-x-auto pb-4">
            {etapas.map((etapa) => {
              const contactosEtapa = contactos.filter(
                (contacto) => contacto.estado_comercial === etapa
              )

              const valorEtapa = contactosEtapa.reduce((total, contacto) => {
                return total + Number(contacto.valor_potencial || 0)
              }, 0)

              return (
                <div
                  key={etapa}
                  className="min-w-[290px] rounded-3xl border border-[#E5E2DA] bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 border-b border-[#E5E2DA] pb-4">
                    <h2 className="text-sm font-semibold text-[#1F1F1F]">
                      {etapa}
                    </h2>

                    <div className="mt-2 flex items-center justify-between text-xs text-[#737563]">
                      <span>{contactosEtapa.length} contactos</span>
                      <span>S/ {valorEtapa.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contactosEtapa.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#E5E2DA] bg-[#F7F6F2] p-4 text-center text-xs text-[#737563]">
                        Sin contactos
                      </div>
                    ) : (
                      contactosEtapa.map((contacto) => (
                        <div
                          key={contacto.id}
                          className="rounded-2xl border border-[#E5E2DA] bg-[#F7F6F2] p-4"
                        >
                          <div className="mb-3 flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#737563]">
                              <UserRound size={17} />
                            </div>

                            <div>
                              <Link
                                href={`/crm/contactos/${contacto.id}`}
                                className="font-semibold text-[#1F1F1F] hover:text-[#737563]"
                              >
                                {contacto.nombre} {contacto.apellido || ""}
                              </Link>

                              <p className="mt-1 text-xs text-[#737563]">
                                {contacto.tipo_contacto}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs text-[#4A4A4A]">
                            <div className="flex gap-2">
                              <Building2 size={14} className="text-[#737563]" />
                              <span>
                                {contacto.empresa_salon || "Sin empresa"}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <CalendarCheck
                                size={14}
                                className="text-[#737563]"
                              />
                              <span>
                                {contacto.proxima_accion || "Sin acción"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#1F1F1F]">
                              S/{" "}
                              {Number(contacto.valor_potencial || 0).toFixed(2)}
                            </span>
                          </div>

                          <select
                            value={contacto.estado_comercial}
                            onChange={(e) =>
                              cambiarEtapa(contacto.id, e.target.value)
                            }
                            className="mt-4 w-full rounded-xl border border-[#E5E2DA] bg-white px-3 py-2 text-xs text-[#4A4A4A] outline-none focus:border-[#737563]"
                          >
                            {etapas.map((opcion) => (
                              <option key={opcion} value={opcion}>
                                {opcion}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}