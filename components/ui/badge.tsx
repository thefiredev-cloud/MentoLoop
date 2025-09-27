import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        accent: "border-transparent bg-accent text-accent-foreground [a&]:hover:bg-accent/90",
        info: "border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90",
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "text-foreground border-border [a&]:hover:bg-accent/10",
        outlineSuccess:
          "border-success/40 text-success bg-success/10",
        outlineWarning:
          "border-warning/40 text-warning bg-warning/10",
        outlineInfo: "border-info/40 text-info bg-info/10",
      },
      emphasis: {
        solid: "",
        subtle: "border-transparent bg-muted text-muted-foreground",
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-secondary text-primary-foreground",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        emphasis: "solid",
        class: "border-border",
      },
      {
        emphasis: "subtle",
        variant: ["info", "success", "warning", "destructive"],
        class: "bg-opacity-15",
      },
    ],
    defaultVariants: {
      variant: "default",
      emphasis: "solid",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
