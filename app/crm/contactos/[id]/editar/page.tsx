"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, UserCheck } from "lucide-react"
import { supabase } from "@/src/lib/supabase"

type Rol = "admin" | "operador" | "consulta" | "vendedor"

type PerfilUsuario = {
  id: string
  nombre: string
  email: string
  rol: Rol
  activo: boolean
}

type AsesorCRM = {
  id: string
  nombre: string
  email: string
  rol: Rol
  activo: boolean
}

type ContactoActual = {
  id: string
  creado_por: string | null
  asesor_asignado_id: string | null
  asesor_asignado_nombre: string | null
  asesor_asignado: string | null
}

type ContactoForm = {
  nombre: string
  apellido: string
  empresa_salon: string
  razon_social: string
  nombre_comercial: string
  tipo_documento: string
  numero_documento: string
  tipo_contacto: string
  estado_comercial: string
  asesor_asignado_id: string
  whatsapp: string
  whatsapp_usuario: string
  telefono: string
  email: string
  instagram: string
  ciudad: string
  departamento_provincia: string
  pais: string
  fuente_contacto: string
  valor_potencial: string
  proxima_accion: string
  fecha_proxima_accion: string
  notas_internas: string
}

const tiposContacto = [
  "Prospecto",
  "Salón",
  "Salón Embajador",
  "Estilista",
  "Distribuidor",
  "Tienda",
  "Cliente final",
  "Influencer",
  "Proveedor",
  "Lead perdido",
  "Inactivo",
  "Otro",
]

