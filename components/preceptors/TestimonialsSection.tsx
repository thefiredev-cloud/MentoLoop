'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Star } from 'lucide-react'
import type { TestimonialsState } from './types'

export interface TestimonialsSectionProps {
  readonly heading: string
  readonly state: TestimonialsState
}

export default function TestimonialsSection({ heading, state }: TestimonialsSectionProps) {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {heading}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {state.isLoading ? renderLoadingSkeletons() : renderTestimonials(state)}
        </div>
      </div>
    </section>
  )
}

function renderLoadingSkeletons() {
  return Array.from({ length: 3 }).map((_, index) => (
    <Card key={index} className="border-0 bg-card/70 p-6 shadow-lg">
      <div className="space-y-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((__, starIndex) => (
            <Skeleton key={starIndex} className="h-5 w-5 rounded-sm" />
          ))}
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </Card>
  ))
}

function renderTestimonials(state: TestimonialsState) {
  return state.testimonials.map((testimonial) => (
    <Card key={`${testimonial.name}-${testimonial.role}`} className="border-0 bg-card/85 p-6 shadow-lg">
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex gap-1">
          {[...Array(testimonial.rating)].map((_, index) => (
            <Star key={index} className="h-5 w-5 fill-chart-5 text-chart-5" />
          ))}
        </div>
        <p className="text-sm italic text-muted-foreground md:text-base">“{testimonial.quote}”</p>
        <div>
          <p className="text-sm font-semibold text-foreground md:text-base">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground md:text-sm">{testimonial.role}</p>
        </div>
      </CardContent>
    </Card>
  ))
}

