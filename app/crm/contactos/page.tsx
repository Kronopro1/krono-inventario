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
  fuente_contacto: string | null
  valor_potencial: number | string | null
  proxima_accion: string | null
}

export default function ContactosPage() {
  const [contactos, setContactos] = useState<CrmContacto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [perfil, setPerfil] = useState<Perfil | null>(null)

  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("Todos")
  const [filtroEstado, setFiltroEstado] = useState("Todos")

  useEffect(() => {
    async function cargarContactos() {
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

    cargarContactos()
  }, [])

  const esVendedor = perfil?.rol === "vendedor"

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

  const contactosConDocumento = contactos.filter(
    (contacto) => !!contacto.numero_documento
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
      const asesorVisible =
        contacto.asesor_asignado_nombre ||
        contacto.asesor_asignado ||
        "Sin asignar"

      const documentoVisible = [
        contacto.tipo_documento,
        contacto.numero_documento,
      ]
        .filter(Boolean)
        .join(" ")

      const coincideBusqueda =
        texto === "" ||
        contacto.codigo_contacto?.toLowerCase().includes(texto) ||
        contacto.nombre?.toLowerCase().includes(texto) ||
        contacto.apellido?.toLowerCase().includes(texto) ||
        contacto.empresa_salon?.toLowerCase().includes(texto) ||
        contacto.nombre_comercial?.toLowerCase().includes(texto) ||
        contacto.razon_social?.toLowerCase().includes(texto) ||
        contacto.tipo_documento?.toLowerCase().includes(texto) ||
        contacto.numero_documento?.toLowerCase().includes(texto) ||
        documentoVisible.toLowerCase().includes(texto) ||
        contacto.email?.toLowerCase().includes(texto) ||
        contacto.whatsapp?.toLowerCase().includes(texto) ||
        contacto.whatsapp_usuario?.toLowerCase().includes(texto) ||
        contacto.ciudad?.toLowerCase().includes(texto) ||
        contacto.tipo_contacto?.toLowerCase().includes(texto) ||
        contacto.estado_comercial?.toLowerCase().includes(texto) ||
        contacto.fuente_contacto?.toLowerCase().includes(texto) ||
        asesorVisible.toLowerCase().includes(texto)

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

  const obtenerAsesorVisible = (contacto: CrmContacto) => {
    return (
      contacto.asesor_asignado_nombre ||
      contacto.asesor_asignado ||
      "Sin asignar"
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
              {esVendedor ? "Mis Contactos Comerciales" : "Contactos Comerciales"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              {esVendedor
                ? "Contactos creados por ti o asignados a tu gestión comercial."
                : "Base comercial de prospectos, salones, estilistas, distribuidores y clientes."}
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

            {!esVendedor && (
              <Link
                href="/crm/contactos/desactivados"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
              >
                <ArchiveRestore size={18} />
                Desactivados
              </Link>
            )}

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

        {esVendedor && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            Estás viendo únicamente los contactos creados por ti o asignados a
            tu usuario.
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-6">
          <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#737563]">
              {esVendedor ? "Mis contactos" : "Total contactos"}
            </p>
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
            <p className="text-sm text-[#737563]">Con documento</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              {loading ? "..." : contactosConDocumento}
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
                  placeholder="Código, RUC/DNI, razón social, nombre comercial, nombre, empresa, email, WhatsApp..."
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
              {esVendedor
                ? "Vista de contactos activos asignados a tu gestión comercial."
                : "Vista general de contactos activos del CRM."}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px] border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2DA] text-left text-xs uppercase tracking-[0.12em] text-[#737563]">
                  <th className="py-3 pr-4 font-semibold">Código / Documento</th>
                  <th className="py-3 pr-4 font-semibold">Contacto</th>
                  <th className="py-3 pr-4 font-semibold">Empresa / Comercial</th>
                  <th className="py-3 pr-4 font-semibold">Tipo</th>
                  <th className="py-3 pr-4 font-semibold">Estado</th>
                  <th className="py-3 pr-4 font-semibold">Asesor</th>
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
                      colSpan={12}
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

                    const asesorVisible = obtenerAsesorVisible(contacto)
                    const documentoVisible = obtenerDocumentoVisible(contacto)

                    return (
                      <tr
                        key={contacto.id}
                        className="border-b border-[#F0EDE7] text-sm text-[#4A4A4A]"
                      >
                        <td className="py-4 pr-4">
                          <div className="space-y-1">
                            <div className="inline-flex rounded-full bg-[#1F1F1F] px-3 py-1 text-xs font-semibold text-white">
                              {contacto.codigo_contacto || "Sin código"}
                            </div>

                            <div className="text-xs text-[#737563]">
                              {documentoVisible}
                            </div>
                          </div>
                        </td>

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
                          <div className="space-y-1">
                            <div className="font-semibold text-[#1F1F1F]">
                              {contacto.empresa_salon ||
                                contacto.nombre_comercial ||
                                "Sin empresa"}
                            </div>

                            {contacto.razon_social && (
                              <div className="text-xs text-[#737563]">
                                {contacto.razon_social}
                              </div>
                            )}

                            {contacto.nombre_comercial &&
                              contacto.nombre_comercial !==
                                contacto.empresa_salon && (
                                <div className="text-xs text-[#737563]">
                                  Comercial: {contacto.nombre_comercial}
                                </div>
                              )}
                          </div>
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
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {asesorVisible}
                          </span>
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