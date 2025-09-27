import type { Variants, Transition, TargetAndTransition } from "motion/react"
import { memo, useMemo } from "react"
import type { ReactNode } from "react"

export type MotionEasingTuple = readonly [number, number, number, number]

export class MotionDurations {
  static readonly instant = 0.12
  static readonly fast = 0.18
  static readonly base = 0.24
  static readonly relaxed = 0.32
  static readonly deliberate = 0.45
}

export class MotionEasings {
  static readonly standard: MotionEasingTuple = [0.22, 1, 0.36, 1]
  static readonly accelerate: MotionEasingTuple = [0.4, 0, 1, 1]
  static readonly decelerate: MotionEasingTuple = [0, 0, 0.2, 1]
  static readonly gentle: MotionEasingTuple = [0.16, 1, 0.3, 1]

  static resolve(custom?: MotionEasingTuple): MotionEasingTuple {
    return custom ?? MotionEasings.standard
  }
}

export class MotionTransitions {
  static createTransition(
    duration: number = MotionDurations.base,
    easing: MotionEasingTuple = MotionEasings.standard
  ): Transition {
    return {
      duration,
      ease: easing,
    }
  }

  static createSpring(
    {
      stiffness = 320,
      damping = 32,
      mass = 1,
    }: { stiffness?: number; damping?: number; mass?: number } = {}
  ): Transition {
    return {
      type: "spring",
      stiffness,
      damping,
      mass,
    }
  }
}

export type VariantOptions = {
  offset?: number
  transition?: Transition
}

export type PageTransitionPreset =
  | "fade"
  | "slide-up"
  | "slide-right"
  | "slide-left"
  | "scale-fade"
  | "blur-fade"

export class AnimationVariantsFactory {
  static createFade({
    offset = 12,
    transition = MotionTransitions.createTransition(),
  }: VariantOptions = {}): Variants {
    const hidden: TargetAndTransition = {
      opacity: 0,
      y: offset,
      transition,
    }
    const visible: TargetAndTransition = {
      opacity: 1,
      y: 0,
      transition,
    }
    const exit: TargetAndTransition = {
      opacity: 0,
      y: -offset / 2,
      transition: MotionTransitions.createTransition(
        MotionDurations.fast,
        MotionEasings.decelerate
      ),
    }

    return {
      hidden,
      visible,
      exit,
    }
  }

  static createSlide(
    direction: "up" | "down" | "left" | "right" = "up",
    {
      offset = 16,
      transition = MotionTransitions.createTransition(),
    }: VariantOptions = {}
  ): Variants {
    const axisProp: "x" | "y" = direction === "up" || direction === "down" ? "y" : "x"
    const sign = direction === "up" || direction === "left" ? 1 : -1
    const hiddenValue = sign * offset

    const axisHidden = axisProp === "x" ? { x: hiddenValue } : { y: hiddenValue }
    const axisVisible = axisProp === "x" ? { x: 0 } : { y: 0 }
    const axisExit = axisProp === "x" ? { x: -hiddenValue } : { y: -hiddenValue }

    const hidden: TargetAndTransition = {
      opacity: 0,
      transition,
      ...axisHidden,
    }
    const visible: TargetAndTransition = {
      opacity: 1,
      transition,
      ...axisVisible,
    }
    const exit: TargetAndTransition = {
      opacity: 0,
      transition: MotionTransitions.createTransition(
        MotionDurations.fast,
        MotionEasings.decelerate
      ),
      ...axisExit,
    }

    return {
      hidden,
      visible,
      exit,
    }
  }

  static createScaleFade({
    transition = MotionTransitions.createSpring({ stiffness: 260, damping: 32 }),
  }: VariantOptions = {}): Variants {
    const hidden: TargetAndTransition = { opacity: 0, scale: 0.94, transition }
    const visible: TargetAndTransition = { opacity: 1, scale: 1, transition }
    const exit: TargetAndTransition = {
      opacity: 0,
      scale: 0.98,
      transition: MotionTransitions.createTransition(
        MotionDurations.fast,
        MotionEasings.decelerate
      ),
    }

    return {
      hidden,
      visible,
      exit,
    }
  }

  static createBlurFade({
    transition = MotionTransitions.createTransition(),
    offset = 8,
  }: VariantOptions = {}): Variants {
    const hidden: TargetAndTransition = {
      opacity: 0,
      transition,
      filter: "blur(12px)",
      y: offset,
    } as TargetAndTransition
    const visible: TargetAndTransition = {
      opacity: 1,
      transition,
      filter: "blur(0px)",
      y: 0,
    } as TargetAndTransition
    const exit: TargetAndTransition = {
      opacity: 0,
      filter: "blur(8px)",
      transition: MotionTransitions.createTransition(
        MotionDurations.fast,
        MotionEasings.decelerate
      ),
    } as TargetAndTransition

    return {
      hidden,
      visible,
      exit,
    }
  }

  static createStaggeredContainer(
    delayChildren = 0.08,
    staggerChildren = 0.08
  ): Variants {
    return {
      hidden: {
        opacity: 0,
        transition: {
          staggerChildren: 0,
          delayChildren: 0,
        },
      },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren,
          delayChildren,
        },
      },
    }
  }

  static createStaggeredItem(
    variants: Variants = AnimationVariantsFactory.createFade()
  ): Variants {
    return variants
  }
}

export class PageTransitionVariants {
  static resolve(preset: PageTransitionPreset = "fade"): Variants {
    switch (preset) {
      case "scale-fade":
        return AnimationVariantsFactory.createScaleFade()
      case "slide-right":
        return AnimationVariantsFactory.createSlide("right")
      case "slide-left":
        return AnimationVariantsFactory.createSlide("left")
      case "slide-up":
        return AnimationVariantsFactory.createSlide("up")
      case "blur-fade":
        return AnimationVariantsFactory.createBlurFade()
      default:
        return AnimationVariantsFactory.createFade()
    }
  }
}

export class MotionStaggerPresets {
  static readonly list = AnimationVariantsFactory.createStaggeredContainer()
  static readonly listItem = AnimationVariantsFactory.createStaggeredItem()

  static createWithTiming({
    delayChildren = 0.05,
    staggerChildren = 0.06,
  }: {
    delayChildren?: number
    staggerChildren?: number
  } = {}): Variants {
    return AnimationVariantsFactory.createStaggeredContainer(
      delayChildren,
      staggerChildren
    )
  }
}

