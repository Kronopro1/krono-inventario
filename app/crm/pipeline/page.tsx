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
  BadgeDollarSign,
  FileText,
  MessageCircle,
} from "lucide-react"
import { supabase } from "@/src/lib/supabase"

type Rol = "admin" | "operador" | "consulta" | "vendedor"

type Perfil = {
  nombre: string
  email: string
  rol: Rol
  activo: boolean
}

type CrmContacto = {
  id: string
  codigo_contacto: string | null
  nombre: string
  apellido: string | null
  empresa_salon: string | null
  razon_social: string | null
  nombre_comercial: string | null
  tipo_documento: string | null
  numero_documento: string | null
  tipo_contacto: string
  estado_comercial: string
  asesor_asignado: string | null
  ultimo_contacto_por: string | null
  creado_por: string | null
  asesor_asignado_id: string | null
  asesor_asignado_nombre: string | null
  whatsapp: string | null
  whatsapp_usuario: string | null
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
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    cargarContactos()
  }, [])

  const cargarContactos = async () => {
    setLoading(true)
    setError("")

    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session

    if (!session?.user?.email) {
      setError("No se encontró una sesión activa.")
      setLoading(false)
      return
    }

    setUserId(session.user.id)

    const { data: perfilData, error: perfilError } = await supabase
      .from("perfiles")
      .select("nombre, email, rol, activo")
      .eq("email", session.user.email)
      .single()

    if (perfilError || !perfilData) {
      setError("No se pudo cargar el perfil del usuario.")
      setLoading(false)
      return
    }

    const perfilUsuario = perfilData as Perfil
    setPerfil(perfilUsuario)

    let query = supabase
      .from("crm_contactos")
      .select("*")
      .eq("activo", true)
      .order("created_at", { ascending: false })

    if (perfilUsuario.rol === "vendedor") {
      query = query.or(
        `creado_por.eq.${session.user.id},asesor_asignado_id.eq.${session.user.id}`
      )
    }

    const { data, error } = await query

    if (error) {
      setError(error.message)
    } else {
      setContactos((data || []) as CrmContacto[])
    }

    setLoading(false)
  }

  const cambiarEtapa = async (contacto: CrmContacto, nuevaEtapa: string) => {
    if (perfil?.rol === "vendedor" && userId) {
      const puedeGestionar =
        contacto.creado_por === userId || contacto.asesor_asignado_id === userId

      if (!puedeGestionar) {
        setError("No tienes permiso para modificar este contacto.")
        return
      }
    }

    const { error } = await supabase
      .from("crm_contactos")
      .update({
        estado_comercial: nuevaEtapa,
        ultima_interaccion: new Date().toISOString(),
        ultimo_contacto_por: perfil?.nombre || null,
      })
      .eq("id", contacto.id)

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from("crm_actividades").insert({
      contacto_id: contacto.id,
      tipo: "Cambio de etapa",
      titulo: `Contacto movido a ${nuevaEtapa}`,
      descripcion: "El contacto fue actualizado dentro del pipeline comercial.",
      creado_por: userId,
      asesor_nombre: perfil?.nombre || null,
    })

    await cargarContactos()
  }

  const valorTotalPipeline = contactos.reduce((total, contacto) => {
    return total + Number(contacto.valor_potencial || 0)
  }, 0)

  const esVendedor = perfil?.rol === "vendedor"

  const obtenerAsesorVisible = (contacto: CrmContacto) => {
    return (
      contacto.asesor_asignado_nombre ||
      contacto.asesor_asignado ||
      "Sin asignar"
    )
  }

  const obtenerNombreContacto = (contacto: CrmContacto) => {
    return `${contacto.nombre} ${contacto.apellido || ""}`.trim()
  }

  const obtenerEmpresaVisible = (contacto: CrmContacto) => {
    return (
      contacto.empresa_salon ||
      contacto.nombre_comercial ||
      contacto.razon_social ||
      "Sin empresa"
    )
  }

  const obtenerDocumentoVisible = (contacto: CrmContacto) => {
    if (contacto.tipo_documento && contacto.numero_documento) {
      return `${contacto.tipo_documento}: ${contacto.numero_documento}`
    }

    if (contacto.numero_documento) {
      return contacto.numero_documento
    }

    return "Sin documento"
  }

  const totalConDocumento = contactos.filter(
    (contacto) => !!contacto.numero_documento
  ).length

  const totalSinAccion = contactos.filter(
    (contacto) => !contacto.proxima_accion
  ).length

  return (
    <main className="min-h-screen bg-[#F7F6F2] p-6">
      <div className="mx-auto max-w-[1700px]">
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
              {esVendedor ? "Mi Pipeline Comercial" : "Pipeline Comercial"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              {esVendedor
                ? "Seguimiento visual de los prospectos y clientes asignados a tu gestión."
                : "Seguimiento visual de prospectos, salones, distribuidores y oportunidades comerciales."}
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

        {esVendedor && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            Estás viendo únicamente contactos creados por ti o asignados a tu
            usuario.
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">
              {esVendedor ? "Mis contactos en pipeline" : "Contactos en pipeline"}
            </p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : contactos.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">
              {esVendedor ? "Valor de mi pipeline" : "Valor total pipeline"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : `S/ ${valorTotalPipeline.toFixed(2)}`}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Con documento</p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : totalConDocumento}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Sin próxima acción</p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : totalSinAccion}
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
                  className="min-w-[330px] rounded-3xl border border-[#E5E2DA] bg-white p-4 shadow-sm"
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
                      contactosEtapa.map((contacto) => {
                        const asesorVisible = obtenerAsesorVisible(contacto)
                        const empresaVisible = obtenerEmpresaVisible(contacto)
                        const documentoVisible = obtenerDocumentoVisible(contacto)

                        return (
                          <div
                            key={contacto.id}
                            className="rounded-2xl border border-[#E5E2DA] bg-[#F7F6F2] p-4"
                          >
                            <div className="mb-3 flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#737563]">
                                <UserRound size={17} />
                              </div>

                              <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-[11px] font-semibold text-white">
                                    {contacto.codigo_contacto || "Sin código"}
                                  </span>

                                  {contacto.numero_documento && (
                                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#737563]">
                                      {documentoVisible}
                                    </span>
                                  )}
                                </div>

                                <Link
                                  href={`/crm/contactos/${contacto.id}`}
                                  className="block font-semibold text-[#1F1F1F] hover:text-[#737563]"
                                >
                                  {obtenerNombreContacto(contacto)}
                                </Link>

                                <p className="mt-1 text-xs text-[#737563]">
                                  {contacto.tipo_contacto}
                                </p>

                                <p className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                  {asesorVisible}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs text-[#4A4A4A]">
                              <div className="flex gap-2">
                                <Building2
                                  size={14}
                                  className="mt-0.5 shrink-0 text-[#737563]"
                                />
                                <span>{empresaVisible}</span>
                              </div>

                              {contacto.razon_social && (
                                <div className="flex gap-2">
                                  <FileText
                                    size={14}
                                    className="mt-0.5 shrink-0 text-[#737563]"
                                  />
                                  <span>{contacto.razon_social}</span>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <CalendarCheck
                                  size={14}
                                  className="mt-0.5 shrink-0 text-[#737563]"
                                />
                                <span>
                                  {contacto.proxima_accion || "Sin acción"}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <MessageCircle
                                  size={14}
                                  className="mt-0.5 shrink-0 text-[#737563]"
                                />
                                <span>
                                  {contacto.whatsapp ||
                                    contacto.whatsapp_usuario ||
                                    "Sin WhatsApp"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#737563]">
                                <BadgeDollarSign size={14} />
                                Valor
                              </span>

                              <span className="text-sm font-semibold text-[#1F1F1F]">
                                S/{" "}
                                {Number(contacto.valor_potencial || 0).toFixed(
                                  2
                                )}
                              </span>
                            </div>

                            <select
                              value={contacto.estado_comercial}
                              onChange={(e) =>
                                cambiarEtapa(contacto, e.target.value)
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
                        )
                      })
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