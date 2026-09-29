"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Users,
  KanbanSquare,
  CalendarCheck,
  Plus,
  ListChecks,
  ArchiveRestore,
  Flame,
  AlertTriangle,
  Clock,
  Snowflake,
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

export default function CrmDashboardPage() {
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [tareas, setTareas] = useState<CrmTarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true)
      setError("")

      const { data: contactosData, error: contactosError } = await supabase
        .from("crm_contactos")
        .select("*")
        .eq("activo", true)
        .order("created_at", { ascending: false })

      if (contactosError) {
        setError(contactosError.message)
        setLoading(false)
        return
      }

      const { data: tareasData, error: tareasError } = await supabase
        .from("crm_tareas")
        .select("*")
        .order("fecha_tarea", { ascending: true })

      if (tareasError) {
        setError(tareasError.message)
        setLoading(false)
        return
      }

      setContactos((contactosData || []) as CrmContacto[])
      setTareas((tareasData || []) as CrmTarea[])
      setLoading(false)
    }

    cargarDatos()
  }, [])

  const hoy = fechaLocalISO()

  const tareasPendientes = useMemo(() => {
    return tareas.filter((tarea) => tarea.estado !== "Completado")
  }, [tareas])

  const tareasVencidas = useMemo(() => {
    return tareasPendientes.filter(
      (tarea) => tarea.fecha_tarea && tarea.fecha_tarea < hoy
    )
  }, [tareasPendientes, hoy])

  const tareasHoy = useMemo(() => {
    return tareasPendientes.filter((tarea) => tarea.fecha_tarea === hoy)
  }, [tareasPendientes, hoy])

  const tareasProximas = useMemo(() => {
    return tareasPendientes.filter(
      (tarea) => tarea.fecha_tarea && tarea.fecha_tarea > hoy
    )
  }, [tareasPendientes, hoy])

  const contactosSinSeguimiento = useMemo(() => {
    return contactos.filter((contacto) => {
      const diasUltimaInteraccion = diasDesde(contacto.ultima_interaccion)

      const sinTareaPendiente = !tareasPendientes.some(
        (tarea) => tarea.contacto_id === contacto.id
      )

      const sinInteraccionReciente =
        diasUltimaInteraccion === null || diasUltimaInteraccion >= 7

      return sinTareaPendiente && sinInteraccionReciente
    })
  }, [contactos, tareasPendientes])

  const leadsCalientes = useMemo(() => {
    return contactos.filter((contacto) => {
      const estado = contacto.estado_comercial

      return (
        estado === "Respondió" ||
        estado === "Lead Calificado" ||
        estado === "Interesado" ||
        estado === "Kit / Muestra Ofrecida" ||
        estado === "Kit / Muestra Enviada" ||
        estado === "Cotización Enviada" ||
        estado === "Negociación"
      )
    })
  }, [contactos])

  const clientesActivos = useMemo(() => {
    return contactos.filter(
      (contacto) =>
        contacto.estado_comercial === "Cliente Activo" ||
        contacto.estado_comercial === "Primera Compra" ||
        contacto.estado_comercial === "Recompra"
    )
  }, [contactos])

  const valorPipeline = useMemo(() => {
    return contactos.reduce((total, contacto) => {
      return total + Number(contacto.valor_potencial || 0)
    }, 0)
  }, [contactos])

  const contactosRecientes = contactos.slice(0, 6)

  return (
    <main className="min-h-screen bg-[#F7F6F2] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737563]">
              KRONO PRO
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              CRM Comercial
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              Seguimiento comercial diario para prospectos, salones,
              estilistas, distribuidores y clientes KRONO PRO.
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
              href="/crm/contactos/desactivados"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              <ArchiveRestore size={18} />
              Desactivados
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

        <section className="mb-8 grid gap-4 md:grid-cols-5">
          <Link
            href="/crm/tareas"
            className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-400"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={22} />
            </div>

            <p className="text-sm text-[#737563]">Tareas vencidas</p>

            <h2 className="mt-2 text-3xl font-semibold text-red-600">
              {loading ? "..." : tareasVencidas.length}
            </h2>

            <p className="mt-2 text-xs font-semibold text-red-500">
              Revisar urgente →
            </p>
          </Link>

          <Link
            href="/crm/tareas"
            className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#737563]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
              <Clock size={22} />
            </div>

            <p className="text-sm text-[#737563]">Seguimientos hoy</p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : tareasHoy.length}
            </h2>

            <p className="mt-2 text-xs font-semibold text-[#737563]">
              Ver agenda →
            </p>
          </Link>

          <Link
            href="/crm/pipeline"
            className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Flame size={22} />
            </div>

            <p className="text-sm text-[#737563]">Leads calientes</p>

            <h2 className="mt-2 text-3xl font-semibold text-orange-600">
              {loading ? "..." : leadsCalientes.length}
            </h2>

            <p className="mt-2 text-xs font-semibold text-orange-500">
              Priorizar venta →
            </p>
          </Link>

          <Link
            href="/crm/contactos"
            className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Snowflake size={22} />
            </div>

            <p className="text-sm text-[#737563]">Sin seguimiento</p>

            <h2 className="mt-2 text-3xl font-semibold text-blue-600">
              {loading ? "..." : contactosSinSeguimiento.length}
            </h2>

            <p className="mt-2 text-xs font-semibold text-blue-500">
              Recuperar contacto →
            </p>
          </Link>

          <Link
            href="/crm/contactos"
            className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#737563]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
              <Users size={22} />
            </div>

            <p className="text-sm text-[#737563]">Contactos activos</p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : contactos.length}
            </h2>

            <p className="mt-2 text-xs font-semibold text-[#737563]">
              Ver contactos →
            </p>
          </Link>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Clientes activos</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : clientesActivos.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Tareas próximas</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : tareasProximas.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Valor potencial</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : `S/ ${valorPipeline.toFixed(2)}`}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Tareas pendientes</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : tareasPendientes.length}
            </h2>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-[#1F1F1F]">
                Prioridad de hoy
              </h2>

              <p className="mt-1 text-sm text-[#737563]">
                Tareas vencidas y seguimientos programados para hoy.
              </p>
            </div>

            <div className="space-y-3">
              {[...tareasVencidas, ...tareasHoy].slice(0, 6).map((tarea) => (
                <div
                  key={tarea.id}
                  className="rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#1F1F1F]">
                        {tarea.titulo}
                      </p>

                      <p className="mt-1 text-xs text-[#737563]">
                        {tarea.fecha_tarea || "Sin fecha"}{" "}
                        {tarea.hora_tarea ? `· ${tarea.hora_tarea}` : ""}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        tarea.fecha_tarea && tarea.fecha_tarea < hoy
                          ? "bg-red-50 text-red-600"
                          : "bg-white text-[#737563]"
                      }`}
                    >
                      {tarea.fecha_tarea && tarea.fecha_tarea < hoy
                        ? "Vencida"
                        : "Hoy"}
                    </span>
                  </div>
                </div>
              ))}

              {[...tareasVencidas, ...tareasHoy].length === 0 && (
                <div className="rounded-xl bg-[#F7F6F2] p-5 text-sm text-[#737563]">
                  No tienes tareas vencidas ni seguimientos para hoy.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-[#1F1F1F]">
                Leads calientes
              </h2>

              <p className="mt-1 text-sm text-[#737563]">
                Contactos con mayor intención comercial según su etapa actual.
              </p>
            </div>

            <div className="space-y-3">
              {leadsCalientes.slice(0, 6).map((contacto) => (
                <Link
                  key={contacto.id}
                  href={`/crm/contactos/${contacto.id}`}
                  className="block rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] p-4 transition hover:border-[#737563] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#1F1F1F]">
                        {contacto.nombre} {contacto.apellido || ""}
                      </p>

                      <p className="mt-1 text-xs text-[#737563]">
                        {contacto.empresa_salon || "Sin empresa"} ·{" "}
                        {contacto.estado_comercial}
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                      Caliente
                    </span>
                  </div>
                </Link>
              ))}

              {leadsCalientes.length === 0 && (
                <div className="rounded-xl bg-[#F7F6F2] p-5 text-sm text-[#737563]">
                  Aún no hay leads calientes en el pipeline.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1F1F1F]">
                Contactos recientes
              </h2>

              <p className="mt-1 text-sm text-[#737563]">
                Últimos contactos registrados en el CRM.
              </p>
            </div>

            <Link
              href="/crm/contactos"
              className="text-sm font-semibold text-[#737563] hover:text-[#1F1F1F]"
            >
              Ver todos
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2DA] text-left text-xs uppercase tracking-[0.12em] text-[#737563]">
                  <th className="py-3 pr-4 font-semibold">Contacto</th>
                  <th className="py-3 pr-4 font-semibold">Empresa / Salón</th>
                  <th className="py-3 pr-4 font-semibold">Tipo</th>
                  <th className="py-3 pr-4 font-semibold">Estado</th>
                  <th className="py-3 pr-4 font-semibold">Ciudad</th>
                  <th className="py-3 pr-4 font-semibold">Valor</th>
                  <th className="py-3 pr-4 font-semibold">Acción</th>
                </tr>
              </thead>

              <tbody>
                {contactosRecientes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-sm text-[#737563]"
                    >
                      {loading
                        ? "Cargando contactos..."
                        : "Aún no hay contactos registrados."}
                    </td>
                  </tr>
                ) : (
                  contactosRecientes.map((contacto) => (
                    <tr
                      key={contacto.id}
                      className="border-b border-[#F0EDE7] text-sm text-[#4A4A4A]"
                    >
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-[#1F1F1F]">
                          {contacto.nombre} {contacto.apellido || ""}
                        </div>

                        <div className="text-xs text-[#737563]">
                          {contacto.email || "Sin email"}
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        {contacto.empresa_salon || "Sin empresa"}
                      </td>

                      <td className="py-4 pr-4">{contacto.tipo_contacto}</td>

                      <td className="py-4 pr-4">
                        {contacto.estado_comercial}
                      </td>

                      <td className="py-4 pr-4">{contacto.ciudad || "-"}</td>

                      <td className="py-4 pr-4 font-semibold text-[#1F1F1F]">
                        S/ {Number(contacto.valor_potencial || 0).toFixed(2)}
                      </td>

                      <td className="py-4 pr-4">
                        <Link
                          href={`/crm/contactos/${contacto.id}`}
                          className="text-sm font-semibold text-[#737563] hover:text-[#1F1F1F]"
                        >
                          Ver ficha
                        </Link>
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