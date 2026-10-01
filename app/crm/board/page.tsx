"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  UserRound,
  MessageCircle,
  Eye,
  Copy,
  Search,
  X,
  Flame,
  CalendarCheck,
  Clock,
  PackageCheck,
  Handshake,
  RefreshCcw,
  Snowflake,
  BadgeDollarSign,
  Send,
  MessageSquareText,
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
  whatsapp_usuario: string | null
  email: string | null
  ciudad: string | null
  pais: string | null
  fuente_contacto: string | null
  valor_potencial: number | string | null
  proxima_accion: string | null
  fecha_proxima_accion: string | null
  ultima_interaccion: string | null
  created_at: string
}

type ColumnaBoard = {
  id: string
  titulo: string
  descripcion: string
  icono: ReactNode
  color: string
  contactos: CrmContacto[]
}

type PlantillaRapida = {
  id: string
  titulo: string
  mensaje: string
}

const LIMITE_POR_COLUMNA = 20

const etapasComerciales = [
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

const plantillasRapidas: PlantillaRapida[] = [
  {
    id: "primer-contacto",
    titulo: "Primer contacto",
    mensaje:
      "Hola 👋\n\nEstamos seleccionando un grupo reducido de salones para una nueva línea profesional de reparación capilar que llega desde Vancouver, Canadá.\n\nNo buscamos venta masiva. Queremos trabajar con salones que puedan convertirse en aliados pioneros en esta primera etapa.\n\n¿Te gustaría conocer cómo funciona el programa?",
  },
  {
    id: "si-responde",
    titulo: "Si responde “sí / cuéntame”",
    mensaje:
      "Perfecto 🙌\n\nLa idea es formar un primer grupo de salones aliados: profesionales que puedan conocer la línea desde su etapa inicial y acceder a condiciones preferenciales, capacitación y futuras oportunidades de colaboración.\n\nAntes de enviarte la información completa, para entender mejor tu perfil:\n\n¿Trabajan principalmente con color, decoloración o reparación capilar?",
  },
  {
    id: "conectar-necesidad",
    titulo: "Conectar necesidad",
    mensaje:
      "Entonces hay bastante afinidad con lo que estamos desarrollando.\n\nLa línea está enfocada en cabello tratado y exigente, especialmente después de coloraciones, decoloraciones, calor y procesos químicos.\n\nLa idea no es que cambies de inmediato lo que ya usas, sino que puedas conocer la rutina, probarla y evaluar el resultado desde tu experiencia profesional.\n\n¿Te gustaría conocer el kit profesional y las condiciones del programa?",
  },
  {
    id: "beneficios",
    titulo: "Presentar beneficios",
    mensaje:
      "Como parte del grupo inicial de salones aliados, podrías acceder a:\n\n• Condiciones profesionales preferenciales\n• Beneficios especiales de lanzamiento\n• Capacitación y material técnico\n• Acceso anticipado a nuevos productos\n• Material de apoyo para el salón\n• Oportunidades de colaboración con la marca\n\nLa idea es crecer junto a los primeros salones que realmente conecten con la propuesta.",
  },
  {
    id: "invitacion-prueba",
    titulo: "Invitación a prueba",
    mensaje:
      "No buscamos que cambies de inmediato la marca con la que ya trabajas.\n\nLo que buscamos es que pruebes la rutina, evalúes el resultado en tu salón y decidas desde tu experiencia profesional.\n\nSi te parece, te puedo enviar las opciones del kit de introducción para esta primera etapa.",
  },
  {
    id: "seguimiento-2-4",
    titulo: "Seguimiento 2–4 días",
    mensaje:
      "Hola 👋\n\nTe dejo algo que quizá te resulte interesante.\n\nLa línea nace pensando en el cabello que hoy recibe más exigencia: color, decoloración, calor y procesos químicos.\n\nSi te interesa conocer la rutina profesional y cómo estamos trabajando con los primeros salones aliados, con gusto te explico el programa.",
  },
  {
    id: "seguimiento-7-10",
    titulo: "Seguimiento 7–10 días",
    mensaje:
      "Hola nuevamente 👋\n\nEstamos cerrando esta primera etapa de incorporación de salones aliados y recordé nuestra conversación.\n\nSi todavía te interesa conocer la línea, puedo enviarte las condiciones profesionales de introducción.\n\nSi ahora no es el momento, ningún problema 😊",
  },
  {
    id: "objecion-precio",
    titulo: "Objeción precio",
    mensaje:
      "Claro.\n\nTenemos un programa de condiciones preferenciales para salones aliados, diferente al precio regular.\n\nLa idea es beneficiar especialmente a quienes entren en esta primera etapa.\n\nTe puedo enviar las opciones profesionales disponibles, pero antes dime: ¿lo usarías principalmente para servicio en salón, reventa o ambos?",
  },
]

export default function BoardCRMPage() {
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [actualizandoId, setActualizandoId] = useState<string | null>(null)
  const [enviandoPlantillaId, setEnviandoPlantillaId] = useState<string | null>(
    null
  )
  const [plantillaPorContacto, setPlantillaPorContacto] = useState<
    Record<string, string>
  >({})

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
      setLoading(false)
      return
    }

    setContactos((data || []) as CrmContacto[])
    setLoading(false)
  }

  const limpiarWhatsapp = (numero: string | null) => {
    if (!numero) return ""
    return numero.replace(/\D/g, "")
  }

  const limpiarUsuarioWhatsapp = (usuario: string | null) => {
    if (!usuario) return ""

    const limpio = usuario.trim()

    if (!limpio) return ""

    return limpio.startsWith("@") ? limpio : `@${limpio}`
  }

  const fechaHoy = () => {
    const hoy = new Date()
    const year = hoy.getFullYear()
    const month = String(hoy.getMonth() + 1).padStart(2, "0")
    const day = String(hoy.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const fechaNormalizada = (fecha: string | null) => {
    if (!fecha) return ""

    return fecha.slice(0, 10)
  }

  const diasDesde = (fecha: string | null) => {
    if (!fecha) return 999

    const fechaBase = new Date(fecha)
    const hoy = new Date()

    const diferencia = hoy.getTime() - fechaBase.getTime()

    return Math.floor(diferencia / (1000 * 60 * 60 * 24))
  }

  const obtenerPlantillaContacto = (contactoId: string) => {
    const plantillaId = plantillaPorContacto[contactoId] || plantillasRapidas[0].id

    return (
      plantillasRapidas.find((plantilla) => plantilla.id === plantillaId) ||
      plantillasRapidas[0]
    )
  }

  const cambiarPlantillaContacto = (contactoId: string, plantillaId: string) => {
    setPlantillaPorContacto((prev) => ({
      ...prev,
      [contactoId]: plantillaId,
    }))
  }

  const limpiarMensajeTemporal = () => {
    setTimeout(() => {
      setMensaje("")
    }, 3500)
  }

  const copiarUsuario = async (usuario: string | null) => {
    const usuarioLimpio = limpiarUsuarioWhatsapp(usuario)

    if (!usuarioLimpio) return

    try {
      await navigator.clipboard.writeText(usuarioLimpio)
      setMensaje(`Usuario copiado: ${usuarioLimpio}`)
    } catch {
      setMensaje(`Copia manualmente este usuario: ${usuarioLimpio}`)
    }

    limpiarMensajeTemporal()
  }

  const actualizarEstadoContacto = async (
    contacto: CrmContacto,
    nuevoEstado: string
  ) => {
    if (!nuevoEstado || nuevoEstado === contacto.estado_comercial) return

    setActualizandoId(contacto.id)
    setError("")
    setMensaje("")

    const fechaActual = new Date().toISOString()

    const { error } = await supabase
      .from("crm_contactos")
      .update({
        estado_comercial: nuevoEstado,
        ultima_interaccion: fechaActual,
      })
      .eq("id", contacto.id)

    if (error) {
      setError(error.message)
      setActualizandoId(null)
      return
    }

    await supabase.from("crm_actividades").insert({
      contacto_id: contacto.id,
      tipo: "Cambio de etapa",
      titulo: `Etapa actualizada a ${nuevoEstado}`,
      descripcion: `El contacto pasó de "${contacto.estado_comercial}" a "${nuevoEstado}" desde el Board Comercial.`,
    })

    setContactos((prev) =>
      prev.map((item) =>
        item.id === contacto.id
          ? {
              ...item,
              estado_comercial: nuevoEstado,
              ultima_interaccion: fechaActual,
            }
          : item
      )
    )

    setMensaje(`Etapa actualizada: ${nuevoEstado}`)
    limpiarMensajeTemporal()
    setActualizandoId(null)
  }

  const usarPlantillaWhatsApp = async (contacto: CrmContacto) => {
    const plantilla = obtenerPlantillaContacto(contacto.id)
    const whatsapp = limpiarWhatsapp(contacto.whatsapp)
    const usuarioWhatsapp = limpiarUsuarioWhatsapp(contacto.whatsapp_usuario)
    const fechaActual = new Date().toISOString()

    setEnviandoPlantillaId(contacto.id)
    setError("")
    setMensaje("")

    await supabase.from("crm_actividades").insert({
      contacto_id: contacto.id,
      tipo: "WhatsApp",
      titulo: `Plantilla usada desde Board: ${plantilla.titulo}`,
      descripcion: plantilla.mensaje,
    })

    await supabase
      .from("crm_contactos")
      .update({
        ultima_interaccion: fechaActual,
      })
      .eq("id", contacto.id)

    setContactos((prev) =>
      prev.map((item) =>
        item.id === contacto.id
          ? {
              ...item,
              ultima_interaccion: fechaActual,
            }
          : item
      )
    )

    if (whatsapp) {
      const mensajeCodificado = encodeURIComponent(plantilla.mensaje)
      window.open(`https://wa.me/${whatsapp}?text=${mensajeCodificado}`, "_blank")
      setMensaje(`Plantilla abierta: ${plantilla.titulo}`)
      limpiarMensajeTemporal()
      setEnviandoPlantillaId(null)
      return
    }

    if (usuarioWhatsapp) {
      try {
        await navigator.clipboard.writeText(usuarioWhatsapp)
        setMensaje(
          `Este contacto no tiene número. Se copió el usuario ${usuarioWhatsapp} para buscarlo en WhatsApp.`
        )
      } catch {
        setMensaje(
          `Copia manualmente este usuario en WhatsApp: ${usuarioWhatsapp}`
        )
      }

      limpiarMensajeTemporal()
      setEnviandoPlantillaId(null)
      return
    }

    setError("Este contacto no tiene número ni usuario de WhatsApp registrado.")
    setEnviandoPlantillaId(null)
  }

  const contactosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return contactos

    return contactos.filter((contacto) => {
      const usuarioWhatsapp = limpiarUsuarioWhatsapp(contacto.whatsapp_usuario)

      return (
        contacto.nombre?.toLowerCase().includes(texto) ||
        contacto.apellido?.toLowerCase().includes(texto) ||
        contacto.empresa_salon?.toLowerCase().includes(texto) ||
        contacto.tipo_contacto?.toLowerCase().includes(texto) ||
        contacto.estado_comercial?.toLowerCase().includes(texto) ||
        contacto.whatsapp?.toLowerCase().includes(texto) ||
        usuarioWhatsapp.toLowerCase().includes(texto) ||
        contacto.email?.toLowerCase().includes(texto) ||
        contacto.ciudad?.toLowerCase().includes(texto) ||
        contacto.fuente_contacto?.toLowerCase().includes(texto)
      )
    })
  }, [contactos, busqueda])

  const columnas = useMemo<ColumnaBoard[]>((() => {
    const hoy = fechaHoy()

    const seguimientoHoy = contactosFiltrados.filter(
      (contacto) => fechaNormalizada(contacto.fecha_proxima_accion) === hoy
    )

    const leadsCalientes = contactosFiltrados.filter((contacto) =>
      [
        "Respondió",
        "Lead Calificado",
        "Interesado",
        "Presentación de Marca",
      ].includes(contacto.estado_comercial)
    )

    const sinSeguimiento = contactosFiltrados.filter((contacto) => {
      const sinProximaAccion =
        !contacto.proxima_accion && !contacto.fecha_proxima_accion

      const esLeadInicial = [
        "Nuevo Lead",
        "Primer Contacto",
        "Respondió",
        "Lead Calificado",
      ].includes(contacto.estado_comercial)

      return sinProximaAccion && esLeadInicial
    })

    const kitEnviado = contactosFiltrados.filter((contacto) =>
      [
        "Kit / Muestra Ofrecida",
        "Kit / Muestra Enviada",
        "Seguimiento de Prueba",
      ].includes(contacto.estado_comercial)
    )

    const cotizacionNegociacion = contactosFiltrados.filter((contacto) =>
      ["Cotización Enviada", "Negociación"].includes(contacto.estado_comercial)
    )

    const clientesRecompra = contactosFiltrados.filter((contacto) =>
      [
        "Primera Compra",
        "Cliente Activo",
        "Recompra",
        "Salón Embajador",
        "Distribuidor Potencial",
      ].includes(contacto.estado_comercial)
    )

    return [
      {
        id: "seguimiento-hoy",
        titulo: "Seguimiento hoy",
        descripcion: "Contactos con acción programada para hoy.",
        icono: <CalendarCheck size={18} />,
        color: "text-blue-700 bg-blue-50 border-blue-200",
        contactos: seguimientoHoy,
      },
      {
        id: "leads-calientes",
        titulo: "Leads calientes",
        descripcion: "Contactos que ya respondieron o muestran interés.",
        icono: <Flame size={18} />,
        color: "text-orange-700 bg-orange-50 border-orange-200",
        contactos: leadsCalientes,
      },
      {
        id: "sin-seguimiento",
        titulo: "Sin seguimiento",
        descripcion: "Leads que necesitan próxima acción.",
        icono: <Clock size={18} />,
        color: "text-sky-700 bg-sky-50 border-sky-200",
        contactos: sinSeguimiento,
      },
      {
        id: "kit-enviado",
        titulo: "Kit / muestra",
        descripcion: "Contactos en etapa de prueba o muestra.",
        icono: <PackageCheck size={18} />,
        color: "text-purple-700 bg-purple-50 border-purple-200",
        contactos: kitEnviado,
      },
      {
        id: "cotizacion",
        titulo: "Cotización / negociación",
        descripcion: "Oportunidades cerca de cerrar.",
        icono: <Handshake size={18} />,
        color: "text-green-700 bg-green-50 border-green-200",
        contactos: cotizacionNegociacion,
      },
      {
        id: "clientes",
        titulo: "Clientes / recompra",
        descripcion: "Clientes activos o con potencial de recompra.",
        icono: <RefreshCcw size={18} />,
        color: "text-[#737563] bg-[#F7F6F2] border-[#E5E2DA]",
        contactos: clientesRecompra,
      },
    ]
  }) as () => ColumnaBoard[], [contactosFiltrados])

  const totalVisibles = contactosFiltrados.length

  const valorTotal = contactosFiltrados.reduce((total, contacto) => {
    return total + Number(contacto.valor_potencial || 0)
  }, 0)

  const totalAccionables = columnas.reduce((total, columna) => {
    return total + columna.contactos.length
  }, 0)

  const contactosConWhatsApp = contactosFiltrados.filter(
    (contacto) => contacto.whatsapp || contacto.whatsapp_usuario
  ).length

  return (
    <main className="min-h-screen bg-[#F7F6F2] p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6">
          <Link
            href="/crm"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#737563] hover:text-[#1F1F1F]"
          >
            <ArrowLeft size={16} />
            Volver al CRM
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737563]">
              CRM / BOARD COMERCIAL
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              Board Comercial Inteligente
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-[#4A4A4A]">
              Vista de trabajo para priorizar seguimientos, leads calientes,
              kits enviados, cotizaciones y clientes activos. La base completa
              sigue estando en Contactos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/crm/contactos"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              <UserRound size={18} />
              Base completa
            </Link>

            <Link
              href="/crm/contactos/nuevo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#737563] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F]"
            >
              + Nuevo contacto
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {mensaje}
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Contactos filtrados</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : totalVisibles}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Accionables en board</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : totalAccionables}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Con WhatsApp / @</p>
            <div className="mt-2 flex items-center gap-2">
              <MessageCircle size={26} className="text-green-600" />
              <h2 className="text-3xl font-semibold text-[#1F1F1F]">
                {loading ? "..." : contactosConWhatsApp}
              </h2>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Valor potencial</p>
            <div className="mt-2 flex items-center gap-2">
              <BadgeDollarSign size={26} className="text-[#737563]" />
              <h2 className="text-2xl font-semibold text-[#1F1F1F]">
                S/ {valorTotal.toFixed(2)}
              </h2>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737563]">
                Buscar en el board
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737563]"
                />

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre, salón, estado, número, @usuario, ciudad..."
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
        </section>

        <section className="overflow-x-auto pb-4">
          <div className="flex min-h-[650px] gap-4">
            {columnas.map((columna) => {
              const contactosLimitados = columna.contactos.slice(
                0,
                LIMITE_POR_COLUMNA
              )

              const contactosOcultos =
                columna.contactos.length - contactosLimitados.length

              return (
                <div
                  key={columna.id}
                  className="flex w-[360px] shrink-0 flex-col rounded-3xl border border-[#E5E2DA] bg-white shadow-sm"
                >
                  <div className="sticky top-0 z-10 rounded-t-3xl border-b border-[#E5E2DA] bg-white p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <div
                          className={`mb-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${columna.color}`}
                        >
                          {columna.icono}
                          {columna.titulo}
                        </div>

                        <p className="text-xs leading-5 text-[#737563]">
                          {columna.descripcion}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#F7F6F2] px-3 py-1 text-xs font-semibold text-[#737563]">
                        {columna.contactos.length}
                      </span>
                    </div>

                    {contactosOcultos > 0 && (
                      <div className="rounded-xl bg-[#F7F6F2] px-3 py-2 text-xs font-semibold text-[#737563]">
                        Mostrando {LIMITE_POR_COLUMNA} de{" "}
                        {columna.contactos.length}. Refina la búsqueda para ver
                        más.
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 p-4">
                    {loading ? (
                      <div className="rounded-2xl bg-[#F7F6F2] p-4 text-sm text-[#737563]">
                        Cargando...
                      </div>
                    ) : contactosLimitados.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#E5E2DA] bg-[#F7F6F2] p-4 text-sm text-[#737563]">
                        No hay contactos accionables aquí.
                      </div>
                    ) : (
                      contactosLimitados.map((contacto) => {
                        const nombreCompleto = `${contacto.nombre} ${
                          contacto.apellido || ""
                        }`.trim()

                        const whatsappLimpio = limpiarWhatsapp(
                          contacto.whatsapp
                        )

                        const usuarioWhatsapp = limpiarUsuarioWhatsapp(
                          contacto.whatsapp_usuario
                        )

                        const diasSinInteraccion = diasDesde(
                          contacto.ultima_interaccion || contacto.created_at
                        )

                        const estaActualizando =
                          actualizandoId === contacto.id

                        const estaEnviandoPlantilla =
                          enviandoPlantillaId === contacto.id

                        const plantillaSeleccionada =
                          obtenerPlantillaContacto(contacto.id)

                        return (
                          <div
                            key={`${columna.id}-${contacto.id}`}
                            className="rounded-2xl border border-[#E5E2DA] bg-[#FAF9F6] p-4 transition hover:-translate-y-0.5 hover:border-[#737563] hover:bg-white"
                          >
                            <div className="mb-3 flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#737563]">
                                <UserRound size={18} />
                              </div>

                              <div className="min-w-0">
                                <h3 className="truncate font-semibold text-[#1F1F1F]">
                                  {nombreCompleto}
                                </h3>

                                <p className="mt-1 line-clamp-2 text-xs text-[#737563]">
                                  {contacto.empresa_salon ||
                                    "Sin empresa registrada"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs text-[#4A4A4A]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded-full bg-white px-2 py-1 font-semibold text-[#737563]">
                                  {contacto.tipo_contacto}
                                </span>

                                {contacto.ciudad && (
                                  <span className="truncate text-[#737563]">
                                    {contacto.ciudad}
                                  </span>
                                )}
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#737563]">
                                  Etapa comercial
                                </label>

                                <select
                                  value={contacto.estado_comercial}
                                  disabled={estaActualizando}
                                  onChange={(e) =>
                                    actualizarEstadoContacto(
                                      contacto,
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-[#E5E2DA] bg-[#F7F6F2] px-3 py-2 text-xs font-semibold text-[#1F1F1F] outline-none transition focus:border-[#737563] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {etapasComerciales.map((etapa) => (
                                    <option key={etapa} value={etapa}>
                                      {etapa}
                                    </option>
                                  ))}
                                </select>

                                {estaActualizando && (
                                  <p className="mt-2 text-[11px] font-semibold text-[#737563]">
                                    Actualizando etapa...
                                  </p>
                                )}
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <label className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#737563]">
                                  <MessageSquareText size={13} />
                                  Plantilla rápida
                                </label>

                                <select
                                  value={plantillaSeleccionada.id}
                                  onChange={(e) =>
                                    cambiarPlantillaContacto(
                                      contacto.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-[#E5E2DA] bg-[#F7F6F2] px-3 py-2 text-xs font-semibold text-[#1F1F1F] outline-none transition focus:border-[#737563] focus:bg-white"
                                >
                                  {plantillasRapidas.map((plantilla) => (
                                    <option
                                      key={plantilla.id}
                                      value={plantilla.id}
                                    >
                                      {plantilla.titulo}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => usarPlantillaWhatsApp(contacto)}
                                  disabled={estaEnviandoPlantilla}
                                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1F1F1F] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#737563] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Send size={14} />
                                  {estaEnviandoPlantilla
                                    ? "Preparando..."
                                    : whatsappLimpio
                                      ? "Abrir plantilla"
                                      : usuarioWhatsapp
                                        ? "Copiar usuario"
                                        : "Sin WhatsApp"}
                                </button>
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <p className="font-semibold text-[#737563]">
                                  Contacto
                                </p>

                                <p className="mt-1">
                                  {contacto.whatsapp ||
                                    usuarioWhatsapp ||
                                    "Sin WhatsApp"}
                                </p>

                                {contacto.whatsapp && usuarioWhatsapp && (
                                  <p className="mt-1 font-semibold text-green-700">
                                    {usuarioWhatsapp}
                                  </p>
                                )}
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <p className="font-semibold text-[#737563]">
                                  Próxima acción
                                </p>

                                <p className="mt-1">
                                  {contacto.proxima_accion || "Sin acción"}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-xl bg-white p-3">
                                  <p className="font-semibold text-[#737563]">
                                    Valor
                                  </p>

                                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                                    S/{" "}
                                    {Number(
                                      contacto.valor_potencial || 0
                                    ).toFixed(2)}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-white p-3">
                                  <p className="font-semibold text-[#737563]">
                                    Sin contacto
                                  </p>

                                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                                    {diasSinInteraccion} días
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <Link
                                href={`/crm/contactos/${contacto.id}`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-3 py-2 text-xs font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
                              >
                                <Eye size={15} />
                                Ficha
                              </Link>

                              {whatsappLimpio ? (
                                <a
                                  href={`https://wa.me/${whatsappLimpio}`}
                                  target="_blank"
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                >
                                  <MessageCircle size={15} />
                                  WhatsApp
                                </a>
                              ) : usuarioWhatsapp ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    copiarUsuario(contacto.whatsapp_usuario)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                >
                                  <Copy size={15} />
                                  Copiar @
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E5E2DA] px-3 py-2 text-xs font-semibold text-[#737563]"
                                >
                                  <Snowflake size={15} />
                                  Sin dato
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}