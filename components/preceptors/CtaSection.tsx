'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { ReactNode } from 'react'

export interface CtaSectionProps {
  readonly heading: string
  readonly description: string
  readonly primaryCta: {
    readonly href: string
    readonly label: string
  }
  readonly secondaryAction?: ReactNode
  readonly subcopy?: string
}

export default function CtaSection({ heading, description, primaryCta, secondaryAction, subcopy }: CtaSectionProps) {
  return (
    <section className="bg-gradient-to-b from-background to-primary/15 py-16 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{heading}</h2>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="bg-accent px-7 py-5 text-base font-semibold text-accent-foreground shadow-md transition-transform duration-200 hover:translate-y-[-2px] hover:bg-accent/90"
          >
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>

          {secondaryAction}
        </div>

        {subcopy ? <p className="mt-6 text-xs text-muted-foreground md:text-sm">{subcopy}</p> : null}
      </div>
    </section>
  )
}

