'use client'

import type { ComponentType, ReactNode } from 'react'
import { AnimatedText, GradientText, GlowingText } from '@/components/ui/animated-text'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, CheckCircle, Heart } from 'lucide-react'
import type { PreceptorHeroCopy } from './types'

type BackgroundComponentProps = {
  readonly className?: string
  readonly showIcons?: boolean
  readonly children?: ReactNode
}

export interface HeroSectionProps {
  readonly copy: PreceptorHeroCopy
  readonly highlights: readonly string[]
  readonly primaryCta: {
    readonly href: string
    readonly label: string
  }
  readonly BackgroundComponent: ComponentType<BackgroundComponentProps>
}

export default function HeroSection({
  copy,
  highlights,
  primaryCta,
  BackgroundComponent
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <BackgroundComponent className="min-h-fit" showIcons={false}>
        <DecorativeGlow />

        <div className="py-20 md:py-32">
          <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="glass-strong rounded-3xl p-8 md:p-12 shadow-2xl hover-lift transform-3d"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12, duration: 0.45 }}
              >
                <Link
                  href={primaryCta.href}
                  className="group hover:bg-foreground/10 mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 transition-all duration-300 border border-foreground/20 backdrop-blur-md"
                >
                  <Heart className="h-4 w-4 text-[#f87171]" />
                  <span className="font-medium text-white">{copy.subtitle}</span>
                  <ArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <div className="mt-8">
                <AnimatedText
                  text={copy.titleLead}
                  type="word"
                  delay={0.24}
                  className="mx-auto max-w-3xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white text-shadow-strong"
                />
                <h1 className="mx-auto mt-2 max-w-3xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-shadow-strong">
                  <GradientText gradient="from-white via-blue-200 to-white">
                    {copy.highlightedTitle}
                  </GradientText>
                </h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-white/90 mx-auto mt-6 max-w-xl text-balance text-xl md:text-2xl text-shadow-strong font-medium"
              >
                <GlowingText className="text-white">{copy.description}</GlowingText>
              </motion.p>

              <p className="text-white/80 mx-auto mt-4 max-w-2xl text-balance text-lg">
                {copy.supportingCopy}
              </p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.45 }}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Button
                  asChild
                  size="lg"
                  className="group relative bg-card text-primary hover:bg-card/90 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden px-8 py-5 text-lg font-semibold"
                >
                  <Link href={primaryCta.href}>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Heart className="mr-2 h-5 w-5 text-[#f87171]" />
                    <span className="relative">{primaryCta.label}</span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85, duration: 0.4 }}
                className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-white/85 sm:flex-row sm:gap-6"
              >
                {highlights.map((point) => (
                  <HeroSupportingPoint key={point} label={point} />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </BackgroundComponent>
    </section>
  )
}

interface HeroSupportingPointProps {
  readonly label: string
}

function HeroSupportingPoint({ label }: HeroSupportingPointProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-accent" />
      <span>{label}</span>
    </div>
  )
}

function DecorativeGlow() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-6 top-16 h-28 w-28 rounded-full bg-accent/25 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 18, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 10.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-16 right-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
      />
    </div>
  )
}

