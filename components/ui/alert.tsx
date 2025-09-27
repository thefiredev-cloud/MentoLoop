import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        muted: "bg-muted text-muted-foreground border-border/60",
        info: "bg-info/10 text-info border-info/30 [&>svg]:text-info",
        success:
          "bg-success/10 text-success border-success/30 [&>svg]:text-success",
        warning:
          "bg-warning/10 text-warning border-warning/30 [&>svg]:text-warning",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/30 [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90",
      },
      tone: {
        default: "",
        strong: "border-2",
        subtle: "border-transparent",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        tone: "strong",
        class: "border-border",
      },
      {
        variant: ["info", "success", "warning", "destructive"],
        tone: "subtle",
        class: "bg-opacity-15",
      },
    ],
    defaultVariants: {
      variant: "default",
      tone: "default",
    },
  }
)

function Alert({
  className,
  variant,
  tone,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, tone }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
