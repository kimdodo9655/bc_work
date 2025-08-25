// DEV 환경 야부 ("true" | "false")
export const isDev = () => import.meta.env.VITE_SHOW_DEV === "true";

// API BASE URL
export const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL;

// APP NAME
export const getAppName = () => import.meta.env.VITE_APP_NAME;

// DEV BANNER TEXT
export const getDevBannerText = () => import.meta.env.VITE_SHOW_DEV_TEXT;
