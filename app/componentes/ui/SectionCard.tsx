import { ReactNode } from "react"

type SectionCardProps = {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
}

export default function SectionCard({
  title,
  description,
  children,
  actions,
}: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            {title}
          </h2>

          {description && (
            <p className="text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>

        {actions}
      </div>

      {children}
    </section>
  )
}