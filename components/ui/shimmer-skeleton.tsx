"use client"

import { cn } from "@/lib/utils"

export interface ShimmerSkeletonProps extends React.ComponentProps<"div"> {
  shimmer?: boolean
}

export function ShimmerSkeleton({
  className,
  shimmer = true,
  ...props
}: ShimmerSkeletonProps) {
  return (
    <div
      role="status"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        shimmer && "animate-shimmer",
        className
      )}
      {...props}
    >
      {shimmer && <span className="shimmer-layer" />}
    </div>
  )
}

export function ShimmerSkeletonText({ className }: { className?: string }) {
  return <ShimmerSkeleton className={cn("h-4 w-full", className)} />
}

