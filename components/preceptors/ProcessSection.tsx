'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { PreceptorProcessStep } from './types'
import { ChevronRight } from 'lucide-react'

export interface ProcessSectionProps {
  readonly heading: string
  readonly steps: readonly PreceptorProcessStep[]
  readonly cta: {
    readonly href: string
    readonly label: string
  }
}

export default function ProcessSection({ heading, steps, cta }: ProcessSectionProps) {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {heading}
        </h2>

        <div className="mt-10 space-y-6">
          {steps.map((step) => (
            <ProcessStep key={step.order} step={step} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="bg-accent px-7 py-5 text-base font-semibold text-accent-foreground shadow-md transition-transform duration-200 hover:translate-y-[-2px] hover:bg-accent/90"
          >
            <Link href={cta.href}>
              {cta.label}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

interface ProcessStepProps {
  readonly step: PreceptorProcessStep
}

function ProcessStep({ step }: ProcessStepProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-accent-foreground">
        {step.order}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">{step.detail}</p>
      </div>
    </div>
  )
}

