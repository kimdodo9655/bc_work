import { setupAuthInterceptor } from "./interceptors/auth.interceptor";
import { setupLoggerInterceptor } from "./interceptors/logger.interceptor";

export function setupAxiosInterceptors() {
  // ✅ 항상 적용: 토큰/401 관련
  setupAuthInterceptor();

  // ✅ 개발 모드에서만 로그 인터셉터 적용
  if (import.meta.env.VITE_SHOW_DEV === "true") {
    setupLoggerInterceptor();
  }
}
