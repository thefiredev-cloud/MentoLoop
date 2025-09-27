'use client'

interface HoursKpiCardProps {
  label: string
  value: string
  tone?: 'neutral' | 'positive' | 'caution' | 'danger'
}

const toneClasses: Record<NonNullable<HoursKpiCardProps['tone']>, string> = {
  neutral: 'text-foreground',
  positive: 'text-success',
  caution: 'text-warning',
  danger: 'text-destructive',
}

export function HoursKpiCard({ label, value, tone = 'neutral' }: HoursKpiCardProps) {
  return (
    <div className="flex-1 min-w-[160px]">
      <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-lg shadow-primary/10 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>{label}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" aria-hidden />
        </div>
        <div className={`text-3xl font-semibold leading-tight ${toneClasses[tone]}`}>{value}</div>
      </div>
    </div>
  )
}

