'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import type { PreceptorRequirement } from './types'

export interface RequirementsSectionProps {
  readonly heading: string
  readonly description: string
  readonly requirements: readonly PreceptorRequirement[]
  readonly note?: string
}

export default function RequirementsSection({ heading, description, requirements, note }: RequirementsSectionProps) {
  return (
    <section className="bg-muted/20 py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{heading}</h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>
        </div>

        <Card className="border-0 bg-card/85 shadow-xl">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-4">
              {requirements.map((requirement) => (
                <RequirementRow key={requirement.summary} text={requirement.summary} />
              ))}
            </div>

            {note ? (
              <div className="rounded-lg bg-accent/10 p-4 text-sm text-accent">
                {note}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

interface RequirementRowProps {
  readonly text: string
}

function RequirementRow({ text }: RequirementRowProps) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <span className="text-sm text-muted-foreground md:text-base">{text}</span>
    </div>
  )
}

