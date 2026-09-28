"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { supabase } from "@/src/lib/supabase"

export default function NuevoContactoPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    empresa_salon: "",
    tipo_contacto: "Prospecto",
    estado_comercial: "Nuevo Lead",
    whatsapp: "",
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

  const actualizarCampo = (
    campo: keyof typeof form,
    valor: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const guardarContacto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMensaje("")
    setLoading(true)

    if (!form.nombre.trim()) {
      setMensaje("El nombre es obligatorio.")
      setLoading(false)
      return
    }

    try {
      const payload = {
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

      const { error } = await supabase
        .from("crm_contactos")
        .insert(payload)

      if (error) {
        throw error
      }

      router.push("/crm/contactos")
      router.refresh()
    } catch (error: any) {
      setMensaje(error.message || "No se pudo guardar el contacto.")
    } finally {
      setLoading(false)
    }
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
                Tipo de contacto
              </label>
              <select
                value={form.tipo_contacto}
                onChange={(e) =>
                  actualizarCampo("tipo_contacto", e.target.value)
                }
                className="w-full rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#737563] focus:ring-2 focus:ring-[#737563]/10"
              >
                <option>Prospecto</option>
                <option>Salón</option>
                <option>Salón Embajador</option>
                <option>Estilista</option>
                <option>Distribuidor</option>
                <option>Tienda</option>
                <option>Cliente final</option>
                <option>Lead perdido</option>
                <option>Inactivo</option>
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
                <option>Nuevo Lead</option>
                <option>Primer Contacto</option>
                <option>Respondió</option>
                <option>Lead Calificado</option>
                <option>Presentación de Marca</option>
                <option>Interesado</option>
                <option>Kit / Muestra Ofrecida</option>
                <option>Kit / Muestra Enviada</option>
                <option>Seguimiento de Prueba</option>
                <option>Cotización Enviada</option>
                <option>Negociación</option>
                <option>Primera Compra</option>
                <option>Cliente Activo</option>
                <option>Recompra</option>
                <option>Salón Embajador</option>
                <option>Distribuidor Potencial</option>
                <option>No Interesado</option>
                <option>Perdido</option>
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
                <option>WhatsApp</option>
                <option>Instagram</option>
                <option>TikTok</option>
                <option>LinkedIn</option>
                <option>Web</option>
                <option>Google</option>
                <option>Referido</option>
                <option>Evento</option>
                <option>Salón</option>
                <option>Distribuidor</option>
                <option>Importado</option>
                <option>Otro</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                WhatsApp
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
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#737563] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {loading ? "Guardando..." : "Guardar contacto"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}