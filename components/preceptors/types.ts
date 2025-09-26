'use client'

import type { ReactNode } from 'react'

export interface PreceptorHeroCopy {
  readonly titleLead: string
  readonly highlightedTitle: string
  readonly subtitle: string
  readonly description: string
  readonly supportingCopy: string
}

export class PreceptorBenefit {
  constructor(
    public readonly icon: ReactNode,
    public readonly title: string,
    public readonly description: string
  ) {}
}

export class PreceptorRecognitionItem {
  constructor(
    public readonly icon: ReactNode,
    public readonly heading: string,
    public readonly detail: string
  ) {}
}

export class PreceptorProcessStep {
  constructor(
    public readonly order: number,
    public readonly title: string,
    public readonly detail: string
  ) {}
}

export class PreceptorRequirement {
  constructor(public readonly summary: string) {}
}

export interface PreceptorTestimonial {
  readonly name: string
  readonly role: string
  readonly rating: number
  readonly quote: string
}

export interface TestimonialsState {
  readonly isLoading: boolean
  readonly testimonials: readonly PreceptorTestimonial[]
}

export interface VideoDialogState {
  readonly open: boolean
  readonly onClose: () => void
}


