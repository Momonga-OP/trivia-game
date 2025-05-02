// Web Vitals for performance monitoring
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry); // Cumulative Layout Shift
    getFID(onPerfEntry); // First Input Delay
    getLCP(onPerfEntry); // Largest Contentful Paint
    getFCP(onPerfEntry); // First Contentful Paint
    getTTFB(onPerfEntry); // Time to First Byte
  } else {
    // Log to console if no callback provided
    getCLS(console.log);
    getFID(console.log);
    getLCP(console.log);
    getFCP(console.log);
    getTTFB(console.log);
  }
};

// Helper function to detect performance issues
export const detectPerformanceIssues = () => {
  let issues = [];
  
  // Monitor for long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Tasks over 50ms are considered "long tasks" that may cause lag
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry);
            issues.push({
              type: 'long-task',
              duration: entry.duration,
              timestamp: entry.startTime
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.error('PerformanceObserver for long tasks not supported', e);
    }
  }
  
  return issues;
};

// Initialize performance monitoring
detectPerformanceIssues();
