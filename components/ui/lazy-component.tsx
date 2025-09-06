"use client";

import React, { Suspense, lazy, ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  className?: string;
}

// Loading skeleton component for better UX
const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse-optimized", className)}>
    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-muted rounded w-2/3"></div>
  </div>
);

// Higher-order component for lazy loading with optimized fallback
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));

  const WithLazyLoadingComponent = React.forwardRef<HTMLElement, T & LazyComponentProps>(
    ({ fallback: customFallback, className, ...props }, ref) => (
      <Suspense 
        fallback={
          customFallback || 
          fallback || 
          <LoadingSkeleton className={className} />
        }
      >
        <LazyComponent ref={ref} {...(props as T)} />
      </Suspense>
    )
  );

  WithLazyLoadingComponent.displayName = `WithLazyLoading(${Component.displayName || Component.name})`;
  
  return WithLazyLoadingComponent;
}

// Hook for intersection observer-based lazy loading
export function useLazyLoading(options: IntersectionObserverInit = {}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasBeenVisible, setHasBeenVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          // Stop observing once visible
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isVisible, hasBeenVisible };
}

// Lazy image component with intersection observer
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  placeholder?: string;
}

export const LazyImage = React.memo(function LazyImage({
  src,
  alt,
  fallback,
  placeholder,
  className,
  ...props
}: LazyImageProps) {
  const { ref, isVisible } = useLazyLoading();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = React.useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      ) : (
        <div 
          className={cn(
            "bg-muted animate-pulse-optimized flex items-center justify-center",
            className
          )}
        >
          {placeholder ? (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          ) : (
            <div className="w-full h-full bg-muted rounded" />
          )}
        </div>
      )}
    </div>
  );
});

export default LazyImage;