'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { PreceptorBenefit } from './types'

export interface BenefitsSectionProps {
  readonly heading: string
  readonly description: string
  readonly benefits: readonly PreceptorBenefit[]
}

export default function BenefitsSection({ heading, description, benefits }: BenefitsSectionProps) {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <SectionHeader title={heading} description={description} />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  readonly title: string
  readonly description: string
}

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h2>
      <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>
    </div>
  )
}

interface BenefitCardProps {
  readonly benefit: PreceptorBenefit
}

function BenefitCard({ benefit }: BenefitCardProps) {
  return (
    <Card className="border-0 bg-card/80 shadow-lg transition-transform duration-300 hover:translate-y-[-4px] hover:shadow-xl">
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          {benefit.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{benefit.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

