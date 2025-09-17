// src/config/environment.ts
interface EnvironmentConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    devTools: boolean;
    performance: boolean;
    analytics: boolean;
  };
  monitoring: {
    errorReporting: boolean;
    performanceTracking: boolean;
  };
  ui: {
    toastDuration: number;
    animationDuration: number;
    debounceDelay: number;
  };
}

const configs: Record<string, EnvironmentConfig> = {
  development: {
    api: {
      baseUrl: "http://localhost:8100",
      timeout: 10000,
      retries: 1,
    },
    features: {
      devTools: true,
      performance: true,
      analytics: false,
    },
    monitoring: {
      errorReporting: false,
      performanceTracking: true,
    },
    ui: {
      toastDuration: 5000,
      animationDuration: 300,
      debounceDelay: 300,
    },
  },

  staging: {
    api: {
      baseUrl: "https://api-staging.example.com",
      timeout: 8000,
      retries: 2,
    },
    features: {
      devTools: true,
      performance: true,
      analytics: true,
    },
    monitoring: {
      errorReporting: true,
      performanceTracking: true,
    },
    ui: {
      toastDuration: 4000,
      animationDuration: 250,
      debounceDelay: 250,
    },
  },

  production: {
    api: {
      baseUrl: "https://api.example.com",
      timeout: 5000,
      retries: 3,
    },
    features: {
      devTools: false,
      performance: false,
      analytics: true,
    },
    monitoring: {
      errorReporting: true,
      performanceTracking: false,
    },
    ui: {
      toastDuration: 3000,
      animationDuration: 200,
      debounceDelay: 200,
    },
  },
};

export const getConfig = (): EnvironmentConfig => {
  const env = import.meta.env.MODE || "development";
  const config = configs[env] || configs.development;

  // 환경변수로 오버라이드 가능
  if (import.meta.env.VITE_API_BASE_URL) {
    config.api.baseUrl = import.meta.env.VITE_API_BASE_URL;
  }

  return config;
};

// 전역 설정 객체
export const config = getConfig();

// 타입 안전한 설정 접근
export const useConfig = () => {
  return {
    api: config.api,
    features: config.features,
    monitoring: config.monitoring,
    ui: config.ui,

    // 헬퍼 함수들
    isFeatureEnabled: (feature: keyof typeof config.features) => config.features[feature],

    getApiTimeout: () => config.api.timeout,
    getToastDuration: () => config.ui.toastDuration,
  };
};
