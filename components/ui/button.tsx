import * as React from "react"
import Link from "next/link"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        accent:
          "bg-accent text-accent-foreground shadow-xs hover:bg-accent/90",
        info: "bg-info text-info-foreground shadow-xs hover:bg-info/90",
        success:
          "bg-success text-success-foreground shadow-xs hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-border bg-background shadow-xs hover:bg-accent/10 hover:text-accent-foreground",
        muted:
          "bg-muted text-muted-foreground shadow-xs hover:bg-muted/80",
        ghost:
          "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "border-transparent bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground shadow-md hover:brightness-110",
        subtle:
          "bg-muted/60 text-muted-foreground shadow-none hover:bg-muted",
      },
      tone: {
        neutral: "",
        brand: "bg-primary text-primary-foreground",
        positive: "bg-success text-success-foreground",
        caution: "bg-warning text-warning-foreground",
        danger: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base",
        icon: "size-9",
      },
    },
    compoundVariants: [
      {
        variant: "gradient",
        tone: "brand",
        class: "from-primary via-primary to-secondary",
      },
      {
        variant: "subtle",
        tone: "positive",
        class: "bg-success/15 text-success",
      },
      {
        variant: "subtle",
        tone: "caution",
        class: "bg-warning/15 text-warning",
      },
      {
        variant: "subtle",
        tone: "danger",
        class: "bg-destructive/15 text-destructive",
      },
    ],
    defaultVariants: {
      variant: "default",
      tone: "neutral",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(
  (
    { className, variant, size, asChild = false, type = "button", ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(
          "relative isolate overflow-hidden",
          !prefersReducedMotion && "before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] before:bg-white/10 hover:before:opacity-100",
          !prefersReducedMotion && "active:scale-[0.98] focus-visible:translate-y-[-1px]",
          buttonVariants({ variant, size, className })
        )}
        type={type}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

interface AsyncButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
  loading?: boolean
  loadingText?: string
  spinner?: React.ReactNode
}

interface LinkButtonProps
  extends React.ComponentProps<typeof Link> {
  prefetch?: boolean
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  disabled?: boolean
}

const defaultSpinner = (
  <svg className="size-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
)

const AsyncButton = React.forwardRef<HTMLButtonElement, AsyncButtonProps>(
  (
    {
      loading: loadingProp,
      loadingText,
      spinner = defaultSpinner,
      disabled,
      children,
      onClick,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const [internalLoading, setInternalLoading] = React.useState(false)
    const isControlled = typeof loadingProp === "boolean"
    const isLoading = isControlled ? Boolean(loadingProp) : internalLoading

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!onClick || disabled || isLoading) {
        return
      }
      const result = onClick(event)
      if (result instanceof Promise) {
        if (!isControlled) {
          setInternalLoading(true)
        }
        try {
          await result
        } finally {
          if (!isControlled) {
            setInternalLoading(false)
          }
        }
      }
    }

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        type={type}
        {...rest}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            {spinner}
            <span>{loadingText ?? children}</span>
          </span>
        ) : (
          children
        )}
      </Button>
    )
  }
)

AsyncButton.displayName = "AsyncButton"

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      className,
      variant,
      size,
      disabled,
      children,
      prefetch,
      href,
      ...rest
    },
    ref
  ) => {
    if (disabled) {
      return (
        <span
          className={cn(
            buttonVariants({ variant, size, className }),
            "pointer-events-none opacity-50"
          )}
          aria-disabled="true"
        >
          {children}
        </span>
      )
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(buttonVariants({ variant, size, className }))}
        prefetch={prefetch}
        {...rest}
      >
        {children}
      </Link>
    )
  }
)

LinkButton.displayName = "LinkButton"

export { Button, buttonVariants, AsyncButton, LinkButton }
