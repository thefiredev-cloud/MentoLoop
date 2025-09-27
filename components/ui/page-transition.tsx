"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { type ReactNode, memo } from "react"

import {
  MotionDurations,
  MotionEasings,
  PageTransitionPreset,
  PageTransitionVariants,
} from "@/lib/animations"

type TransitionKeyResolver = (pathname: string) => string

export interface PageTransitionProps {
  children: ReactNode
  preset?: PageTransitionPreset
  mode?: "wait" | "sync" | "popLayout"
  transitionKey?: string | TransitionKeyResolver
}

const DEFAULT_MODE: PageTransitionProps["mode"] = "wait"

export const PageTransition = memo(function PageTransition({
  children,
  preset = "fade",
  mode = DEFAULT_MODE,
  transitionKey,
}: PageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const resolvedKey =
    typeof transitionKey === "function"
      ? transitionKey(pathname)
      : transitionKey ?? pathname

  const variants = prefersReducedMotion
    ? undefined
    : PageTransitionVariants.resolve(preset)

  return (
    <AnimatePresence mode={mode} initial={false}>
      {prefersReducedMotion ? (
        <div key={resolvedKey} className="h-full">
          {children}
        </div>
      ) : (
        <motion.div
          key={resolvedKey}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          transition={{
            duration: MotionDurations.base,
            ease: MotionEasings.standard,
          }}
          className="h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

