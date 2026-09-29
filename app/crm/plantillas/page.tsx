"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Copy,
  MessageCircle,
  Sparkles,
  Send,
  Handshake,
  PackageCheck,
  BadgePercent,
  UserX,
  Building2,
  MessageSquareText,
  CheckCircle2,
  HelpCircle,
  Clock,
  Flame,
  Filter,
} from "lucide-react"

type Etapa =
  | "Apertura"
  | "Calificación"
  | "Necesidad"
  | "Beneficios"
  | "Prueba"
  | "Cierre"
  | "Seguimiento"
  | "Objeciones"

type Plantilla = {
  id: string
  titulo: string
  etapa: Etapa
  descripcion: string
  objetivo: string
  mensaje: string
  icono: React.ReactNode
}

const etapas: Etapa[] = [
  "Apertura",
  "Calificación",
  "Necesidad",
  "Beneficios",
  "Prueba",
  "Cierre",
  "Seguimiento",
  "Objeciones",
]

const plantillas: Plantilla[] = [
  {
    id: "01-primer-contacto-sin-marca",
    titulo: "01 · Primer contacto sin nombrar la marca",
    etapa: "Apertura",
    descripcion:
      "Mensaje inicial para abrir conversación sin sonar vendedor ni enviar demasiada información.",
    objetivo:
      "Abrir conversación, despertar curiosidad y evitar hablar de precio, catálogo o descuento desde el inicio.",
    icono: <Send size={20} />,
    mensaje:
      "Hola 👋\n\nEstamos seleccionando un grupo reducido de salones para una nueva línea profesional de reparación capilar que llega desde Vancouver, Canadá.\n\nNo buscamos venta masiva. Queremos trabajar con salones que puedan convertirse en aliados pioneros en esta primera etapa.\n\n¿Te gustaría conocer cómo funciona el programa?",
  },
  {
    id: "02-si-responde-si-cuentame",
    titulo: "02 · Si responde “sí / cuéntame”",
    etapa: "Calificación",
    descripcion:
      "Respuesta para mantener percepción de selección y calificar afinidad del salón.",
    objetivo:
      "Validar si el salón trabaja con servicios compatibles antes de revelar demasiada información.",
    icono: <MessageSquareText size={20} />,
    mensaje:
      "Perfecto 🙌\n\nLa idea es formar un primer grupo de salones aliados: profesionales que puedan conocer la línea desde su etapa inicial y acceder a condiciones preferenciales, capacitación y futuras oportunidades de colaboración.\n\nAntes de enviarte la información completa, para entender mejor tu perfil:\n\n¿Trabajan principalmente con color, decoloración o reparación capilar?",
  },
  {
    id: "03-conectar-necesidad",
    titulo: "03 · Conectar con su necesidad",
    etapa: "Necesidad",
    descripcion:
      "Para conectar la conversación con cabello tratado, color, decoloración o procesos químicos.",
    objetivo:
      "Mover de simple curiosidad a intención real de prueba profesional.",
    icono: <Building2 size={20} />,
    mensaje:
      "Entonces hay bastante afinidad con lo que estamos desarrollando.\n\nLa línea está enfocada en cabello tratado y exigente, especialmente después de coloraciones, decoloraciones, calor y procesos químicos.\n\nLa idea no es que cambies de inmediato lo que ya usas, sino que puedas conocer la rutina, probarla y evaluar el resultado desde tu experiencia profesional.\n\n¿Te gustaría conocer el kit profesional y las condiciones del programa?",
  },
  {
    id: "04-presentar-beneficios",
    titulo: "04 · Presentar beneficios",
    etapa: "Beneficios",
    descripcion:
      "Para mostrar valor sin sonar a descuento agresivo ni venta tradicional.",
    objetivo:
      "Hacer tangible el programa y mantener el posicionamiento profesional de la marca.",
    icono: <Handshake size={20} />,
    mensaje:
      "Como parte del grupo inicial de salones aliados, podrías acceder a:\n\n• Condiciones profesionales preferenciales\n• Beneficios especiales de lanzamiento\n• Capacitación y material técnico\n• Acceso anticipado a nuevos productos\n• Material de apoyo para el salón\n• Oportunidades de colaboración con la marca\n\nLa idea es crecer junto a los primeros salones que realmente conecten con la propuesta.",
  },
  {
    id: "05-invitacion-prueba",
    titulo: "05 · Invitación a prueba",
    etapa: "Prueba",
    descripcion:
      "Para reducir resistencia y presentar el kit como una primera acción simple.",
    objetivo:
      "Bajar la presión de compra y llevar al contacto hacia una prueba profesional.",
    icono: <PackageCheck size={20} />,
    mensaje:
      "No buscamos que cambies de inmediato la marca con la que ya trabajas.\n\nLo que buscamos es que pruebes la rutina, evalúes el resultado en tu salón y decidas desde tu experiencia profesional.\n\nSi te parece, te puedo enviar las opciones del kit de introducción para esta primera etapa.",
  },
  {
    id: "06-despues-kit-precio",
    titulo: "06 · Después de enviar kit / precio",
    etapa: "Prueba",
    descripcion:
      "Para mantener la conversación después de enviar información comercial.",
    objetivo:
      "Evitar que la conversación muera después de enviar precio y obtener información útil para el cierre.",
    icono: <BadgePercent size={20} />,
    mensaje:
      "Ese es el kit profesional de introducción.\n\nEstá pensado para que puedas conocer la rutina completa y evaluar cómo responde en cabello tratado.\n\nDe los resultados que más buscas en salón, ¿qué valoras más?\n\n• Fortaleza\n• Suavidad\n• Brillo\n• Manejo de porosidad\n\nSegún eso puedo orientarte mejor sobre cómo presentarlo dentro del servicio.",
  },
  {
    id: "07-cierre-suave",
    titulo: "07 · Cierre suave",
    etapa: "Cierre",
    descripcion:
      "Para pedir una acción concreta sin sonar desesperado ni insistente.",
    objetivo:
      "Llevar al contacto a reservar condiciones o coordinar kit sin presión.",
    icono: <CheckCircle2 size={20} />,
    mensaje:
      "Perfecto.\n\nSi te parece, puedo reservarte el acceso a las condiciones de esta primera etapa como salón aliado y coordinamos tu kit de introducción.\n\n¿Te gustaría avanzar con eso?",
  },
  {
    id: "f1-dos-cuatro-dias",
    titulo: "F1 · 2–4 días sin respuesta",
    etapa: "Seguimiento",
    descripcion:
      "Seguimiento breve para reactivar interés sin preguntar si vio el mensaje.",
    objetivo:
      "Aportar contexto, no perseguir. Mantener una posición profesional.",
    icono: <Clock size={20} />,
    mensaje:
      "Hola 👋\n\nTe dejo algo que quizá te resulte interesante.\n\nLa línea nace pensando en el cabello que hoy recibe más exigencia: color, decoloración, calor y procesos químicos.\n\nSi te interesa conocer la rutina profesional y cómo estamos trabajando con los primeros salones aliados, con gusto te explico el programa.",
  },
  {
    id: "f2-siete-diez-dias",
    titulo: "F2 · 7–10 días sin respuesta",
    etapa: "Seguimiento",
    descripcion:
      "Último contacto respetuoso antes de pausar el seguimiento.",
    objetivo:
      "Cerrar el ciclo sin presión y dejar abierta la puerta para más adelante.",
    icono: <UserX size={20} />,
    mensaje:
      "Hola nuevamente 👋\n\nEstamos cerrando esta primera etapa de incorporación de salones aliados y recordé nuestra conversación.\n\nSi todavía te interesa conocer la línea, puedo enviarte las condiciones profesionales de introducción.\n\nSi ahora no es el momento, ningún problema 😊",
  },
  {
    id: "objecion-precio",
    titulo: "Objeción · ¿Cuál es el precio?",
    etapa: "Objeciones",
    descripcion:
      "Para responder precio sin abrir con descuento ni parecer catálogo masivo.",
    objetivo:
      "Hablar de condiciones profesionales y acceso, no de rebaja.",
    icono: <HelpCircle size={20} />,
    mensaje:
      "Claro.\n\nTenemos un programa de condiciones preferenciales para salones aliados, diferente al precio regular.\n\nLa idea es beneficiar especialmente a quienes entren en esta primera etapa.\n\nTe puedo enviar las opciones profesionales disponibles, pero antes dime: ¿lo usarías principalmente para servicio en salón, reventa o ambos?",
  },
  {
    id: "objecion-otra-marca",
    titulo: "Objeción · Ya trabajo con otra marca",
    etapa: "Objeciones",
    descripcion:
      "Para eliminar la sensación de cambio obligatorio.",
    objetivo:
      "Posicionar la prueba como complemento, no como reemplazo inmediato.",
    icono: <HelpCircle size={20} />,
    mensaje:
      "Perfecto, y no buscamos que la reemplaces de inmediato.\n\nLa idea es que puedas probar la rutina junto a lo que ya trabajas y evaluar tú mismo el resultado.\n\nSi ves que encaja con tu salón y tus clientas, conversamos sobre cómo incorporarla de manera natural.",
  },
  {
    id: "objecion-catalogo",
    titulo: "Objeción · Mándame catálogo",
    etapa: "Objeciones",
    descripcion:
      "Para no saturar con información y personalizar antes de enviar material.",
    objetivo:
      "Entender el perfil del salón antes de mandar información genérica.",
    icono: <HelpCircle size={20} />,
    mensaje:
      "Claro, te envío una presentación breve de la línea y del programa para salones.\n\nPara enviarte la información correcta:\n\n¿Trabajas más con color/decoloración o con tratamientos de reparación capilar?",
  },
  {
    id: "objecion-dejame-pensarlo",
    titulo: "Objeción · Déjame pensarlo",
    etapa: "Objeciones",
    descripcion:
      "Para conservar exclusividad sin generar presión falsa.",
    objetivo:
      "Dejar espacio, pero mantener el valor de la primera etapa.",
    icono: <HelpCircle size={20} />,
    mensaje:
      "Por supuesto.\n\nPrefiero que lo evalúes con calma.\n\nTe dejo la información del programa y cuando estés listo retomamos.\n\nSolo ten en cuenta que las condiciones de esta primera etapa están orientadas a los primeros salones aliados.",
  },
  {
    id: "objecion-quiero-probarlo",
    titulo: "Objeción · Quiero probarlo",
    etapa: "Objeciones",
    descripcion:
      "Para mover rápidamente a kit, logística o siguiente acción.",
    objetivo:
      "Aprovechar la intención y no dejar enfriar el interés.",
    icono: <Flame size={20} />,
    mensaje:
      "Excelente 🙌\n\nEse es exactamente el objetivo del programa: que puedas probar la rutina y evaluar el resultado desde tu experiencia profesional.\n\nTe envío las opciones del kit de introducción y coordinamos la mejor forma de probarlo en salón.",
  },
  {
    id: "objecion-diferente",
    titulo: "Objeción · ¿Qué tiene de diferente?",
    etapa: "Objeciones",
    descripcion:
      "Para explicar diferenciación sin discurso técnico excesivo.",
    objetivo:
      "Resumir la propuesta en ideas claras: tecnología, origen y resultado.",
    icono: <Sparkles size={20} />,
    mensaje:
      "La propuesta combina tecnología desarrollada en Canadá con bioactivos de origen peruano, enfocada en cabello tratado y exigente.\n\nLa rutina busca trabajar fortaleza, elasticidad, suavidad, brillo y manejo de porosidad de una forma profesional y sencilla para el salón.",
  },
  {
    id: "objecion-no-conozco",
    titulo: "Objeción · No conozco la marca",
    etapa: "Objeciones",
    descripcion:
      "Para convertir poca notoriedad en ventaja de pionero.",
    objetivo:
      "Reforzar etapa inicial, acceso temprano y oportunidad de aliado.",
    icono: <HelpCircle size={20} />,
    mensaje:
      "Es totalmente normal.\n\nEstamos justamente en la etapa inicial de expansión.\n\nPor eso estamos priorizando salones que quieran conocer la línea desde el comienzo, probarla y tener acceso temprano a los beneficios del programa profesional.",
  },
  {
    id: "objecion-no-presupuesto",
    titulo: "Objeción · No tengo presupuesto ahora",
    etapa: "Objeciones",
    descripcion:
      "Para no presionar y conservar el lead para más adelante.",
    objetivo:
      "Mantener relación y dejar abierta una futura oportunidad.",
    icono: <HelpCircle size={20} />,
    mensaje:
      "Entiendo, no hay problema.\n\nPuedo dejarte registrado para compartirte próximas oportunidades de prueba o incorporación cuando sea un mejor momento para tu salón.\n\nLa idea es que la marca encaje con tu operación, no forzar una decisión fuera de tiempo.",
  },
  {
    id: "objecion-reventa-uso",
    titulo: "Objeción · ¿Es para reventa o uso profesional?",
    etapa: "Objeciones",
    descripcion:
      "Para abrir ambas vías sin forzar una sola forma de compra.",
    objetivo:
      "Mostrar flexibilidad comercial y posibilidad de doble ingreso para el salón.",
    icono: <HelpCircle size={20} />,
    mensaje:
      "Puede funcionar en ambos escenarios.\n\nLa prioridad del programa es que el salón conozca la rutina, la utilice profesionalmente y, si encaja con su negocio, pueda acceder también a condiciones para recomendación y reventa.",
  },
  {
    id: "objecion-capacitacion",
    titulo: "Objeción · ¿Tienen capacitación?",
    etapa: "Objeciones",
    descripcion:
      "Para reforzar valor más allá del precio.",
    objetivo:
      "Mostrar acompañamiento, educación y soporte profesional.",
    icono: <HelpCircle size={20} />,
    mensaje:
      "Sí.\n\nUno de los beneficios para los salones aliados es el acceso a capacitación y material técnico para comprender mejor la rutina, sus activos y la forma de integrarla al servicio del salón.",
  },
]

