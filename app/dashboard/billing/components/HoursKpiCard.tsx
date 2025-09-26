'use client'

interface HoursKpiCardProps {
  label: string
  value: string
  tone?: 'default' | 'good' | 'warn' | 'bad'
}

const toneClasses: Record<NonNullable<HoursKpiCardProps['tone']>, string> = {
  default: '',
  good: 'text-emerald-400',
  warn: 'text-amber-400',
  bad: 'text-rose-400',
}

export function HoursKpiCard({ label, value, tone = 'default' }: HoursKpiCardProps) {
  return (
    <div className="flex-1 min-w-[160px] rounded-xl border border-[#1d2a46] bg-[#0f2038] p-4 shadow-lg">
      <div className="text-xs uppercase tracking-widest text-[#a6b3cc] mb-2">{label}</div>
      <div className={`text-2xl font-semibold ${toneClasses[tone]}`}>{value}</div>
    </div>
  )
}

