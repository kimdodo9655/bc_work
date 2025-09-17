// src/utils/performance.ts
import { env } from "./env";

class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private observers = new Map<string, PerformanceObserver>();

  startMonitoring() {
    if (!env.isDev()) return;

    console.log("🚀 Performance monitoring started");
    this.monitorCustomMetrics();
    this.monitorMemoryUsage();
    this.setupGlobalErrorTracking();
  }

  private monitorCustomMetrics() {
    if (typeof PerformanceObserver === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.startsWith("vue-") || entry.name.startsWith("component-")) {
          this.recordMetric(entry.name, entry.duration);

          // 느린 컴포넌트 경고
          if (entry.duration > 16) {
            // 60fps threshold
            console.warn(`🐌 Slow render: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ["measure"] });
    this.observers.set("custom", observer);
  }

  private monitorMemoryUsage() {
    if (!("memory" in performance)) return;

    setInterval(() => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;

      this.recordMetric("memory-used", usedMB);

      // 메모리 사용량 경고
      if (usedMB > 100) {
        console.warn(`🧠 High memory usage: ${usedMB.toFixed(1)}MB`);
      }
    }, 10000); // 10초마다 체크
  }

  private setupGlobalErrorTracking() {
    window.addEventListener("error", (event) => {
      console.error("💥 Global Error:", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("💥 Unhandled Promise Rejection:", event.reason);
    });
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // 최근 50개 측정값만 유지
    if (values.length > 50) {
      values.shift();
    }
  }

  // 성능 리포트 생성
  getReport(): Record<string, any> {
    const report: Record<string, any> = {};

    this.metrics.forEach((values, name) => {
      if (values.length === 0) return;

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      report[name] = {
        average: Math.round(avg * 100) / 100,
        max: Math.round(max * 100) / 100,
        min: Math.round(min * 100) / 100,
        samples: values.length,
      };
    });

    return report;
  }

  // 콘솔에 리포트 출력
  logReport() {
    const report = this.getReport();

    if (Object.keys(report).length === 0) {
      console.log("📊 No performance metrics to report");
      return;
    }

    console.group("📊 Performance Report");
    Object.entries(report).forEach(([metric, stats]) => {
      console.log(`${metric}:`, stats);
    });
    console.groupEnd();
  }

  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

// 전역 인스턴스
const performanceMonitor = new PerformanceMonitor();

// 개발 모드에서만 활성화
if (env.isDev()) {
  performanceMonitor.startMonitoring();

  // 전역 접근을 위해 window에 추가
  (window as any).__PERFORMANCE_MONITOR__ = performanceMonitor;

  // 5분마다 리포트 출력
  setInterval(() => {
    performanceMonitor.logReport();
  }, 5 * 60 * 1000);

  // 페이지 언로드 시 최종 리포트
  window.addEventListener("beforeunload", () => {
    performanceMonitor.logReport();
    performanceMonitor.cleanup();
  });
}

export { performanceMonitor };
