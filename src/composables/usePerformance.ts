// src/composables/usePerformance.ts
import { ref, computed, onMounted, onUnmounted, watchEffect, readonly, type Ref } from "vue";

/**
 * Smart Memoization Hook
 */
export function useSmartMemo<T>(factory: () => T, deps: readonly unknown[], equalFn?: (prev: T, next: T) => boolean): T {
  const memoRef = ref<{ deps: readonly unknown[]; value: T }>();

  const depsEqual = (a: readonly unknown[], b: readonly unknown[]): boolean => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  return computed(() => {
    const current = memoRef.value;

    if (!current || !depsEqual(current.deps, deps)) {
      const newValue = factory();

      // 커스텀 비교 함수가 있으면 사용
      if (current && equalFn && equalFn(current.value, newValue)) {
        return current.value;
      }

      memoRef.value = { deps: [...deps], value: newValue };
      return newValue;
    }

    return current.value;
  }).value;
}

/**
 * Intersection Observer Hook
 */
export const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const target = ref<Element>();
  const isIntersecting = ref(false);

  let observer: IntersectionObserver | null = null;

  const startObserving = () => {
    if (typeof IntersectionObserver === "undefined") return;

    observer = new IntersectionObserver(([entry]) => {
      isIntersecting.value = entry.isIntersecting;
    }, options);

    if (target.value) {
      observer.observe(target.value);
    }
  };

  const stopObserving = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  watchEffect(() => {
    if (target.value) {
      startObserving();
    }
  });

  onUnmounted(() => {
    stopObserving();
  });

  return { target, isIntersecting: readonly(isIntersecting) };
};

/**
 * Progressive Image Loading Hook
 */
export const useProgressiveImage = (src: string, placeholder?: string) => {
  const loaded = ref(false);
  const error = ref(false);
  const currentSrc = ref(placeholder || "");

  onMounted(() => {
    if (!src) return;

    const img = new Image();

    img.onload = () => {
      currentSrc.value = src;
      loaded.value = true;
    };

    img.onerror = () => {
      error.value = true;
    };

    img.src = src;
  });

  return {
    currentSrc: readonly(currentSrc),
    loaded: readonly(loaded),
    error: readonly(error),
  };
};

/**
 * Virtual Scrolling Hook
 */
export const useVirtualList = <T>(items: Ref<T[]>, containerHeight: number, itemHeight: number) => {
  const scrollTop = ref(0);
  const containerRef = ref<HTMLElement>();

  const visibleRange = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 2, items.value.length);

    return { start: Math.max(0, start - 1), end };
  });

  const visibleItems = computed(() =>
    items.value.slice(visibleRange.value.start, visibleRange.value.end).map((item, index) => ({
      item,
      index: visibleRange.value.start + index,
      top: (visibleRange.value.start + index) * itemHeight,
    }))
  );

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener("scroll", handleScroll, { passive: true });
    }
  });

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener("scroll", handleScroll);
    }
  });

  return {
    containerRef,
    visibleItems: readonly(visibleItems),
    totalHeight: computed(() => items.value.length * itemHeight),
    scrollTop: readonly(scrollTop),
  };
};

/**
 * Debounced State Hook
 */
export const useDebouncedState = <T>(initialValue: T, delay: number = 300) => {
  const immediate = ref<T>(initialValue);
  const debounced = ref<T>(initialValue);

  let timeoutId: ReturnType<typeof setTimeout>;

  watchEffect(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      debounced.value = immediate.value;
    }, delay);
  });

  onUnmounted(() => {
    clearTimeout(timeoutId);
  });

  return {
    immediate,
    debounced: readonly(debounced),
    setValue: (value: T) => {
      immediate.value = value;
    },
  };
};
