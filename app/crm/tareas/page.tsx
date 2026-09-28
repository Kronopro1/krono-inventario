"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { supabase } from "@/src/lib/supabase"

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
}

type CrmContacto = {
  id: string
  nombre: string
  apellido: string | null
  empresa_salon: string | null
  whatsapp: string | null
  email: string | null
}

export default function TareasPage() {
  const [tareas, setTareas] = useState<CrmTarea[]>([])
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    setError("")

    const { data: tareasData, error: tareasError } = await supabase
      .from("crm_tareas")
      .select("*")
      .order("fecha_tarea", { ascending: true })

    if (tareasError) {
      setError(tareasError.message)
      setLoading(false)
      return
    }

    const { data: contactosData, error: contactosError } = await supabase
      .from("crm_contactos")
      .select("id, nombre, apellido, empresa_salon, whatsapp, email")
      .eq("activo", true)

    if (contactosError) {
      setError(contactosError.message)
      setLoading(false)
      return
    }

    setTareas((tareasData || []) as CrmTarea[])
    setContactos((contactosData || []) as CrmContacto[])
    setLoading(false)
  }

  const hoy = new Date().toISOString().slice(0, 10)

  const contactoPorId = (contactoId: string) => {
    return contactos.find((contacto) => contacto.id === contactoId)
  }

  const tareasPendientes = tareas.filter(
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

  const tareasCompletadas = tareas.filter(
    (tarea) => tarea.estado === "Completado"
  )

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

  const renderTarea = (tarea: CrmTarea) => {
    const contacto = contactoPorId(tarea.contacto_id)

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

        <div className="space-y-2 text-sm text-[#4A4A4A]">
          <div className="flex items-center gap-2">
            <UserRound size={16} className="text-[#737563]" />

            {contacto ? (
              <Link
                href={`/crm/contactos/${contacto.id}`}
                className="font-semibold text-[#1F1F1F] hover:text-[#737563]"
              >
                {contacto.nombre} {contacto.apellido || ""}
              </Link>
            ) : (
              <span>Contacto no encontrado</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-[#737563]" />
            <span>
              {tarea.fecha_tarea || "Sin fecha"}
              {tarea.hora_tarea ? ` · ${tarea.hora_tarea}` : ""}
            </span>
          </div>

          {contacto?.empresa_salon && (
            <p className="text-sm text-[#737563]">
              {contacto.empresa_salon}
            </p>
          )}
        </div>

        {tarea.estado !== "Completado" && (
          <button
            onClick={() => completarTarea(tarea.id)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#737563] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1F1F1F]"
          >
            <CheckCircle2 size={16} />
            Marcar completada
          </button>
        )}
      </div>
    )
  }

  const renderGrupo = (
    titulo: string,
    descripcion: string,
    lista: CrmTarea[],
    icono: React.ReactNode
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
              Tareas Comerciales
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              Seguimiento centralizado para llamadas, WhatsApp, reuniones,
              demos, capacitaciones y recompra.
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

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Vencidas</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
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