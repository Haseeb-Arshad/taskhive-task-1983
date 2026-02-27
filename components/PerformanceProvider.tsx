'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

/**
 * PerformanceProvider: Optimizes image loading, lazy loading, and performance monitoring.
 * 
 * Features:
 * - Automatic image optimization via Next.js Image component
 * - Lazy loading for images outside viewport
 * - Performance metrics collection (FCP, LCP, CLS)
 * - Request debouncing for expensive operations
 * - Memory-efficient rendering with React.memo
 */
export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const performanceRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: 0,
    timestamps: [],
  });

  // Collect First Contentful Paint (FCP)
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              performanceRef.current.fcp = Math.round(entry.startTime);
              logMetric('FCP', performanceRef.current.fcp);
            }
          }
        });
        observer.observe({ type: 'paint', buffered: true });
        return () => observer.disconnect();
      } catch (error) {
        console.warn('FCP monitoring unavailable:', error);
      }
    }
  }, []);

  // Collect Largest Contentful Paint (LCP)
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          performanceRef.current.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
          logMetric('LCP', performanceRef.current.lcp);
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        return () => observer.disconnect();
      } catch (error) {
        console.warn('LCP monitoring unavailable:', error);
      }
    }
  }, []);

  // Collect Cumulative Layout Shift (CLS)
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              const firstSessionEntry = performanceRef.current.cls;
              const currentSessionEntry = firstSessionEntry + (entry as any).value;
              performanceRef.current.cls = currentSessionEntry;
              logMetric('CLS', performanceRef.current.cls);
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        return () => observer.disconnect();
      } catch (error) {
        console.warn('CLS monitoring unavailable:', error);
      }
    }
  }, []);

  // Monitor resource timing for images
  useEffect(() => {
    const logResourceMetrics = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.initiatorType === 'img' || entry.name.includes('image')) {
                const duration = Math.round(entry.duration);
                if (duration > 100) {
                  console.warn(`Slow image load detected: ${entry.name} (${duration}ms)`);
                }
              }
            }
          });
          observer.observe({ type: 'resource', buffered: true });
          return () => observer.disconnect();
        } catch (error) {
          console.warn('Resource timing monitoring unavailable:', error);
        }
      }
    };

    logResourceMetrics();
  }, []);

  // Request Idle Callback for non-critical tasks
  useEffect(() => {
    const scheduleIdleCallback = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          logMetric('Performance report', performanceRef.current);
        }, { timeout: 5000 });
      } else {
        setTimeout(() => {
          logMetric('Performance report', performanceRef.current);
        }, 0);
      }
    };

    scheduleIdleCallback();
  }, []);

  return <>{children}</>;
};

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  cls: number;
  timestamps: Array<{ event: string; time: number }>;
}

function logMetric(name: string, value: any): void {
  if (typeof window !== 'undefined' && window.performance) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Perf] ${name}:`, value);
    }

    // Send to analytics service (example: PostHog, Vercel Analytics)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', {
        metric_name: name,
        metric_value: value,
        metric_unit: 'milliseconds',
      });
    }
  }
}

/**
 * OptimizedImage: Wrapper around Next.js Image with performance optimizations
 */
interface OptimizedImageProps
  extends Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> {
  src: string;
  alt: string;
  priority?: boolean;
  lazy?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  priority = false,
  lazy = true,
  ...props
}) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(!lazy);

  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (imageRef.current) {
            observer.unobserve(imageRef.current);
          }
        }
      },
      {
        rootMargin: '50px',
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible]);

  if (!isVisible && lazy) {
    return (
      <div
        ref={imageRef}
        className="bg-slate-700/20 backdrop-blur-sm rounded-lg animate-pulse"
        style={{
          aspectRatio: props.width && props.height ? `${props.width} / ${props.height}` : '16 / 9',
        }}
      />
    );
  }

  return (
    <div ref={imageRef}>
      <Image
        src={src}
        alt={alt}
        priority={priority || !lazy}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        {...props}
      />
    </div>
  );
};

/**
 * useDebounce: Hook for debouncing expensive operations
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const debounced = useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );

  return debounced;
}

/**
 * useThrottle: Hook for throttling frequent operations
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false);

  const throttled = useCallback(
    ((...args: any[]) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    }) as T,
    [callback, limit]
  );

  return throttled;
}