const estadosComerciales = [
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

const tiposDocumento = [
  "Sin documento",
  "RUC",
  "DNI",
  "C.E.",
  "Pasaporte",
  "NIT",
  "RFC",
  "Otro",
]

export default function EditarContactoPage() {
  const params = useParams()
  const router = useRouter()

  const contactoId = params.id as string

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilUsuario | null>(null)
  const [contactoActual, setContactoActual] = useState<ContactoActual | null>(
    null
  )
  const [asesores, setAsesores] = useState<AsesorCRM[]>([])

  const [form, setForm] = useState<ContactoForm>({
    nombre: "",
    apellido: "",
    empresa_salon: "",
    razon_social: "",
    nombre_comercial: "",
    tipo_documento: "Sin documento",
    numero_documento: "",
    tipo_contacto: "Salón",
    estado_comercial: "Nuevo Lead",
    asesor_asignado_id: "",
    whatsapp: "",
    whatsapp_usuario: "",
    telefono: "",
    email: "",
    instagram: "",
    ciudad: "",
    departamento_provincia: "",
    pais: "Perú",
    fuente_contacto: "",
    valor_potencial: "",
    proxima_accion: "",
    fecha_proxima_accion: "",
    notas_internas: "",
  })

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
        .select("id, nombre, email, rol, activo")
        .eq("email", session.user.email)
        .single()

      if (perfilError || !perfilData) {
        setError("No se pudo cargar el perfil del usuario.")
        setLoading(false)
        return
      }

      const perfil = perfilData as PerfilUsuario
      setPerfilUsuario(perfil)

      const { data: contactoData, error: contactoError } = await supabase
        .from("crm_contactos")
        .select("*")
        .eq("id", contactoId)
        .single()

      if (contactoError) {
        setError(contactoError.message)
        setLoading(false)
        return
      }

      const contacto = contactoData as ContactoActual
      setContactoActual(contacto)

      const esVendedor = perfil.rol === "vendedor"
      const puedeEditar =
        !esVendedor ||
        contacto.creado_por === session.user.id ||
        contacto.asesor_asignado_id === session.user.id

      if (!puedeEditar) {
        setError("No tienes permiso para editar este contacto.")
        setLoading(false)
        return
      }

      const { data: asesoresData, error: asesoresError } = await supabase
        .from("perfiles")
        .select("id, nombre, email, rol, activo")
        .eq("activo", true)
        .in("rol", ["admin", "operador", "vendedor"])
        .order("nombre", { ascending: true })

      if (asesoresError) {
        setError(asesoresError.message)
        setLoading(false)
        return
      }

      setAsesores((asesoresData || []) as AsesorCRM[])

      setForm({
        nombre: contactoData.nombre || "",
        apellido: contactoData.apellido || "",
        empresa_salon: contactoData.empresa_salon || "",
        razon_social: contactoData.razon_social || "",
        nombre_comercial: contactoData.nombre_comercial || "",
        tipo_documento: contactoData.tipo_documento || "Sin documento",
        numero_documento: contactoData.numero_documento || "",
        tipo_contacto: contactoData.tipo_contacto || "Salón",
        estado_comercial: contactoData.estado_comercial || "Nuevo Lead",
        asesor_asignado_id: contactoData.asesor_asignado_id || "",
        whatsapp: contactoData.whatsapp || "",
        whatsapp_usuario: contactoData.whatsapp_usuario || "",
        telefono: contactoData.telefono || "",
        email: contactoData.email || "",
        instagram: contactoData.instagram || "",
        ciudad: contactoData.ciudad || "",
        departamento_provincia: contactoData.departamento_provincia || "",
        pais: contactoData.pais || "Perú",
        fuente_contacto: contactoData.fuente_contacto || "",
        valor_potencial:
          contactoData.valor_potencial !== null &&
          contactoData.valor_potencial !== undefined
            ? String(contactoData.valor_potencial)
            : "",
        proxima_accion: contactoData.proxima_accion || "",
        fecha_proxima_accion: contactoData.fecha_proxima_accion
          ? contactoData.fecha_proxima_accion.slice(0, 10)
          : "",
        notas_internas: contactoData.notas_internas || "",
      })

      setLoading(false)
    }

    if (contactoId) {
      cargarDatos()
    }
  }, [contactoId])

  const actualizarCampo = (campo: keyof ContactoForm, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const limpiarUsuarioWhatsapp = (usuario: string) => {
    const limpio = usuario.trim()

    if (!limpio) return null

    return limpio.startsWith("@") ? limpio : `@${limpio}`
  }

  const obtenerAsesorSeleccionado = () => {
    if (!form.asesor_asignado_id) return null

    return (
      asesores.find((asesor) => asesor.id === form.asesor_asignado_id) || null
    )
  }

  const puedeAsignarAsesor =
    perfilUsuario?.rol === "admin" || perfilUsuario?.rol === "operador"

  const guardarCambios = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGuardando(true)
    setError("")

    if (!form.nombre.trim()) {
      setError("El nombre del contacto es obligatorio.")
      setGuardando(false)
      return
    }

    if (perfilUsuario?.rol === "vendedor" && contactoActual) {
      const puedeEditar =
        contactoActual.creado_por === perfilUsuario.id ||
        contactoActual.asesor_asignado_id === perfilUsuario.id

      if (!puedeEditar) {
        setError("No tienes permiso para editar este contacto.")
        setGuardando(false)
        return
      }
    }

    const tipoDocumentoFinal =
      form.tipo_documento === "Sin documento" ? null : form.tipo_documento

    const asesorSeleccionado = obtenerAsesorSeleccionado()

    const payloadBase = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim() || null,
      empresa_salon: form.empresa_salon.trim() || null,
      razon_social: form.razon_social.trim() || null,
      nombre_comercial: form.nombre_comercial.trim() || null,
      tipo_documento: tipoDocumentoFinal,
      numero_documento: form.numero_documento.trim() || null,
      tipo_contacto: form.tipo_contacto,
      estado_comercial: form.estado_comercial,
      whatsapp: form.whatsapp.trim() || null,
      whatsapp_usuario: limpiarUsuarioWhatsapp(form.whatsapp_usuario),
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
      instagram: form.instagram.trim() || null,
      ciudad: form.ciudad.trim() || null,
      departamento_provincia: form.departamento_provincia.trim() || null,
      pais: form.pais.trim() || null,
      fuente_contacto: form.fuente_contacto.trim() || null,
      valor_potencial: form.valor_potencial
        ? Number(form.valor_potencial)
        : null,
      proxima_accion: form.proxima_accion.trim() || null,
      fecha_proxima_accion: form.fecha_proxima_accion || null,
      notas_internas: form.notas_internas.trim() || null,
      ultima_interaccion: new Date().toISOString(),
    }

    const payloadAsignacion = puedeAsignarAsesor
      ? {
          asesor_asignado_id: asesorSeleccionado?.id || null,
          asesor_asignado_nombre: asesorSeleccionado?.nombre || null,
          asesor_asignado: asesorSeleccionado?.nombre || "Sin asignar",
        }
      : {}

    const { error } = await supabase
      .from("crm_contactos")
      .update({
        ...payloadBase,
        ...payloadAsignacion,
      })
      .eq("id", contactoId)

    if (error) {
      setError(error.message)
      setGuardando(false)
      return
    }

    await supabase.from("crm_actividades").insert({
      contacto_id: contactoId,
      tipo: "Actualización",
      titulo: "Contacto actualizado",
      descripcion: puedeAsignarAsesor
        ? "Se actualizaron los datos comerciales y la asignación del asesor."
        : "Se actualizaron los datos comerciales del contacto.",
      creado_por: perfilUsuario?.id || null,
      asesor_nombre: perfilUsuario?.nombre || null,
    })

    router.push(`/crm/contactos/${contactoId}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F6F2] p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#E5E2DA] bg-white p-6 text-sm text-[#737563]">
          Cargando contacto...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href={`/crm/contactos/${contactoId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#737563] hover:text-[#1F1F1F]"
          >
            <ArrowLeft size={16} />
            Volver a la ficha
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737563]">
            CRM / EDITAR CONTACTO
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
            Editar contacto
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
            Actualiza la información comercial, identificación, datos de
            contacto, estado del pipeline, asesor responsable y próxima acción.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={guardarCambios}
          className="rounded-3xl border border-[#E5E2DA] bg-white p-6 shadow-sm"
        >
          <div className="mb-6 rounded-2xl border border-[#E5E2DA] bg-[#F7F6F2] p-5">
            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Identificación del contacto
            </h2>

            <p className="mt-1 text-sm text-[#737563]">
              El código interno del contacto se mantiene automático desde
              Supabase. Aquí puedes editar documento, razón social y nombre
              comercial.
            </p>
          </div>

          {puedeAsignarAsesor && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700">
                  <UserCheck size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#1F1F1F]">
                    Asignación comercial
                  </h2>

                  <p className="mt-1 text-sm text-blue-700">
                    Selecciona el asesor responsable. El vendedor asignado podrá
                    ver este contacto en su CRM.
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Asesor asignado
              </label>

              <select
                value={form.asesor_asignado_id}
                onChange={(e) =>
                  actualizarCampo("asesor_asignado_id", e.target.value)
                }
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Sin asignar</option>

                {asesores.map((asesor) => (
                  <option key={asesor.id} value={asesor.id}>
                    {asesor.nombre} · {asesor.rol} · {asesor.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!puedeAsignarAsesor && (
            <div className="mb-6 rounded-2xl border border-[#E5E2DA] bg-[#F7F6F2] p-5">
              <p className="text-sm font-semibold text-[#1F1F1F]">
                Asesor asignado
              </p>

              <p className="mt-1 text-sm text-[#737563]">
                {contactoActual?.asesor_asignado_nombre ||
                  contactoActual?.asesor_asignado ||
                  "Sin asignar"}
              </p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Nombre *
              </label>
              <input
                value={form.nombre}
                onChange={(e) => actualizarCampo("nombre", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Apellido
              </label>
              <input
                value={form.apellido}
                onChange={(e) => actualizarCampo("apellido", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Empresa / Salón
              </label>
              <input
                value={form.empresa_salon}
                onChange={(e) =>
                  actualizarCampo("empresa_salon", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Nombre comercial
              </label>
              <input
                value={form.nombre_comercial}
                onChange={(e) =>
                  actualizarCampo("nombre_comercial", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
                placeholder="Ejemplo: Bella Studio"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Razón social
              </label>
              <input
                value={form.razon_social}
                onChange={(e) =>
                  actualizarCampo("razon_social", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
                placeholder="Ejemplo: Inversiones Bella S.A.C."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Tipo de documento
              </label>
              <select
                value={form.tipo_documento}
                onChange={(e) =>
                  actualizarCampo("tipo_documento", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              >
                {tiposDocumento.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Número de documento
              </label>
              <input
                value={form.numero_documento}
                onChange={(e) =>
                  actualizarCampo("numero_documento", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
                placeholder="RUC / DNI / C.E. / Pasaporte"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Tipo de contacto
              </label>
              <select
                value={form.tipo_contacto}
                onChange={(e) =>
                  actualizarCampo("tipo_contacto", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              >
                {tiposContacto.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Estado comercial
              </label>
              <select
                value={form.estado_comercial}
                onChange={(e) =>
                  actualizarCampo("estado_comercial", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              >
                {estadosComerciales.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Valor potencial
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valor_potencial}
                onChange={(e) =>
                  actualizarCampo("valor_potencial", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                WhatsApp número
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) => actualizarCampo("whatsapp", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
                placeholder="+51 999 999 999"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Usuario WhatsApp
              </label>
              <input
                value={form.whatsapp_usuario}
                onChange={(e) =>
                  actualizarCampo("whatsapp_usuario", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
                placeholder="@usuario"
              />
              <p className="mt-2 text-xs text-[#737563]">
                Úsalo cuando el contacto no tenga número visible, pero sí tenga
                usuario de WhatsApp.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Teléfono
              </label>
              <input
                value={form.telefono}
                onChange={(e) => actualizarCampo("telefono", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => actualizarCampo("email", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Instagram
              </label>
              <input
                value={form.instagram}
                onChange={(e) => actualizarCampo("instagram", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Ciudad
              </label>
              <input
                value={form.ciudad}
                onChange={(e) => actualizarCampo("ciudad", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Departamento / Provincia
              </label>
              <input
                value={form.departamento_provincia}
                onChange={(e) =>
                  actualizarCampo("departamento_provincia", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                País
              </label>
              <input
                value={form.pais}
                onChange={(e) => actualizarCampo("pais", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Fuente del contacto
              </label>
              <input
                value={form.fuente_contacto}
                onChange={(e) =>
                  actualizarCampo("fuente_contacto", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Próxima acción
              </label>
              <input
                value={form.proxima_accion}
                onChange={(e) =>
                  actualizarCampo("proxima_accion", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Fecha próxima acción
              </label>
              <input
                type="date"
                value={form.fecha_proxima_accion}
                onChange={(e) =>
                  actualizarCampo("fecha_proxima_accion", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Notas internas
              </label>
              <textarea
                value={form.notas_internas}
                onChange={(e) =>
                  actualizarCampo("notas_internas", e.target.value)
                }
                rows={5}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/crm/contactos/${contactoId}`}
              className="inline-flex items-center justify-center rounded-xl border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#737563] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}