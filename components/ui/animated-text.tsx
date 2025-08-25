"use client";

import { cn } from "@/lib/utils";
import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  type?: "word" | "character" | "line";
}

export function AnimatedText({
  text,
  className,
  delay = 0,
  duration = 0.5,
  type = "word",
}: AnimatedTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  const words = text.split(" ");
  const characters = text.split("");
  
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (_i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: type === "character" ? 0.03 : 0.12, 
        delayChildren: delay 
      },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn(className)}
    >
      {type === "word" ? (
        words.map((word, index) => (
          <motion.span
            variants={child}
            key={index}
            className="mr-2"
          >
            {word}
          </motion.span>
        ))
      ) : (
        characters.map((char, index) => (
          <motion.span
            variants={child}
            key={index}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))
      )}
    </motion.div>
  );
}

export function GradientText({
  children,
  className,
  gradient = "from-primary via-secondary to-accent",
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradient,
        className
      )}
    >
      {children}
    </span>
  );
}

export function GlowingText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-block",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 blur-xl opacity-70 animate-pulse"
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}