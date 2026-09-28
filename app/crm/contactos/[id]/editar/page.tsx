"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { supabase } from "@/src/lib/supabase"

type ContactoForm = {
  nombre: string
  apellido: string
  empresa_salon: string
  tipo_contacto: string
  estado_comercial: string
  whatsapp: string
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
  "Salón",
  "Estilista",
  "Distribuidor",
  "Cliente final",
  "Influencer",
  "Proveedor",
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

export default function EditarContactoPage() {
  const params = useParams()
  const router = useRouter()

  const contactoId = params.id as string

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState<ContactoForm>({
    nombre: "",
    apellido: "",
    empresa_salon: "",
    tipo_contacto: "Salón",
    estado_comercial: "Nuevo Lead",
    whatsapp: "",
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
    async function cargarContacto() {
      setLoading(true)
      setError("")

      const { data, error } = await supabase
        .from("crm_contactos")
        .select("*")
        .eq("id", contactoId)
        .single()

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setForm({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        empresa_salon: data.empresa_salon || "",
        tipo_contacto: data.tipo_contacto || "Salón",
        estado_comercial: data.estado_comercial || "Nuevo Lead",
        whatsapp: data.whatsapp || "",
        telefono: data.telefono || "",
        email: data.email || "",
        instagram: data.instagram || "",
        ciudad: data.ciudad || "",
        departamento_provincia: data.departamento_provincia || "",
        pais: data.pais || "Perú",
        fuente_contacto: data.fuente_contacto || "",
        valor_potencial:
          data.valor_potencial !== null && data.valor_potencial !== undefined
            ? String(data.valor_potencial)
            : "",
        proxima_accion: data.proxima_accion || "",
        fecha_proxima_accion: data.fecha_proxima_accion || "",
        notas_internas: data.notas_internas || "",
      })

      setLoading(false)
    }

    if (contactoId) {
      cargarContacto()
    }
  }, [contactoId])

  const actualizarCampo = (campo: keyof ContactoForm, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError("")

    if (!form.nombre.trim()) {
      setError("El nombre del contacto es obligatorio.")
      setGuardando(false)
      return
    }

    const { error } = await supabase
      .from("crm_contactos")
      .update({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim() || null,
        empresa_salon: form.empresa_salon.trim() || null,
        tipo_contacto: form.tipo_contacto,
        estado_comercial: form.estado_comercial,
        whatsapp: form.whatsapp.trim() || null,
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        instagram: form.instagram.trim() || null,
        ciudad: form.ciudad.trim() || null,
        departamento_provincia:
          form.departamento_provincia.trim() || null,
        pais: form.pais.trim() || null,
        fuente_contacto: form.fuente_contacto.trim() || null,
        valor_potencial: form.valor_potencial
          ? Number(form.valor_potencial)
          : null,
        proxima_accion: form.proxima_accion.trim() || null,
        fecha_proxima_accion: form.fecha_proxima_accion || null,
        notas_internas: form.notas_internas.trim() || null,
        ultima_interaccion: new Date().toISOString(),
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
      descripcion: "Se actualizaron los datos comerciales del contacto.",
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
            Actualiza la información comercial, datos de contacto, estado del
            pipeline y próxima acción.
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
                WhatsApp
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) => actualizarCampo("whatsapp", e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] px-4 py-3 text-sm outline-none focus:border-[#737563] focus:bg-white"
              />
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