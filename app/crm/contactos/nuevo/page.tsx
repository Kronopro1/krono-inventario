"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, UserCheck } from "lucide-react"
import { supabase } from "@/src/lib/supabase"

type Rol = "admin" | "operador" | "consulta" | "vendedor"

type Perfil = {
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

const fuentesContacto = [
  "WhatsApp",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Web",
  "Google",
  "Referido",
  "Evento",
  "Salón",
  "Distribuidor",
  "Importado",
  "Otro",
]

export default function NuevoContactoPage() {
  const router = useRouter()

  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [asesores, setAsesores] = useState<AsesorCRM[]>([])

  const [form, setForm] = useState<ContactoForm>({
    nombre: "",
    apellido: "",
    empresa_salon: "",
    razon_social: "",
    nombre_comercial: "",
    tipo_documento: "Sin documento",
    numero_documento: "",
    tipo_contacto: "Prospecto",
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
    fuente_contacto: "WhatsApp",
    valor_potencial: "",
    proxima_accion: "",
    fecha_proxima_accion: "",
    notas_internas: "",
  })

  useEffect(() => {
    async function cargarPerfilYAsesores() {
      setCargandoDatos(true)
      setMensaje("")

      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session

      if (!session?.user?.email) {
        setMensaje("No se encontró una sesión activa.")
        setCargandoDatos(false)
        return
      }

      const { data: perfilData, error: perfilError } = await supabase
        .from("perfiles")
        .select("id, nombre, email, rol, activo")
        .eq("email", session.user.email)
        .single()

      if (perfilError || !perfilData) {
        setMensaje("No se pudo cargar el perfil del usuario.")
        setCargandoDatos(false)
        return
      }

      const perfilUsuario = perfilData as Perfil
      setPerfil(perfilUsuario)

      if (perfilUsuario.rol === "vendedor") {
        setForm((prev) => ({
          ...prev,
          asesor_asignado_id: session.user.id,
        }))
      }

      const { data: asesoresData, error: asesoresError } = await supabase
        .from("perfiles")
        .select("id, nombre, email, rol, activo")
        .eq("activo", true)
        .in("rol", ["admin", "operador", "vendedor"])
        .order("nombre", { ascending: true })

      if (asesoresError) {
        setMensaje(asesoresError.message)
        setCargandoDatos(false)
        return
      }

      setAsesores((asesoresData || []) as AsesorCRM[])
      setCargandoDatos(false)
    }

    cargarPerfilYAsesores()
  }, [])

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

  const puedeAsignarAsesor =
    perfil?.rol === "admin" || perfil?.rol === "operador"

  const obtenerAsesorSeleccionado = () => {
    if (!form.asesor_asignado_id) return null

    return asesores.find((asesor) => asesor.id === form.asesor_asignado_id) || null
  }

  const guardarContacto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMensaje("")
    setGuardando(true)

    if (!form.nombre.trim()) {
      setMensaje("El nombre es obligatorio.")
      setGuardando(false)
      return
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session

      if (!session?.user?.email) {
        setMensaje("No se encontró una sesión activa.")
        setGuardando(false)
        return
      }

      const { data: perfilData, error: perfilError } = await supabase
        .from("perfiles")
        .select("id, nombre, email, rol, activo")
        .eq("email", session.user.email)
        .single()

      if (perfilError || !perfilData) {
        setMensaje("No se pudo cargar el perfil del usuario.")
        setGuardando(false)
        return
      }

      const perfilUsuario = perfilData as Perfil
      const asesorSeleccionado = obtenerAsesorSeleccionado()

      const asesorAsignadoId =
        perfilUsuario.rol === "vendedor"
          ? session.user.id
          : puedeAsignarAsesor
            ? asesorSeleccionado?.id || null
            : null

      const asesorAsignadoNombre =
        perfilUsuario.rol === "vendedor"
          ? perfilUsuario.nombre
          : puedeAsignarAsesor
            ? asesorSeleccionado?.nombre || null
            : null

      const asesorAsignadoTexto =
        asesorAsignadoNombre || "Sin asignar"

      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim() || null,
        empresa_salon: form.empresa_salon.trim() || null,

        razon_social: form.razon_social.trim() || null,
        nombre_comercial: form.nombre_comercial.trim() || null,
        tipo_documento:
          form.tipo_documento === "Sin documento" ? null : form.tipo_documento,
        numero_documento: form.numero_documento.trim() || null,

        tipo_contacto: form.tipo_contacto,
        estado_comercial: form.estado_comercial,

        asesor_asignado: asesorAsignadoTexto,
        asesor_asignado_nombre: asesorAsignadoNombre,
        asesor_asignado_id: asesorAsignadoId,

        creado_por: session.user.id,
        ultimo_contacto_por: null,

        whatsapp: form.whatsapp.trim() || null,
        whatsapp_usuario: limpiarUsuarioWhatsapp(form.whatsapp_usuario),
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        instagram: form.instagram.trim() || null,
        ciudad: form.ciudad.trim() || null,
        departamento_provincia: form.departamento_provincia.trim() || null,
        pais: form.pais.trim() || "Perú",
        fuente_contacto: form.fuente_contacto || null,
        valor_potencial: form.valor_potencial
          ? Number(form.valor_potencial)
          : 0,
        proxima_accion: form.proxima_accion.trim() || null,
        fecha_proxima_accion: form.fecha_proxima_accion
          ? new Date(form.fecha_proxima_accion).toISOString()
          : null,
        notas_internas: form.notas_internas.trim() || null,
        activo: true,
      }

      const { data: contactoCreado, error } = await supabase
        .from("crm_contactos")
        .insert(payload)
        .select("id")
        .single()

      if (error) {
        throw error
      }

      if (contactoCreado?.id) {
        await supabase.from("crm_actividades").insert({
          contacto_id: contactoCreado.id,
          tipo: "Creación",
          titulo: "Contacto creado",
          descripcion:
            asesorAsignadoId && asesorAsignadoNombre
              ? `Contacto creado y asignado a ${asesorAsignadoNombre}.`
              : "Contacto creado sin asesor asignado.",
          creado_por: session.user.id,
          asesor_nombre: perfilUsuario.nombre,
        })
      }

      router.push("/crm/contactos")
      router.refresh()
    } catch (error: any) {
      setMensaje(error.message || "No se pudo guardar el contacto.")
    } finally {
      setGuardando(false)
    }
  }

  if (cargandoDatos) {
    return (
      <main className="min-h-screen bg-[#F7F6F2] p-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#E5E2DA] bg-white p-6 text-sm text-[#737563]">
          Cargando formulario...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/crm/contactos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#737563] hover:text-[#1F1F1F]"
          >
            <ArrowLeft size={16} />
            Volver a contactos
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#737563]">
            CRM / NUEVO CONTACTO
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
            Registrar contacto
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
            Agrega prospectos, salones, estilistas, distribuidores, tiendas o
            clientes finales al CRM comercial de KRONO PRO.
          </p>
        </div>

        <form
          onSubmit={guardarContacto}
          className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm"
        >
          <div className="mb-6 rounded-2xl border border-[#E5E2DA] bg-[#F7F6F2] p-5">
            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Identificación del contacto
            </h2>

            <p className="mt-1 text-sm text-[#737563]">
              El código interno del contacto se genera automáticamente al guardar.
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
                    Selecciona el asesor responsable. El vendedor asignado verá
                    este contacto en su CRM.
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
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
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

          {!puedeAsignarAsesor && perfil?.rol === "vendedor" && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-[#1F1F1F]">
                Asesor asignado
              </p>

              <p className="mt-1 text-sm text-blue-700">
                Este contacto quedará asignado automáticamente a {perfil.nombre}.
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Ejemplo: Kenny"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Apellido
              </label>
              <input
                value={form.apellido}
                onChange={(e) => actualizarCampo("apellido", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Ejemplo: Solorzano"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Ejemplo: Salón Bella Vida"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                Fuente del contacto
              </label>
              <select
                value={form.fuente_contacto}
                onChange={(e) =>
                  actualizarCampo("fuente_contacto", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
              >
                {fuentesContacto.map((fuente) => (
                  <option key={fuente} value={fuente}>
                    {fuente}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                WhatsApp número
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) => actualizarCampo("whatsapp", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Teléfono alternativo"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="cliente@email.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Instagram
              </label>
              <input
                value={form.instagram}
                onChange={(e) => actualizarCampo("instagram", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="@saloncliente"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Ciudad
              </label>
              <input
                value={form.ciudad}
                onChange={(e) => actualizarCampo("ciudad", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Lima"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Lima / BC / Provincia"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                País
              </label>
              <input
                value={form.pais}
                onChange={(e) => actualizarCampo("pais", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Perú"
              />
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="850"
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
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Enviar presentación / llamar / hacer seguimiento"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                Fecha próxima acción
              </label>
              <input
                type="datetime-local"
                value={form.fecha_proxima_accion}
                onChange={(e) =>
                  actualizarCampo("fecha_proxima_accion", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
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
                rows={4}
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
                placeholder="Notas comerciales, contexto del contacto, interés, objeciones o detalles relevantes."
              />
            </div>
          </div>

          {mensaje && (
            <div className="mt-5 rounded-xl border border-[#A35C68]/30 bg-[#A35C68]/10 px-4 py-3 text-sm text-[#A35C68]">
              {mensaje}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-[#E5E2DA] pt-6 md:flex-row md:items-center md:justify-end">
            <Link
              href="/crm/contactos"
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
              {guardando ? "Guardando..." : "Guardar contacto"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}