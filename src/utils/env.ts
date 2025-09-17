// src/utils/env.ts
const requiredEnvVars = {
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_SHOW_DEV: import.meta.env.VITE_SHOW_DEV,
  VITE_SHOW_DEV_TEXT: import.meta.env.VITE_SHOW_DEV_TEXT,
} as const;

// 환경변수 검증
const validateEnv = () => {
  const missing = Object.entries(requiredEnvVars)
    .filter(([_key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

// 앱 시작 시 검증
validateEnv();

// 타입 안전한 헬퍼들
export const env = {
  isDev: () => requiredEnvVars.VITE_SHOW_DEV === "true",
  getApiBaseUrl: () => requiredEnvVars.VITE_API_BASE_URL,
  getAppName: () => requiredEnvVars.VITE_APP_NAME,
  getDevBannerText: () => requiredEnvVars.VITE_SHOW_DEV_TEXT,
} as const;

// 기존 함수들은 deprecated로 표시하고 새로운 env 객체 사용 권장
/** @deprecated Use env.isDev() instead */
export const isDev = env.isDev;

/** @deprecated Use env.getApiBaseUrl() instead */
export const getApiBaseUrl = env.getApiBaseUrl;

/** @deprecated Use env.getAppName() instead */
export const getAppName = env.getAppName;

/** @deprecated Use env.getDevBannerText() instead */
export const getDevBannerText = env.getDevBannerText;
