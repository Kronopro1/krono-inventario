import { ReactNode } from "react"

type StatCardProps = {
  label: string
  value: ReactNode
  helper?: string
  icon?: ReactNode
  tone?: "default" | "success" | "warning" | "danger"
}

const toneClasses = {
  default: {
    icon: "bg-slate-100 text-slate-700",
    value: "text-slate-950",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-700",
    value: "text-emerald-700",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700",
    value: "text-amber-700",
  },
  danger: {
    icon: "bg-red-50 text-red-700",
    value: "text-red-700",
  },
}

export default function StatCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
}: StatCardProps) {
  const classes = toneClasses[tone]

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <div className={`mt-3 text-3xl font-bold ${classes.value}`}>
            {value}
          </div>

          {helper && (
            <p className="mt-2 text-sm text-slate-400">{helper}</p>
          )}
        </div>

        {icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${classes.icon}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}