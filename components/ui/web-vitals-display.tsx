"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { WebVitalsMetric, PerformanceMonitor } from '@/lib/web-vitals';

interface WebVitalsDisplayProps {
  className?: string;
  showInProduction?: boolean;
}

const MetricCard = ({ metric }: { metric: WebVitalsMetric }) => {
  const getColor = (rating: WebVitalsMetric['rating']) => {
    switch (rating) {
      case 'good':
        return 'text-accent border-accent/30 bg-accent/10';
      case 'needs-improvement':
        return 'text-primary border-primary/30 bg-primary/10';
      case 'poor':
        return 'text-destructive border-destructive/40 bg-destructive/10';
    }
  };

  const formatValue = (name: string, value: number) => {
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      case 'FID':
      case 'FCP':
      case 'LCP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  const getDescription = (name: string) => {
    switch (name) {
      case 'CLS': return 'Cumulative Layout Shift';
      case 'FID': return 'First Input Delay';
      case 'FCP': return 'First Contentful Paint';
      case 'LCP': return 'Largest Contentful Paint';
      case 'TTFB': return 'Time to First Byte';
      default: return name;
    }
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border text-sm",
      getColor(metric.rating)
    )}>
      <div className="font-semibold">{metric.name}</div>
      <div className="text-xs opacity-75 mb-1">{getDescription(metric.name)}</div>
      <div className="font-mono text-lg">{formatValue(metric.name, metric.value)}</div>
      <div className="text-xs capitalize mt-1">{metric.rating.replace('-', ' ')}</div>
    </div>
  );
};

export const WebVitalsDisplay = ({ className, showInProduction = false }: WebVitalsDisplayProps) => {
  const [metrics, setMetrics] = useState<Map<string, WebVitalsMetric>>(new Map());
  const [isVisible, setIsVisible] = useState(false);
  const [monitor, setMonitor] = useState<PerformanceMonitor | null>(null);

  useEffect(() => {
    // Only show in development or if explicitly enabled for production
    if (process.env.NODE_ENV === 'production' && !showInProduction) {
      return;
    }

    const performanceMonitor = new PerformanceMonitor((updatedMetrics) => {
      setMetrics(new Map(updatedMetrics));
    });

    setMonitor(performanceMonitor);

    return () => {
      performanceMonitor.destroy();
    };
  }, [showInProduction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle with Ctrl+Shift+V
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!monitor || (!isVisible && (process.env.NODE_ENV === 'production' && !showInProduction))) {
    return null;
  }

  const metricsArray = Array.from(metrics.values());
  const summary = monitor.getMetricSummary();

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-[9999] max-w-sm",
      !isVisible && "opacity-0 pointer-events-none",
      "transition-opacity duration-300",
      className
    )}>
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Web Vitals</h3>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
        
        {metricsArray.length === 0 ? (
          <div className="text-xs text-muted-foreground">Collecting metrics...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {metricsArray.map((metric) => (
                <MetricCard key={metric.name} metric={metric} />
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground border-t border-border/60 pt-2">
              <div className="flex justify-between">
                <span>Good: {summary.good}</span>
                <span>Needs work: {summary.needsImprovement}</span>
                <span>Poor: {summary.poor}</span>
              </div>
            </div>
          </>
        )}
        
        <div className="text-xs text-muted-foreground/70 mt-2">
          Press Ctrl+Shift+V to toggle
        </div>
      </div>
    </div>
  );
};

// Performance budget component
interface PerformanceBudgetProps {
  budgets: Record<string, number>;
  metrics: Map<string, WebVitalsMetric>;
}

export const PerformanceBudget = ({ budgets, metrics }: PerformanceBudgetProps) => {
  const violations = Object.entries(budgets).filter(([metric, budget]) => {
    const current = metrics.get(metric);
    return current && current.value > budget;
  });

  if (violations.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-destructive/10 border border-destructive/30 rounded-lg p-3 max-w-sm">
      <h4 className="font-semibold text-destructive text-sm mb-2">Performance Budget Violations</h4>
      {violations.map(([metric, budget]) => {
        const current = metrics.get(metric);
        if (!current) return null;
        
        return (
          <div key={metric} className="text-xs text-destructive">
            {metric}: {Math.round(current.value)}ms exceeds budget of {budget}ms
          </div>
        );
      })}
    </div>
  );
};

export default WebVitalsDisplay;