export default function PlantillasWhatsAppPage() {
  const [copiadoId, setCopiadoId] = useState<string | null>(null)
  const [etapaActiva, setEtapaActiva] = useState<Etapa | "Todas">("Todas")

  const plantillasFiltradas = useMemo(() => {
    if (etapaActiva === "Todas") return plantillas

    return plantillas.filter((plantilla) => plantilla.etapa === etapaActiva)
  }, [etapaActiva])

  const copiarMensaje = async (plantilla: Plantilla) => {
    await navigator.clipboard.writeText(plantilla.mensaje)
    setCopiadoId(plantilla.id)

    setTimeout(() => {
      setCopiadoId(null)
    }, 2000)
  }

  const abrirWhatsApp = (mensaje: string) => {
    const texto = encodeURIComponent(mensaje)
    window.open(`https://wa.me/?text=${texto}`, "_blank")
  }

  const totalObjeciones = plantillas.filter(
    (plantilla) => plantilla.etapa === "Objeciones"
  ).length

  const totalFlujo = plantillas.length - totalObjeciones

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
              CRM / PLANTILLAS
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#1F1F1F]">
              Plantillas de WhatsApp
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#4A4A4A]">
              Flujo comercial moderno para abrir conversación, calificar,
              presentar valor, invitar a prueba, cerrar suavemente y manejar
              objeciones sin sonar vendedor tradicional.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E2DA] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
                <Sparkles size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#1F1F1F]">
                  {plantillas.length} plantillas
                </p>
                <p className="text-xs text-[#737563]">
                  {totalFlujo} de flujo · {totalObjeciones} objeciones
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
              <Filter size={20} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1F1F1F]">
                Etapas del flujo comercial
              </h2>

              <p className="mt-1 text-sm text-[#737563]">
                Usa las plantillas según el momento de la conversación. El
                primer contacto no revela el nombre de la marca de inmediato:
                primero abre curiosidad y valida interés.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEtapaActiva("Todas")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                etapaActiva === "Todas"
                  ? "bg-[#737563] text-white"
                  : "bg-[#F7F6F2] text-[#737563] hover:bg-[#E5E2DA]"
              }`}
            >
              Todas
            </button>

            {etapas.map((etapa) => (
              <button
                key={etapa}
                type="button"
                onClick={() => setEtapaActiva(etapa)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  etapaActiva === etapa
                    ? "bg-[#737563] text-white"
                    : "bg-[#F7F6F2] text-[#737563] hover:bg-[#E5E2DA]"
                }`}
              >
                {etapa}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm">
          <div className="mb-3">
            <h2 className="text-xl font-semibold text-[#1F1F1F]">
              Regla del tono
            </h2>

            <p className="mt-1 text-sm text-[#737563]">
              No perseguimos clientes. Seleccionamos aliados.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-[#F7F6F2] p-4 text-sm text-[#4A4A4A]">
              <span className="font-semibold text-[#1F1F1F]">Evitar:</span>{" "}
              “Promoción”, “aprovecha”, “te vendo”, “catálogo de una vez”.
            </div>

            <div className="rounded-xl bg-[#F7F6F2] p-4 text-sm text-[#4A4A4A]">
              <span className="font-semibold text-[#1F1F1F]">Usar:</span>{" "}
              “Estamos seleccionando”, “grupo reducido”, “salones aliados”.
            </div>

            <div className="rounded-xl bg-[#F7F6F2] p-4 text-sm text-[#4A4A4A]">
              <span className="font-semibold text-[#1F1F1F]">Tono:</span>{" "}
              seguro, profesional, breve, exclusivo y sin presión.
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {plantillasFiltradas.map((plantilla) => (
            <div
              key={plantilla.id}
              className="rounded-2xl border border-[#E5E2DA] bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F6F2] text-[#737563]">
                  {plantilla.icono}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#1F1F1F]">
                      {plantilla.titulo}
                    </h2>

                    <span className="rounded-full bg-[#F7F6F2] px-3 py-1 text-xs font-semibold text-[#737563]">
                      {plantilla.etapa}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-[#737563]">
                    {plantilla.descripcion}
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-[#E5E2DA] bg-[#F7F6F2] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#737563]">
                  Objetivo
                </p>

                <p className="text-sm text-[#4A4A4A]">{plantilla.objetivo}</p>
              </div>

              <div className="mb-4 whitespace-pre-line rounded-xl bg-[#F7F6F2] p-4 text-sm leading-6 text-[#4A4A4A]">
                {plantilla.mensaje}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => copiarMensaje(plantilla)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm font-semibold text-[#737563] transition hover:border-[#737563] hover:text-[#1F1F1F]"
                >
                  <Copy size={17} />
                  {copiadoId === plantilla.id ? "Copiado" : "Copiar"}
                </button>

                <button
                  type="button"
                  onClick={() => abrirWhatsApp(plantilla.mensaje)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <MessageCircle size={17} />
                  Abrir WhatsApp
                </button>
              </div>
            </div>
          ))}

          {plantillasFiltradas.length === 0 && (
            <div className="rounded-2xl border border-[#E5E2DA] bg-white p-6 text-sm text-[#737563] shadow-sm">
              No hay plantillas en esta etapa.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}