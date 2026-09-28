"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  KanbanSquare,
  CalendarCheck,
  Plus,
  ListChecks,
  ArchiveRestore,
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

export default function CrmDashboardPage() {
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function cargarContactos() {
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

    cargarContactos()
  }, [])

  const totalContactos = contactos.length

  const nuevosLeads = contactos.filter(
    (contacto) => contacto.estado_comercial === "Nuevo Lead"
  ).length

  const clientesActivos = contactos.filter(
    (contacto) =>
      contacto.estado_comercial === "Cliente Activo" ||
      contacto.estado_comercial === "Primera Compra" ||
      contacto.estado_comercial === "Recompra"
  ).length

  const valorPipeline = contactos.reduce((total, contacto) => {
    return total + Number(contacto.valor_potencial || 0)
  }, 0)

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
              Centro de gestión comercial para prospectos, salones, estilistas,
              distribuidores y clientes KRONO PRO.
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

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <Link
            href="/crm/contactos"
            className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#737563]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
              <Users size={22} />
            </div>

            <p className="text-sm text-[#737563]">Contactos activos</p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : totalContactos}
            </h2>

            <p className="mt-2 text-xs font-semibold text-[#737563]">
              Ver contactos →
            </p>
          </Link>

          <Link
            href="/crm/pipeline"
            className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#737563]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
              <KanbanSquare size={22} />
            </div>

            <p className="text-sm text-[#737563]">Nuevos leads</p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : nuevosLeads}
            </h2>

            <p className="mt-2 text-xs font-semibold text-[#737563]">
              Abrir pipeline →
            </p>
          </Link>

          <Link
            href="/crm/tareas"
            className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#737563]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
              <ListChecks size={22} />
            </div>

            <p className="text-sm text-[#737563]">Clientes activos</p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : clientesActivos}
            </h2>

            <p className="mt-2 text-xs font-semibold text-[#737563]">
              Ver tareas →
            </p>
          </Link>

          <Link
            href="/crm/contactos/desactivados"
            className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#737563]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
              <ArchiveRestore size={22} />
            </div>

            <p className="text-sm text-[#737563]">Recuperación</p>

            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              CRM
            </h2>

            <p className="mt-2 text-xs font-semibold text-[#737563]">
              Ver desactivados →
            </p>
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
            <CalendarCheck size={22} />
          </div>

          <p className="text-sm text-[#737563]">Valor potencial total</p>

          <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
            {loading ? "..." : `S/ ${valorPipeline.toFixed(2)}`}
          </h2>
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
                {contactos.length === 0 ? (
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
                  contactos.slice(0, 6).map((contacto) => (
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