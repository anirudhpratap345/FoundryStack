// Performance monitoring utilities
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep only last 1000 metrics

  // Start timing a performance metric
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
      });
    };
  }

  // Record a performance metric
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log slow operations
    if (metric.duration > 1000) { // More than 1 second
      console.warn(`Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  // Get performance metrics
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  // Get average duration for a metric
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / metrics.length;
  }

  // Get performance summary
  getSummary() {
    const summary: Record<string, any> = {};
    
    const uniqueNames = [...new Set(this.metrics.map(m => m.name))];
    
    for (const name of uniqueNames) {
      const metrics = this.getMetrics(name);
      const durations = metrics.map(m => m.duration);
      
      summary[name] = {
        count: metrics.length,
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        p95: this.percentile(durations, 0.95),
        p99: this.percentile(durations, 0.99),
      };
    }
    
    return summary;
  }

  private percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Higher-order function to measure function performance
export function measurePerformance<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const stopTiming = performanceMonitor.startTiming(name);
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(stopTiming);
      }
      
      stopTiming();
      return result;
    } catch (error) {
      stopTiming();
      throw error;
    }
  }) as T;
}

// React hook for measuring component performance
export function usePerformanceMeasure(name: string) {
  const stopTiming = performanceMonitor.startTiming(name);
  
  // Return cleanup function
  return () => stopTiming();
}
