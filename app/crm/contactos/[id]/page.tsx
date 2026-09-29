"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  Building2,
  MapPin,
  CalendarCheck,
  BadgeDollarSign,
  UserRound,
  Plus,
  Save,
  StickyNote,
  CheckCircle2,
  Pencil,
  Trash2,
  MessageSquareText,
  Send,
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
  telefono: string | null
  email: string | null
  instagram: string | null
  ciudad: string | null
  departamento_provincia: string | null
  pais: string | null
  fuente_contacto: string | null
  valor_potencial: number | string | null
  proxima_accion: string | null
  fecha_proxima_accion: string | null
  notas_internas: string | null
  created_at: string
}

type CrmNota = {
  id: string
  contacto_id: string
  nota: string
  created_at: string
}

type CrmTarea = {
  id: string
  contacto_id: string
  tipo: string
  titulo: string
  descripcion: string | null
  fecha_tarea: string | null
  hora_tarea: string | null
  estado: string
  created_at: string
}

const plantillasRapidas = [
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

export default function ContactoDetallePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [contacto, setContacto] = useState<CrmContacto | null>(null)
  const [notas, setNotas] = useState<CrmNota[]>([])
  const [tareas, setTareas] = useState<CrmTarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(
    plantillasRapidas[0].id
  )

  const [nuevaNota, setNuevaNota] = useState("")
  const [guardandoNota, setGuardandoNota] = useState(false)

  const [mostrarFormularioTarea, setMostrarFormularioTarea] = useState(false)
  const [guardandoTarea, setGuardandoTarea] = useState(false)

  const [formTarea, setFormTarea] = useState({
    tipo: "Seguimiento",
    titulo: "",
    descripcion: "",
    fecha_tarea: "",
    hora_tarea: "",
  })

  useEffect(() => {
    if (id) {
      cargarDatos()
    }
  }, [id])

  const cargarDatos = async () => {
    setLoading(true)
    setError("")

    const { data: contactoData, error: contactoError } = await supabase
      .from("crm_contactos")
      .select("*")
      .eq("id", id)
      .single()

    if (contactoError) {
      setError(contactoError.message)
      setLoading(false)
      return
    }

    const { data: notasData } = await supabase
      .from("crm_notas")
      .select("*")
      .eq("contacto_id", id)
      .order("created_at", { ascending: false })

    const { data: tareasData } = await supabase
      .from("crm_tareas")
      .select("*")
      .eq("contacto_id", id)
      .order("fecha_tarea", { ascending: true })

    setContacto(contactoData)
    setNotas((notasData || []) as CrmNota[])
    setTareas((tareasData || []) as CrmTarea[])
    setLoading(false)
  }

  const guardarNota = async () => {
    if (!nuevaNota.trim()) return

    setGuardandoNota(true)
    setError("")

    const { error } = await supabase.from("crm_notas").insert({
      contacto_id: id,
      nota: nuevaNota.trim(),
    })

    if (error) {
      setError(error.message)
      setGuardandoNota(false)
      return
    }

    setNuevaNota("")
    await cargarDatos()
    setGuardandoNota(false)
  }

  const guardarTarea = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formTarea.titulo.trim() || !formTarea.fecha_tarea) {
      setError("La tarea necesita título y fecha.")
      return
    }

    setGuardandoTarea(true)
    setError("")

    const { error } = await supabase.from("crm_tareas").insert({
      contacto_id: id,
      tipo: formTarea.tipo,
      titulo: formTarea.titulo.trim(),
      descripcion: formTarea.descripcion.trim() || null,
      fecha_tarea: formTarea.fecha_tarea,
      hora_tarea: formTarea.hora_tarea || null,
      estado: "Pendiente",
      prioridad: "Media",
    })

    if (error) {
      setError(error.message)
      setGuardandoTarea(false)
      return
    }

    setFormTarea({
      tipo: "Seguimiento",
      titulo: "",
      descripcion: "",
      fecha_tarea: "",
      hora_tarea: "",
    })

    setMostrarFormularioTarea(false)
    await cargarDatos()
    setGuardandoTarea(false)
  }

  const desactivarContacto = async () => {
    const confirmar = window.confirm(
      "¿Seguro que deseas desactivar este contacto? No se borrará el historial, solo dejará de aparecer en el CRM."
    )

    if (!confirmar) return

    setError("")

    const { error } = await supabase
      .from("crm_contactos")
      .update({
        activo: false,
        ultima_interaccion: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from("crm_actividades").insert({
      contacto_id: id,
      tipo: "Desactivación",
      titulo: "Contacto desactivado",
      descripcion:
        "El contacto fue desactivado del CRM sin borrar su historial.",
    })

    router.push("/crm/contactos")
  }

  const completarTarea = async (tareaId: string) => {
    const { error } = await supabase
      .from("crm_tareas")
      .update({
        estado: "Completado",
        completada_en: new Date().toISOString(),
      })
      .eq("id", tareaId)

    if (error) {
      setError(error.message)
      return
    }

    await cargarDatos()
  }

  const limpiarWhatsapp = (numero: string | null) => {
    if (!numero) return ""
    return numero.replace(/\D/g, "")
  }

  const obtenerPlantillaSeleccionada = () => {
    return (
      plantillasRapidas.find(
        (plantilla) => plantilla.id === plantillaSeleccionada
      ) || plantillasRapidas[0]
    )
  }

  const abrirWhatsAppConPlantilla = async () => {
    if (!contacto) return

    const whatsapp = limpiarWhatsapp(contacto.whatsapp)

    if (!whatsapp) {
      setError("Este contacto no tiene WhatsApp registrado.")
      return
    }

    const plantilla = obtenerPlantillaSeleccionada()
    const mensaje = encodeURIComponent(plantilla.mensaje)

    await supabase.from("crm_actividades").insert({
      contacto_id: contacto.id,
      tipo: "WhatsApp",
      titulo: `Plantilla usada: ${plantilla.titulo}`,
      descripcion: plantilla.mensaje,
    })

    await supabase
      .from("crm_contactos")
      .update({
        ultima_interaccion: new Date().toISOString(),
      })
      .eq("id", contacto.id)

    window.open(`https://wa.me/${whatsapp}?text=${mensaje}`, "_blank")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F6F2] p-6">
        <div className="mx-auto max-w-7xl text-sm text-[#737563]">
          Cargando ficha del contacto...
        </div>
      </main>
    )
  }

  if (error && !contacto) {
    return (
      <main className="min-h-screen bg-[#F7F6F2] p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          {error}
        </div>
      </main>
    )
  }

  if (!contacto) {
    return (
      <main className="min-h-screen bg-[#F7F6F2] p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[#E5E2DA] bg-white p-6">
          No se encontró el contacto.
        </div>
      </main>
    )
  }

  const nombreCompleto = `${contacto.nombre} ${
    contacto.apellido || ""
  }`.trim()

  const whatsappLink = contacto.whatsapp
    ? `https://wa.me/${contacto.whatsapp.replace(/\D/g, "")}`
    : "#"

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

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-3xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F6F2] text-[#737563]">
                <UserRound size={30} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737563]">
                  {contacto.tipo_contacto}
                </p>

                <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
                  {nombreCompleto}
                </h1>

                <p className="mt-2 text-sm text-[#4A4A4A]">
                  {contacto.empresa_salon || "Sin empresa registrada"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#F7F6F2] px-3 py-1 text-xs font-semibold text-[#737563]">
                    {contacto.estado_comercial}
                  </span>

                  {contacto.fuente_contacto && (
                    <span className="rounded-full bg-[#F7F6F2] px-3 py-1 text-xs font-semibold text-[#737563]">
                      Fuente: {contacto.fuente_contacto}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <Link
                href={`/crm/contactos/${id}/editar`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F1F1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#737563]"
              >
                <Pencil size={18} />
                Editar contacto
              </Link>

              <button
                type="button"
                onClick={desactivarContacto}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
              >
                <Trash2 size={18} />
                Desactivar
              </button>

              {contacto.whatsapp && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#737563] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F]"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              )}

              {contacto.email && (
                <a
                  href={`mailto:${contacto.email}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
                >
                  <Mail size={18} />
                  Email
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
              <MessageSquareText size={22} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1F1F1F]">
                Acción rápida WhatsApp
              </h2>

              <p className="mt-1 text-sm text-[#737563]">
                Elige una plantilla comercial y abre WhatsApp directo con el
                mensaje preparado para este contacto.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737563]">
                Plantilla
              </label>

              <select
                value={plantillaSeleccionada}
                onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#737563] focus:bg-white"
              >
                {plantillasRapidas.map((plantilla) => (
                  <option key={plantilla.id} value={plantilla.id}>
                    {plantilla.titulo}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={abrirWhatsAppConPlantilla}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Send size={18} />
              Abrir WhatsApp
            </button>
          </div>

          <div className="mt-4 whitespace-pre-line rounded-xl bg-[#F7F6F2] p-4 text-sm leading-6 text-[#4A4A4A]">
            {obtenerPlantillaSeleccionada().mensaje}
          </div>

          {!contacto.whatsapp && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
              Este contacto no tiene WhatsApp registrado. Agrega un número para
              usar esta acción rápida.
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1F1F1F]">
                Resumen comercial
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#F7F6F2] p-5">
                  <Building2 size={22} className="mb-3 text-[#737563]" />
                  <p className="text-xs uppercase tracking-[0.14em] text-[#737563]">
                    Empresa / Salón
                  </p>
                  <p className="mt-2 font-semibold text-[#1F1F1F]">
                    {contacto.empresa_salon || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F7F6F2] p-5">
                  <MapPin size={22} className="mb-3 text-[#737563]" />
                  <p className="text-xs uppercase tracking-[0.14em] text-[#737563]">
                    Ubicación
                  </p>
                  <p className="mt-2 font-semibold text-[#1F1F1F]">
                    {[contacto.ciudad, contacto.pais]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F7F6F2] p-5">
                  <CalendarCheck size={22} className="mb-3 text-[#737563]" />
                  <p className="text-xs uppercase tracking-[0.14em] text-[#737563]">
                    Próxima acción
                  </p>
                  <p className="mt-2 font-semibold text-[#1F1F1F]">
                    {contacto.proxima_accion || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F7F6F2] p-5">
                  <BadgeDollarSign
                    size={22}
                    className="mb-3 text-[#737563]"
                  />
                  <p className="text-xs uppercase tracking-[0.14em] text-[#737563]">
                    Valor potencial
                  </p>
                  <p className="mt-2 font-semibold text-[#1F1F1F]">
                    S/ {Number(contacto.valor_potencial || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1F1F1F]">
                    Notas internas
                  </h2>
                  <p className="mt-1 text-sm text-[#737563]">
                    Historial comercial y observaciones del contacto.
                  </p>
                </div>

                <StickyNote size={22} className="text-[#737563]" />
              </div>

              <div className="mb-5">
                <textarea
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  rows={3}
                  placeholder="Escribe una nota interna..."
                  className="w-full rounded-xl border border-[#E5E2DA] px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                />

                <button
                  type="button"
                  onClick={guardarNota}
                  disabled={guardandoNota}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#737563] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F] disabled:opacity-60"
                >
                  <Save size={17} />
                  {guardandoNota ? "Guardando..." : "Guardar nota"}
                </button>
              </div>

              <div className="space-y-3">
                {notas.length === 0 ? (
                  <p className="text-sm text-[#737563]">
                    Aún no hay notas registradas.
                  </p>
                ) : (
                  notas.map((nota) => (
                    <div
                      key={nota.id}
                      className="rounded-2xl border border-[#E5E2DA] bg-[#F7F6F2] p-4"
                    >
                      <p className="whitespace-pre-line text-sm leading-6 text-[#4A4A4A]">
                        {nota.nota}
                      </p>

                      <p className="mt-3 text-xs text-[#737563]">
                        {new Date(nota.created_at).toLocaleString("es-PE")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Datos de contacto
              </h2>

              <div className="mt-5 space-y-4 text-sm text-[#4A4A4A]">
                <div className="flex gap-3">
                  <MessageCircle size={18} className="text-[#737563]" />
                  <span>{contacto.whatsapp || "Sin WhatsApp"}</span>
                </div>

                <div className="flex gap-3">
                  <Phone size={18} className="text-[#737563]" />
                  <span>{contacto.telefono || "Sin teléfono"}</span>
                </div>

                <div className="flex gap-3">
                  <Mail size={18} className="text-[#737563]" />
                  <span>{contacto.email || "Sin email"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1F1F1F]">
                  Tareas
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarFormularioTarea(!mostrarFormularioTarea)
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#737563] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1F1F1F]"
                >
                  <Plus size={15} />
                  Nueva
                </button>
              </div>

              {mostrarFormularioTarea && (
                <form
                  onSubmit={guardarTarea}
                  className="mb-5 space-y-3 rounded-2xl border border-[#E5E2DA] bg-[#F7F6F2] p-4"
                >
                  <select
                    value={formTarea.tipo}
                    onChange={(e) =>
                      setFormTarea((prev) => ({
                        ...prev,
                        tipo: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#E5E2DA] px-3 py-2 text-sm outline-none"
                  >
                    <option>WhatsApp</option>
                    <option>Llamada</option>
                    <option>Email</option>
                    <option>Reunión</option>
                    <option>Seguimiento</option>
                    <option>Visita</option>
                    <option>Demo</option>
                    <option>Capacitación</option>
                    <option>Recompra</option>
                  </select>

                  <input
                    value={formTarea.titulo}
                    onChange={(e) =>
                      setFormTarea((prev) => ({
                        ...prev,
                        titulo: e.target.value,
                      }))
                    }
                    placeholder="Título de la tarea"
                    className="w-full rounded-xl border border-[#E5E2DA] px-3 py-2 text-sm outline-none"
                  />

                  <textarea
                    value={formTarea.descripcion}
                    onChange={(e) =>
                      setFormTarea((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Descripción"
                    className="w-full rounded-xl border border-[#E5E2DA] px-3 py-2 text-sm outline-none"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="date"
                      value={formTarea.fecha_tarea}
                      onChange={(e) =>
                        setFormTarea((prev) => ({
                          ...prev,
                          fecha_tarea: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-[#E5E2DA] px-3 py-2 text-sm outline-none"
                    />

                    <input
                      type="time"
                      value={formTarea.hora_tarea}
                      onChange={(e) =>
                        setFormTarea((prev) => ({
                          ...prev,
                          hora_tarea: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-[#E5E2DA] px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={guardandoTarea}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#737563] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F] disabled:opacity-60"
                  >
                    <Save size={16} />
                    {guardandoTarea ? "Guardando..." : "Guardar tarea"}
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {tareas.length === 0 ? (
                  <p className="text-sm text-[#737563]">
                    No hay tareas registradas.
                  </p>
                ) : (
                  tareas.map((tarea) => (
                    <div
                      key={tarea.id}
                      className="rounded-2xl border border-[#E5E2DA] bg-[#F7F6F2] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#737563]">
                          {tarea.tipo}
                        </span>

                        <span className="text-xs font-semibold text-[#737563]">
                          {tarea.estado}
                        </span>
                      </div>

                      <h3 className="font-semibold text-[#1F1F1F]">
                        {tarea.titulo}
                      </h3>

                      {tarea.descripcion && (
                        <p className="mt-2 text-sm leading-6 text-[#4A4A4A]">
                          {tarea.descripcion}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-[#737563]">
                        {tarea.fecha_tarea || "Sin fecha"}
                        {tarea.hora_tarea ? ` · ${tarea.hora_tarea}` : ""}
                      </p>

                      {tarea.estado !== "Completado" && (
                        <button
                          type="button"
                          onClick={() => completarTarea(tarea.id)}
                          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#737563] hover:text-[#1F1F1F]"
                        >
                          <CheckCircle2 size={15} />
                          Marcar como completada
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}