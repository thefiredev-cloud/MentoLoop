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

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  gradient,
  carousel = false,
}: {
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
  gradient?: string;
  carousel?: boolean;
}) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl",
        "border border-white/10 bg-gradient-to-br",
        carousel ? "p-5" : "p-6",
        "shadow-xl transition-all duration-500 hover:shadow-2xl",
        "hover:scale-[1.02] hover:border-white/20",
        "backdrop-blur-md",
        carousel ? "h-[14rem] w-[14rem] md:h-[16rem] md:w-[16rem] flex-shrink-0" : "row-span-1",
        gradient || "from-white/10 to-white/5",
        className
      )}
    >
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