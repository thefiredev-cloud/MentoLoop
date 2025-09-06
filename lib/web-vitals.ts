import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import React from 'react';

export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

// Web Vitals thresholds based on Google's recommendations
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

export function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const thresholds = VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

export function reportWebVitals(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  if (onPerfEntry && typeof window !== 'undefined') {
    // Enhanced metric reporting with additional context
    const reportMetric = (metric: Omit<WebVitalsMetric, 'rating'>) => {
      const enhancedMetric: WebVitalsMetric = {
        ...metric,
        rating: getRating(metric.name, metric.value),
      };
      
      onPerfEntry(enhancedMetric);
      
      // Optional: Send to analytics service
      sendToAnalytics(enhancedMetric);
    };

    onCLS(reportMetric);
    onFID(reportMetric);
    onFCP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }
}

// Function to send metrics to analytics service (customize as needed)
function sendToAnalytics(metric: WebVitalsMetric) {
  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as { gtag: (command: string, event: string, params: Record<string, unknown>) => void }).gtag;
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.rating,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  
  // Example: Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'web-vitals',
        metric: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          connection: (navigator as { connection?: { effectiveType?: string } }).connection?.effectiveType,
        },
      }),
    }).catch(console.error);
  }
}

// Enhanced performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor(private onMetricUpdate?: (metrics: Map<string, WebVitalsMetric>) => void) {
    this.initWebVitals();
    this.initCustomMetrics();
  }

  private initWebVitals() {
    reportWebVitals((metric) => {
      this.metrics.set(metric.name, metric);
      this.onMetricUpdate?.(this.metrics);
    });
  }

  private initCustomMetrics() {
    if (typeof window === 'undefined') return;

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const longTasks = list.getEntries().filter((entry) => entry.duration > 50);
          if (longTasks.length > 0) {
            console.warn(`Long tasks detected: ${longTasks.length} tasks over 50ms`);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // PerformanceObserver not supported
      }

      // Monitor memory usage
      if ('memory' in performance && (performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory) {
        setInterval(() => {
          const memory = (performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
          if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
            console.warn('High memory usage detected');
          }
        }, 30000); // Check every 30 seconds
      }
    }
  }

  getMetrics(): Map<string, WebVitalsMetric> {
    return new Map(this.metrics);
  }

  getMetricSummary() {
    const summary = {
      good: 0,
      needsImprovement: 0,
      poor: 0,
      total: this.metrics.size,
    };

    this.metrics.forEach((metric) => {
      switch (metric.rating) {
        case 'good':
          summary.good++;
          break;
        case 'needs-improvement':
          summary.needsImprovement++;
          break;
        case 'poor':
          summary.poor++;
          break;
      }
    });

    return summary;
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Hook for using performance monitoring in React components
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<Map<string, WebVitalsMetric>>(new Map());
  const [monitor] = React.useState(() => new PerformanceMonitor(setMetrics));

  React.useEffect(() => {
    return () => {
      monitor.destroy();
    };
  }, [monitor]);

  return {
    metrics,
    summary: monitor.getMetricSummary(),
    getMetric: (name: WebVitalsMetric['name']) => metrics.get(name),
  };
}

// For Next.js _app.tsx integration
export function setupWebVitalsReporting() {
  return reportWebVitals;
}