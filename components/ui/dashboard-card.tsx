import { cn } from "@/lib/utils"

type DashboardCardProps = React.ComponentProps<"div"> & {
  variant?: "default" | "muted" | "outline" | "accent"
  tone?: "primary" | "secondary" | "accent" | "success" | "warning" | "info"
  interactive?: boolean
}

const toneRing: Record<NonNullable<DashboardCardProps["tone"]>, string> = {
  primary: "ring-primary/30",
  secondary: "ring-secondary/30",
  accent: "ring-accent/30",
  success: "ring-success/30",
  warning: "ring-warning/30",
  info: "ring-info/30",
}

const toneBorder: Record<NonNullable<DashboardCardProps["tone"]>, string> = {
  primary: "border-primary/20",
  secondary: "border-secondary/20",
  accent: "border-accent/20",
  success: "border-success/20",
  warning: "border-warning/25",
  info: "border-info/20",
}

export function DashboardCard({
  className,
  children,
  variant = "default",
  tone = "primary",
  interactive = false,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card/90 text-card-foreground shadow-xl backdrop-blur-xl transition-all duration-300",
        variant === "muted" && "bg-muted/60 border-border/40",
        variant === "outline" && "bg-background/70 border-border/60",
        variant === "accent" && "bg-gradient-to-br from-primary/10 via-background to-accent/10",
        interactive && "hover:-translate-y-1 hover:shadow-2xl",
        interactive && toneRing[tone],
        tone && toneBorder[tone],
        "before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-br before:from-primary/5 before:to-background",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:border after:border-white/5 after:opacity-40",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-primary/40 via-transparent to-secondary/40" />
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute -top-20 left-1/4 h-40 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <div className="relative z-10 space-y-4 p-6">{children}</div>
    </div>
  )
}

export function DashboardCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        className,
      )}
      {...props}
    />
  )
}

export function DashboardCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function DashboardCardValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-3xl font-semibold",
        className,
      )}
      {...props}
    />
  )
}

export function DashboardCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

