"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  UserRound,
  KanbanSquare,
  ListChecks,
  Search,
  X,
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
  whatsapp_usuario: string | null
  email: string | null
  ciudad: string | null
  fuente_contacto: string | null
  valor_potencial: number | string | null
  proxima_accion: string | null
}

export default function ContactosPage() {
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("Todos")
  const [filtroEstado, setFiltroEstado] = useState("Todos")

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

  const totalSalones = contactos.filter(
    (contacto) => contacto.tipo_contacto === "Salón"
  ).length

  const totalDistribuidores = contactos.filter(
    (contacto) => contacto.tipo_contacto === "Distribuidor"
  ).length

  const nuevosLeads = contactos.filter(
    (contacto) => contacto.estado_comercial === "Nuevo Lead"
  ).length

  const contactosConUsuarioWhatsapp = contactos.filter(
    (contacto) => !!contacto.whatsapp_usuario
  ).length

  const tiposContacto = useMemo(() => {
    const tipos = contactos
      .map((contacto) => contacto.tipo_contacto)
      .filter(Boolean)

    return ["Todos", ...Array.from(new Set(tipos))]
  }, [contactos])

  const estadosComerciales = useMemo(() => {
    const estados = contactos
      .map((contacto) => contacto.estado_comercial)
      .filter(Boolean)

    return ["Todos", ...Array.from(new Set(estados))]
  }, [contactos])

  const contactosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return contactos.filter((contacto) => {
      const coincideBusqueda =
        texto === "" ||
        contacto.nombre?.toLowerCase().includes(texto) ||
        contacto.apellido?.toLowerCase().includes(texto) ||
        contacto.empresa_salon?.toLowerCase().includes(texto) ||
        contacto.email?.toLowerCase().includes(texto) ||
        contacto.whatsapp?.toLowerCase().includes(texto) ||
        contacto.whatsapp_usuario?.toLowerCase().includes(texto) ||
        contacto.ciudad?.toLowerCase().includes(texto) ||
        contacto.tipo_contacto?.toLowerCase().includes(texto) ||
        contacto.estado_comercial?.toLowerCase().includes(texto) ||
        contacto.fuente_contacto?.toLowerCase().includes(texto)

      const coincideTipo =
        filtroTipo === "Todos" || contacto.tipo_contacto === filtroTipo

      const coincideEstado =
        filtroEstado === "Todos" ||
        contacto.estado_comercial === filtroEstado

      return coincideBusqueda && coincideTipo && coincideEstado
    })
  }, [contactos, busqueda, filtroTipo, filtroEstado])

  const limpiarFiltros = () => {
    setBusqueda("")
    setFiltroTipo("Todos")
    setFiltroEstado("Todos")
  }

  const limpiarUsuarioWhatsapp = (usuario: string | null) => {
    if (!usuario) return ""
    const limpio = usuario.trim()
    if (!limpio) return ""
    return limpio.startsWith("@") ? limpio : `@${limpio}`
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
              CRM / CONTACTOS
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              Contactos Comerciales
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              Base comercial de prospectos, salones, estilistas, distribuidores
              y clientes.
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

        <section className="mb-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Total contactos</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : totalContactos}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Salones</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : totalSalones}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Distribuidores</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : totalDistribuidores}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Nuevos leads</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : nuevosLeads}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">Con @ WhatsApp</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : contactosConUsuarioWhatsapp}
            </h2>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737563]">
                Buscar contacto
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737563]"
                />

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre, empresa, email, número, @usuario, ciudad..."
                  className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] py-3 pl-11 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#737563] focus:border-[#737563] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737563]">
                Tipo
              </label>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#737563] focus:bg-white"
              >
                {tiposContacto.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737563]">
                Estado
              </label>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#737563] focus:bg-white"
              >
                {estadosComerciales.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={limpiarFiltros}
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
              {totalContactos}
            </span>{" "}
            contactos.
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#1F1F1F]">
              Lista de contactos
            </h2>

            <p className="mt-1 text-sm text-[#737563]">
              Vista general de contactos activos del CRM.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2DA] text-left text-xs uppercase tracking-[0.12em] text-[#737563]">
                  <th className="py-3 pr-4 font-semibold">Contacto</th>
                  <th className="py-3 pr-4 font-semibold">Empresa / Salón</th>
                  <th className="py-3 pr-4 font-semibold">Tipo</th>
                  <th className="py-3 pr-4 font-semibold">Estado</th>
                  <th className="py-3 pr-4 font-semibold">Ciudad</th>
                  <th className="py-3 pr-4 font-semibold">Fuente</th>
                  <th className="py-3 pr-4 font-semibold">WhatsApp</th>
                  <th className="py-3 pr-4 font-semibold">Próxima acción</th>
                  <th className="py-3 pr-4 font-semibold">Valor</th>
                  <th className="py-3 pr-4 font-semibold">Acción</th>
                </tr>
              </thead>

              <tbody>
                {contactosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-10 text-center text-sm text-[#737563]"
                    >
                      {loading
                        ? "Cargando contactos..."
                        : "No hay contactos que coincidan con la búsqueda o filtros."}
                    </td>
                  </tr>
                ) : (
                  contactosFiltrados.map((contacto) => {
                    const usuarioWhatsapp = limpiarUsuarioWhatsapp(
                      contacto.whatsapp_usuario
                    )

                    return (
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
                          {contacto.fuente_contacto || "-"}
                        </td>

                        <td className="py-4 pr-4">
                          <div className="space-y-1">
                            <div>{contacto.whatsapp || "-"}</div>

                            {usuarioWhatsapp && (
                              <div className="text-xs font-semibold text-green-700">
                                {usuarioWhatsapp}
                              </div>
                            )}

                            {!contacto.whatsapp && !usuarioWhatsapp && (
                              <div className="text-xs text-[#737563]">
                                Sin WhatsApp
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 pr-4">
                          {contacto.proxima_accion || "-"}
                        </td>

                        <td className="py-4 pr-4 font-semibold text-[#1F1F1F]">
                          S/ {Number(contacto.valor_potencial || 0).toFixed(2)}
                        </td>

                        <td className="py-4 pr-4">
                          <Link
                            href={`/crm/contactos/${contacto.id}`}
                            className="inline-flex rounded-lg border border-[#E5E2DA] px-3 py-2 text-xs font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
                          >
                            Ver ficha
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}