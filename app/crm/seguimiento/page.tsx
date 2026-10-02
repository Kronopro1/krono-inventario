"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MessageCircle,
  UserRound,
  Clock,
  AlertTriangle,
  Flame,
  Snowflake,
  Plus,
  Search,
  X,
  FileText,
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
  fecha_proxima_accion: string | null
  ultima_interaccion: string | null
  created_at: string
}

type CrmTarea = {
  id: string
  contacto_id: string | null
  titulo: string
  estado: string
  fecha_tarea: string | null
  hora_tarea: string | null
  prioridad: string | null
  creado_por: string | null
  asesor_asignado_id: string | null
  asesor_asignado_nombre: string | null
}

function fechaLocalISO() {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, "0")
  const day = String(hoy.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function diasDesde(fecha: string | null) {
  if (!fecha) return null

  const hoy = new Date()
  const fechaBase = new Date(fecha)
  const diferencia = hoy.getTime() - fechaBase.getTime()

  return Math.floor(diferencia / (1000 * 60 * 60 * 24))
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

function obtenerAsesorVisible(contacto: CrmContacto) {
  return (
    contacto.asesor_asignado_nombre ||
    contacto.asesor_asignado ||
    "Sin asignar"
  )
}

export default function SeguimientoCRMPage() {
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [tareas, setTareas] = useState<CrmTarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true)
      setError("")

      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session

      if (!session?.user?.email) {
        setError("No se encontró una sesión activa.")
        setLoading(false)
        return
      }

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
        .select("*")
        .eq("activo", true)
        .order("created_at", { ascending: false })

      if (perfilUsuario.rol === "vendedor") {
        contactosQuery = contactosQuery.or(
          `creado_por.eq.${session.user.id},asesor_asignado_id.eq.${session.user.id}`
        )
      }

      const { data: contactosData, error: contactosError } =
        await contactosQuery

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
        .neq("estado", "Completado")

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

      setContactos(contactosPermitidos)
      setTareas((tareasData || []) as CrmTarea[])
      setLoading(false)
    }

    cargarDatos()
  }, [])

  const esVendedor = perfil?.rol === "vendedor"
  const hoy = fechaLocalISO()

  const contactosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return contactos

    return contactos.filter((contacto) => {
      const empresaVisible = obtenerEmpresaVisible(contacto)
      const documentoVisible = obtenerDocumentoVisible(contacto)
      const asesorVisible = obtenerAsesorVisible(contacto)
      const usuarioWhatsapp = limpiarUsuarioWhatsapp(contacto.whatsapp_usuario)

      return (
        contacto.codigo_contacto?.toLowerCase().includes(texto) ||
        contacto.nombre?.toLowerCase().includes(texto) ||
        contacto.apellido?.toLowerCase().includes(texto) ||
        contacto.empresa_salon?.toLowerCase().includes(texto) ||
        contacto.nombre_comercial?.toLowerCase().includes(texto) ||
        contacto.razon_social?.toLowerCase().includes(texto) ||
        contacto.tipo_documento?.toLowerCase().includes(texto) ||
        contacto.numero_documento?.toLowerCase().includes(texto) ||
        documentoVisible.toLowerCase().includes(texto) ||
        empresaVisible.toLowerCase().includes(texto) ||
        contacto.tipo_contacto?.toLowerCase().includes(texto) ||
        contacto.estado_comercial?.toLowerCase().includes(texto) ||
        contacto.whatsapp?.toLowerCase().includes(texto) ||
        usuarioWhatsapp.toLowerCase().includes(texto) ||
        contacto.email?.toLowerCase().includes(texto) ||
        contacto.ciudad?.toLowerCase().includes(texto) ||
        asesorVisible.toLowerCase().includes(texto)
      )
    })
  }, [contactos, busqueda])

  const tareasPermitidasFiltradas = useMemo(() => {
    const idsContactosFiltrados = new Set(
      contactosFiltrados.map((contacto) => contacto.id)
    )

    return tareas.filter((tarea) => {
      if (!tarea.contacto_id) return true
      return idsContactosFiltrados.has(tarea.contacto_id)
    })
  }, [tareas, contactosFiltrados])

  const tareasVencidas = useMemo(() => {
    return tareasPermitidasFiltradas.filter(
      (tarea) => tarea.fecha_tarea && tarea.fecha_tarea < hoy
    )
  }, [tareasPermitidasFiltradas, hoy])

  const tareasHoy = useMemo(() => {
    return tareasPermitidasFiltradas.filter((tarea) => tarea.fecha_tarea === hoy)
  }, [tareasPermitidasFiltradas, hoy])

  const contactosSinSeguimiento = useMemo(() => {
    return contactosFiltrados.filter((contacto) => {
      const diasUltimaInteraccion = diasDesde(contacto.ultima_interaccion)

      const tieneTareaPendiente = tareasPermitidasFiltradas.some(
        (tarea) => tarea.contacto_id === contacto.id
      )

      const sinInteraccionReciente =
        diasUltimaInteraccion === null || diasUltimaInteraccion >= 7

      return !tieneTareaPendiente && sinInteraccionReciente
    })
  }, [contactosFiltrados, tareasPermitidasFiltradas])

  const leadsCalientes = useMemo(() => {
    return contactosFiltrados.filter((contacto) => {
      return [
        "Respondió",
        "Lead Calificado",
        "Interesado",
        "Kit / Muestra Ofrecida",
        "Kit / Muestra Enviada",
        "Cotización Enviada",
        "Negociación",
      ].includes(contacto.estado_comercial)
    })
  }, [contactosFiltrados])

  const leadsEnfriandose = useMemo(() => {
    return leadsCalientes.filter((contacto) => {
      const dias = diasDesde(contacto.ultima_interaccion)
      return dias === null || dias >= 5
    })
  }, [leadsCalientes])

  const clientesParaRecompra = useMemo(() => {
    return contactosFiltrados.filter((contacto) => {
      const esCliente =
        contacto.estado_comercial === "Cliente Activo" ||
        contacto.estado_comercial === "Primera Compra" ||
        contacto.estado_comercial === "Recompra"

      const dias = diasDesde(contacto.ultima_interaccion)

      return esCliente && (dias === null || dias >= 30)
    })
  }, [contactosFiltrados])

  const contactosSinDocumento = useMemo(() => {
    return contactosFiltrados.filter((contacto) => !contacto.numero_documento)
  }, [contactosFiltrados])

  const prioridadTotal =
    tareasVencidas.length +
    tareasHoy.length +
    leadsEnfriandose.length +
    contactosSinSeguimiento.length +
    clientesParaRecompra.length

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
              CRM / SEGUIMIENTO
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {esVendedor
                ? "Mi Seguimiento Comercial"
                : "Seguimiento Comercial"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              {esVendedor
                ? "Vista diaria para detectar tus contactos asignados que necesitan atención, leads que se están enfriando y clientes con oportunidad de recompra."
                : "Vista diaria para detectar contactos que necesitan atención, leads que se están enfriando y clientes con oportunidad de recompra."}
            </p>
          </div>

          <Link
            href="/crm/contactos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#737563] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F]"
          >
            <Plus size={18} />
            Nuevo contacto
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {esVendedor && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            Estás viendo únicamente seguimientos de contactos creados por ti o
            asignados a tu usuario.
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737563]">
                Buscar seguimiento
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737563]"
                />

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Código, RUC/DNI, razón social, nombre comercial, nombre, salón, asesor, WhatsApp..."
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
              {contactosFiltrados.length}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-[#1F1F1F]">
              {contactos.length}
            </span>{" "}
            contactos.
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-6">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Prioridades</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : prioridadTotal}
            </h2>
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Tareas vencidas</p>
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

          <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Leads enfriándose</p>
            <h2 className="mt-2 text-3xl font-semibold text-orange-600">
              {loading ? "..." : leadsEnfriandose.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Sin seguimiento</p>
            <h2 className="mt-2 text-3xl font-semibold text-blue-600">
              {loading ? "..." : contactosSinSeguimiento.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Sin documento</p>
            <h2 className="mt-2 text-3xl font-semibold text-yellow-700">
              {loading ? "..." : contactosSinDocumento.length}
            </h2>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <BloqueContactos
            titulo="Leads que se están enfriando"
            descripcion="Leads comerciales activos sin interacción reciente."
            icono={<Flame size={20} />}
            contactos={leadsEnfriandose}
            etiqueta="Reactivar"
            color="orange"
          />

          <BloqueContactos
            titulo="Contactos sin seguimiento"
            descripcion="Contactos activos sin tarea pendiente ni interacción reciente."
            icono={<Snowflake size={20} />}
            contactos={contactosSinSeguimiento}
            etiqueta="Crear seguimiento"
            color="blue"
          />

          <BloqueTareas
            titulo="Tareas vencidas"
            descripcion="Seguimientos que ya debieron completarse."
            icono={<AlertTriangle size={20} />}
            tareas={tareasVencidas}
            estado="Vencida"
            color="red"
          />

          <BloqueTareas
            titulo="Seguimientos de hoy"
            descripcion="Tareas comerciales programadas para hoy."
            icono={<Clock size={20} />}
            tareas={tareasHoy}
            estado="Hoy"
            color="neutral"
          />

          <BloqueContactos
            titulo="Clientes para recompra"
            descripcion="Clientes activos sin interacción reciente."
            icono={<UserRound size={20} />}
            contactos={clientesParaRecompra}
            etiqueta="Recompra"
            color="neutral"
          />

          <BloqueContactos
            titulo="Contactos sin documento"
            descripcion="Contactos que necesitan completar RUC, DNI, C.E. u otro documento."
            icono={<FileText size={20} />}
            contactos={contactosSinDocumento}
            etiqueta="Completar datos"
            color="yellow"
          />
        </section>
      </div>
    </main>
  )
}

function BloqueContactos({
  titulo,
  descripcion,
  icono,
  contactos,
  etiqueta,
  color,
}: {
  titulo: string
  descripcion: string
  icono: ReactNode
  contactos: CrmContacto[]
  etiqueta: string
  color: "orange" | "blue" | "neutral" | "yellow"
}) {
  const estilos = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    neutral: "bg-[#F7F6F2] text-[#737563]",
    yellow: "bg-yellow-50 text-yellow-700",
  }

  return (
    <div className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${estilos[color]}`}
        >
          {icono}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F1F1F]">{titulo}</h2>
          <p className="mt-1 text-sm text-[#737563]">{descripcion}</p>
        </div>
      </div>

      <div className="space-y-3">
        {contactos.slice(0, 8).map((contacto) => {
          const whatsapp = limpiarWhatsapp(contacto.whatsapp)
          const usuarioWhatsapp = limpiarUsuarioWhatsapp(contacto.whatsapp_usuario)
          const asesorVisible = obtenerAsesorVisible(contacto)
          const documentoVisible = obtenerDocumentoVisible(contacto)
          const empresaVisible = obtenerEmpresaVisible(contacto)

          return (
            <div
              key={contacto.id}
              className="rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
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

                  <p className="font-semibold text-[#1F1F1F]">
                    {obtenerNombreCompleto(contacto)}
                  </p>

                  <p className="mt-1 text-xs text-[#737563]">
                    {empresaVisible} · {contacto.estado_comercial}
                  </p>

                  {contacto.razon_social && (
                    <p className="mt-1 text-xs text-[#737563]">
                      Razón social: {contacto.razon_social}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-[#737563]">
                    Asesor:{" "}
                    <span className="font-semibold text-blue-700">
                      {asesorVisible}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-[#737563]">
                    Contacto:{" "}
                    <span className="font-semibold">
                      {contacto.whatsapp || usuarioWhatsapp || "Sin WhatsApp"}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-[#737563]">
                    Última interacción:{" "}
                    {contacto.ultima_interaccion
                      ? `${diasDesde(contacto.ultima_interaccion)} días`
                      : "Sin registro"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      <MessageCircle size={15} />
                      WhatsApp
                    </a>
                  )}

                  <Link
                    href={`/crm/contactos/${contacto.id}`}
                    className="inline-flex rounded-lg border border-[#E5E2DA] bg-white px-3 py-2 text-xs font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
                  >
                    Ver ficha
                  </Link>

                  <span className="inline-flex rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#737563]">
                    {etiqueta}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {contactos.length === 0 && (
          <div className="rounded-xl bg-[#F7F6F2] p-5 text-sm text-[#737563]">
            No hay contactos en esta categoría.
          </div>
        )}
      </div>
    </div>
  )
}

function BloqueTareas({
  titulo,
  descripcion,
  icono,
  tareas,
  estado,
  color,
}: {
  titulo: string
  descripcion: string
  icono: ReactNode
  tareas: CrmTarea[]
  estado: string
  color: "red" | "neutral"
}) {
  const estilos = {
    red: "bg-red-50 text-red-600",
    neutral: "bg-[#F7F6F2] text-[#737563]",
  }

  return (
    <div className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${estilos[color]}`}
        >
          {icono}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F1F1F]">{titulo}</h2>
          <p className="mt-1 text-sm text-[#737563]">{descripcion}</p>
        </div>
      </div>

      <div className="space-y-3">
        {tareas.slice(0, 8).map((tarea) => (
          <div
            key={tarea.id}
            className="rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#1F1F1F]">{tarea.titulo}</p>

                <p className="mt-1 text-xs text-[#737563]">
                  {tarea.fecha_tarea || "Sin fecha"}{" "}
                  {tarea.hora_tarea ? `· ${tarea.hora_tarea}` : ""}
                </p>

                <p className="mt-1 text-xs text-[#737563]">
                  Asesor:{" "}
                  <span className="font-semibold text-blue-700">
                    {tarea.asesor_asignado_nombre || "Sin asignar"}
                  </span>
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  color === "red"
                    ? "bg-red-50 text-red-600"
                    : "bg-white text-[#737563]"
                }`}
              >
                {estado}
              </span>
            </div>
          </div>
        ))}

        {tareas.length === 0 && (
          <div className="rounded-xl bg-[#F7F6F2] p-5 text-sm text-[#737563]">
            No hay tareas en esta categoría.
          </div>
        )}
      </div>
    </div>
  )
}