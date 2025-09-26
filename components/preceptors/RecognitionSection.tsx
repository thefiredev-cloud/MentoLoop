'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { PreceptorRecognitionItem } from './types'

export interface RecognitionSectionProps {
  readonly heading: string
  readonly description: string
  readonly items: readonly PreceptorRecognitionItem[]
}

export default function RecognitionSection({ heading, description, items }: RecognitionSectionProps) {
  return (
    <section className="bg-muted/15 py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{heading}</h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <RecognitionCard key={item.heading} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface RecognitionCardProps {
  readonly item: PreceptorRecognitionItem
}

function RecognitionCard({ item }: RecognitionCardProps) {
  return (
    <Card className="border-0 bg-card/85 shadow-lg transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl">
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          {item.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{item.heading}</h3>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">{item.detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

