"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserRound,
  Users,
  KanbanSquare,
  Plus,
  Search,
  X,
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

type CrmTarea = {
  id: string
  contacto_id: string
  tipo: string
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string | null
  fecha_tarea: string | null
  hora_tarea: string | null
  created_at: string
  creado_por: string | null
  asesor_asignado_id: string | null
  asesor_asignado_nombre: string | null
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
  whatsapp: string | null
  whatsapp_usuario: string | null
  email: string | null
  creado_por: string | null
  asesor_asignado_id: string | null
  asesor_asignado_nombre: string | null
}

function limpiarWhatsapp(numero: string | null) {
  if (!numero) return ""
  return numero.replace(/\D/g, "")
}

function limpiarUsuarioWhatsapp(usuario: string | null) {
  if (!usuario) return ""

  const limpio = usuario.trim()
  if (!limpio) return ""

  return limpio.startsWith("@") ? limpio : `@${limpio}`
}

function obtenerNombreCompleto(contacto: CrmContacto) {
  return `${contacto.nombre} ${contacto.apellido || ""}`.trim()
}

function obtenerEmpresaVisible(contacto: CrmContacto) {
  return (
    contacto.empresa_salon ||
    contacto.nombre_comercial ||
    contacto.razon_social ||
    "Sin empresa"
  )
}

function obtenerDocumentoVisible(contacto: CrmContacto) {
  if (contacto.tipo_documento && contacto.numero_documento) {
    return `${contacto.tipo_documento}: ${contacto.numero_documento}`
  }

  if (contacto.numero_documento) {
    return contacto.numero_documento
  }

  return "Sin documento"
}

