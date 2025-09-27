"use client"

import { memo, useMemo } from "react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import {
  AnimationVariantsFactory,
  MotionDurations,
  MotionEasings,
} from "@/lib/animations"

const MotionStaggeredList = motion.div
const MotionStaggeredListItem = motion.div

export interface StaggeredListProps {
  children: ReactNode
  className?: string
  delayChildren?: number
  staggerChildren?: number
  initialVisible?: boolean
}

export interface StaggeredListItemProps {
  children: ReactNode
  className?: string
}

export const StaggeredList = memo(function StaggeredList({
  children,
  className,
  delayChildren = 0.08,
  staggerChildren = 0.08,
  initialVisible = false,
}: StaggeredListProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = useMemo(
    () => AnimationVariantsFactory.createStaggeredContainer(delayChildren, staggerChildren),
    [delayChildren, staggerChildren]
  )

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <MotionStaggeredList
      className={className}
      initial={initialVisible ? "visible" : "hidden"}
      animate="visible"
      variants={variants}
    >
      {children}
    </MotionStaggeredList>
  )
})

export const StaggeredListItem = memo(function StaggeredListItem({
  children,
  className,
}: StaggeredListItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = useMemo(
    () =>
      AnimationVariantsFactory.createFade({
        transition: {
          duration: MotionDurations.base,
          ease: MotionEasings.gentle,
        },
      }),
    []
  )

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <MotionStaggeredListItem
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </MotionStaggeredListItem>
  )
})

