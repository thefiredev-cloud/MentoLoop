'use client'

import { ReactNode } from 'react'

interface BillingHeaderProps {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function BillingHeader({ title, subtitle, actions }: BillingHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

