import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridCarousel = ({
  className,
  children,
  direction = "left",
}: {
  className?: string;
  children?: ReactNode;
  direction?: "left" | "right";
}) => {
  const animationClass = direction === "right" ? "animate-scroll-right" : "animate-scroll-left";
  
  return (
    <div className={cn("relative overflow-hidden py-6", className)}>
      <div className={cn("flex gap-6 flex-nowrap", animationClass)}>
        {children}
        {/* Triple content for truly seamless loop */}
        {children}
        {children}
      </div>
      {/* Gradient fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
};

export type BentoGridTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "destructive"

const themeGradients: Record<BentoGridTheme, string> = {
  primary: "from-primary/30 via-primary/10 to-secondary/30",
  secondary: "from-secondary/30 via-primary/20 to-accent/30",
  accent: "from-accent/30 via-primary/15 to-secondary/30",
  info: "from-info/25 via-info/10 to-primary/10",
  success: "from-success/25 via-success/10 to-accent/15",
  warning: "from-warning/30 via-warning/15 to-accent/10",
  destructive: "from-destructive/30 via-destructive/10 to-destructive/5",
}

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  gradient,
  theme = "primary",
  carousel = false,
}: {
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
  gradient?: string;
  theme?: BentoGridTheme;
  carousel?: boolean;
}) => {
  const resolvedGradient = gradient ?? themeGradients[theme]

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl",
        "border border-border/15 bg-gradient-to-br",
        carousel ? "p-5" : "p-6",
        "shadow-xl transition-all duration-500 hover:shadow-2xl",
        "hover:scale-[1.02] hover:border-primary/30",
        "backdrop-blur-md",
        carousel ? "h-[14rem] w-[14rem] md:h-[16rem] md:w-[16rem] flex-shrink-0" : "row-span-1",
        "from-background/40 to-background/20",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-60",
          "bg-gradient-to-br",
          resolvedGradient
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(circle_at_top,_hsla(var(--primary),0.14)_0%,_transparent_70%)]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(circle_at_bottom,_hsla(var(--accent),0.12)_0%,_transparent_75%)]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(circle_at_center,_hsla(var(--secondary),0.08)_0%,_transparent_80%)]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-2",
          "bg-gradient-to-r from-primary/40 via-transparent to-secondary/40"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-0",
          "group-hover:opacity-80 transition-opacity duration-500",
          "bg-gradient-to-t from-background/90 via-background/60 to-transparent"
        )}
      />
      <div className="relative z-10">
        {header && (
          <div className="mb-4 overflow-hidden rounded-lg">
            {header}
          </div>
        )}
        <div className="transition-all duration-300 group-hover:translate-x-1">
          {icon && (
            <div className={cn(
              "w-fit rounded-lg bg-gradient-to-br from-primary/20 to-primary/10",
              carousel ? "mb-2 p-2" : "mb-3 p-3"
            )}>
              {icon}
            </div>
          )}
          {title && (
            <div className={cn(
              "mb-1 font-bold",
              carousel ? "text-base" : "text-lg"
            )}>
              {title}
            </div>
          )}
          {description && (
            <div className={cn(
              "text-muted-foreground/90 leading-snug",
              carousel ? "text-xs" : "text-sm"
            )}>
              {description}
            </div>
          )}
        </div>
      </div>
      
      {/* Animated gradient overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      </div>
      
      {/* Glow effect */}
      <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl" />
      </div>
    </div>
  );
};