export default function TareasPage() {
  const [tareas, setTareas] = useState<CrmTarea[]>([])
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
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

    let contactosQuery = supabase
      .from("crm_contactos")
      .select(
        "id, codigo_contacto, nombre, apellido, empresa_salon, razon_social, nombre_comercial, tipo_documento, numero_documento, whatsapp, whatsapp_usuario, email, creado_por, asesor_asignado_id, asesor_asignado_nombre"
      )
      .eq("activo", true)

    if (perfilUsuario.rol === "vendedor") {
      contactosQuery = contactosQuery.or(
        `creado_por.eq.${session.user.id},asesor_asignado_id.eq.${session.user.id}`
      )
    }

    const { data: contactosData, error: contactosError } = await contactosQuery

    if (contactosError) {
      setError(contactosError.message)
      setLoading(false)
      return
    }

    const contactosPermitidos = (contactosData || []) as CrmContacto[]
    const contactosIdsPermitidos = contactosPermitidos.map(
      (contacto) => contacto.id
    )

    let tareasQuery = supabase
      .from("crm_tareas")
      .select("*")
      .order("fecha_tarea", { ascending: true })

    if (perfilUsuario.rol === "vendedor") {
      if (contactosIdsPermitidos.length === 0) {
        setContactos(contactosPermitidos)
        setTareas([])
        setLoading(false)
        return
      }

      tareasQuery = tareasQuery.in("contacto_id", contactosIdsPermitidos)
    }

    const { data: tareasData, error: tareasError } = await tareasQuery

    if (tareasError) {
      setError(tareasError.message)
      setLoading(false)
      return
    }

    setTareas((tareasData || []) as CrmTarea[])
    setContactos(contactosPermitidos)
    setLoading(false)
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const esVendedor = perfil?.rol === "vendedor"

  const contactoPorId = (contactoId: string) => {
    return contactos.find((contacto) => contacto.id === contactoId)
  }

  const puedeGestionarTarea = (tarea: CrmTarea) => {
    if (!esVendedor) return true
    if (!userId) return false

    const contacto = contactoPorId(tarea.contacto_id)

    if (!contacto) return false

    return contacto.creado_por === userId || contacto.asesor_asignado_id === userId
  }

  const tareasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return tareas

    return tareas.filter((tarea) => {
      const contacto = contactoPorId(tarea.contacto_id)

      const empresaVisible = contacto ? obtenerEmpresaVisible(contacto) : ""
      const documentoVisible = contacto ? obtenerDocumentoVisible(contacto) : ""
      const usuarioWhatsapp = contacto
        ? limpiarUsuarioWhatsapp(contacto.whatsapp_usuario)
        : ""

      return (
        tarea.tipo?.toLowerCase().includes(texto) ||
        tarea.titulo?.toLowerCase().includes(texto) ||
        tarea.descripcion?.toLowerCase().includes(texto) ||
        tarea.estado?.toLowerCase().includes(texto) ||
        tarea.prioridad?.toLowerCase().includes(texto) ||
        tarea.asesor_asignado_nombre?.toLowerCase().includes(texto) ||
        contacto?.codigo_contacto?.toLowerCase().includes(texto) ||
        contacto?.nombre?.toLowerCase().includes(texto) ||
        contacto?.apellido?.toLowerCase().includes(texto) ||
        contacto?.empresa_salon?.toLowerCase().includes(texto) ||
        contacto?.nombre_comercial?.toLowerCase().includes(texto) ||
        contacto?.razon_social?.toLowerCase().includes(texto) ||
        contacto?.tipo_documento?.toLowerCase().includes(texto) ||
        contacto?.numero_documento?.toLowerCase().includes(texto) ||
        documentoVisible.toLowerCase().includes(texto) ||
        empresaVisible.toLowerCase().includes(texto) ||
        contacto?.whatsapp?.toLowerCase().includes(texto) ||
        usuarioWhatsapp.toLowerCase().includes(texto) ||
        contacto?.email?.toLowerCase().includes(texto)
      )
    })
  }, [tareas, contactos, busqueda])

  const tareasPendientes = tareasFiltradas.filter(
    (tarea) => tarea.estado !== "Completado"
  )

  const tareasVencidas = tareasPendientes.filter(
    (tarea) => tarea.fecha_tarea && tarea.fecha_tarea < hoy
  )

  const tareasHoy = tareasPendientes.filter(
    (tarea) => tarea.fecha_tarea === hoy
  )

  const tareasProximas = tareasPendientes.filter(
    (tarea) => tarea.fecha_tarea && tarea.fecha_tarea > hoy
  )

  const tareasSinFecha = tareasPendientes.filter(
    (tarea) => !tarea.fecha_tarea
  )

  const tareasCompletadas = tareasFiltradas.filter(
    (tarea) => tarea.estado === "Completado"
  )

  const completarTarea = async (tarea: CrmTarea) => {
    if (!puedeGestionarTarea(tarea)) {
      setError("No tienes permiso para completar esta tarea.")
      return
    }

    const { error } = await supabase
      .from("crm_tareas")
      .update({
        estado: "Completado",
        completada_en: new Date().toISOString(),
      })
      .eq("id", tarea.id)

    if (error) {
      setError(error.message)
      return
    }

    await cargarDatos()
  }

  const renderTarea = (tarea: CrmTarea) => {
    const contacto = contactoPorId(tarea.contacto_id)
    const whatsapp = contacto ? limpiarWhatsapp(contacto.whatsapp) : ""
    const usuarioWhatsapp = contacto
      ? limpiarUsuarioWhatsapp(contacto.whatsapp_usuario)
      : ""

    return (
      <div
        key={tarea.id}
        className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#737563]">
              {tarea.tipo}
            </p>

            <h3 className="mt-1 text-base font-semibold text-[#1F1F1F]">
              {tarea.titulo}
            </h3>

            {tarea.descripcion && (
              <p className="mt-2 text-sm text-[#4A4A4A]">
                {tarea.descripcion}
              </p>
            )}
          </div>

          <span className="rounded-full bg-[#F7F6F2] px-3 py-1 text-xs font-semibold text-[#737563]">
            {tarea.estado}
          </span>
        </div>

        <div className="space-y-3 text-sm text-[#4A4A4A]">
          {contacto ? (
            <div className="rounded-xl bg-[#F7F6F2] p-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-[11px] font-semibold text-white">
                  {contacto.codigo_contacto || "Sin código"}
                </span>

                {contacto.numero_documento && (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#737563]">
                    {obtenerDocumentoVisible(contacto)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <UserRound size={16} className="text-[#737563]" />

                <Link
                  href={`/crm/contactos/${contacto.id}`}
                  className="font-semibold text-[#1F1F1F] hover:text-[#737563]"
                >
                  {obtenerNombreCompleto(contacto)}
                </Link>
              </div>

              <p className="mt-2 text-sm text-[#737563]">
                {obtenerEmpresaVisible(contacto)}
              </p>

              {contacto.razon_social && (
                <p className="mt-1 text-xs text-[#737563]">
                  Razón social: {contacto.razon_social}
                </p>
              )}

              <p className="mt-1 text-xs text-[#737563]">
                Contacto:{" "}
                <span className="font-semibold">
                  {contacto.whatsapp || usuarioWhatsapp || "Sin WhatsApp"}
                </span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UserRound size={16} className="text-[#737563]" />
              <span>Contacto no encontrado</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-[#737563]" />
            <span>
              {tarea.fecha_tarea || "Sin fecha"}
              {tarea.hora_tarea ? ` · ${tarea.hora_tarea}` : ""}
            </span>
          </div>

          <p className="text-sm text-[#737563]">
            Asesor:{" "}
            <span className="font-semibold text-blue-700">
              {tarea.asesor_asignado_nombre ||
                contacto?.asesor_asignado_nombre ||
                "Sin asignar"}
            </span>
          </p>

          {tarea.prioridad && (
            <p className="text-sm text-[#737563]">
              Prioridad:{" "}
              <span className="font-semibold text-[#1F1F1F]">
                {tarea.prioridad}
              </span>
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tarea.estado !== "Completado" && (
            <button
              onClick={() => completarTarea(tarea)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#737563] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1F1F1F]"
            >
              <CheckCircle2 size={16} />
              Marcar completada
            </button>
          )}

          {contacto && (
            <Link
              href={`/crm/contactos/${contacto.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-4 py-2 text-xs font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              <FileText size={16} />
              Ver ficha
            </Link>
          )}

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }

  const renderGrupo = (
    titulo: string,
    descripcion: string,
    lista: CrmTarea[],
    icono: ReactNode
  ) => {
    return (
      <section className="rounded-3xl border border-[#E5E2DA] bg-[#F7F6F2] p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#737563]">
              {icono}
            </div>

            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              {titulo}
            </h2>

            <p className="mt-1 text-sm text-[#737563]">
              {descripcion}
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#737563]">
            {lista.length}
          </span>
        </div>

        <div className="space-y-4">
          {lista.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E5E2DA] bg-white p-5 text-center text-sm text-[#737563]">
              No hay tareas en esta sección.
            </div>
          ) : (
            lista.map((tarea) => renderTarea(tarea))
          )}
        </div>
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] p-6">
      <div className="mx-auto max-w-7xl">
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
              CRM / TAREAS
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {esVendedor ? "Mis Tareas Comerciales" : "Tareas Comerciales"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              {esVendedor
                ? "Seguimiento centralizado de llamadas, WhatsApp, reuniones, demos, capacitaciones y recompra de tus contactos asignados."
                : "Seguimiento centralizado para llamadas, WhatsApp, reuniones, demos, capacitaciones y recompra."}
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

        {esVendedor && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            Estás viendo únicamente tareas de contactos creados por ti o
            asignados a tu usuario.
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737563]">
                Buscar tarea
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737563]"
                />

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Código, RUC/DNI, razón social, nombre comercial, tarea, asesor, WhatsApp..."
                  className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] py-3 pl-11 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#737563] focus:border-[#737563] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBusqueda("")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              <X size={16} />
              Limpiar
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-[#F7F6F2] px-4 py-3 text-sm text-[#737563]">
            Mostrando{" "}
            <span className="font-semibold text-[#1F1F1F]">
              {tareasFiltradas.length}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-[#1F1F1F]">
              {tareas.length}
            </span>{" "}
            tareas.
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Vencidas</p>
            <h2 className="mt-2 text-3xl font-semibold text-red-600">
              {loading ? "..." : tareasVencidas.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Hoy</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : tareasHoy.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Próximas</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : tareasProximas.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Sin fecha</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : tareasSinFecha.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Completadas</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : tareasCompletadas.length}
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
            Cargando tareas...
          </div>
        ) : (
          <div className="grid gap-6">
            {renderGrupo(
              "Vencidas",
              "Tareas pendientes con fecha anterior a hoy.",
              tareasVencidas,
              <Clock size={20} />
            )}

            {renderGrupo(
              "Hoy",
              "Acciones comerciales que debes realizar hoy.",
              tareasHoy,
              <CalendarCheck size={20} />
            )}

            {renderGrupo(
              "Próximas",
              "Seguimientos programados para próximos días.",
              tareasProximas,
              <CalendarCheck size={20} />
            )}

            {renderGrupo(
              "Sin fecha",
              "Tareas pendientes que aún no tienen fecha asignada.",
              tareasSinFecha,
              <Clock size={20} />
            )}

            {renderGrupo(
              "Completadas",
              "Tareas que ya fueron cerradas.",
              tareasCompletadas.slice(0, 10),
              <CheckCircle2 size={20} />
            )}
          </div>
        )}
      </div>
    </main>
  )
}