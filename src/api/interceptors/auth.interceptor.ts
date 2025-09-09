// src/api/interceptors/auth.interceptor.ts
import api from "@/api/client/axios";
import router from "@/router";

export function setupAuthInterceptor() {
  // ✅ 요청 인터셉터 (토큰 자동 포함)
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  // ✅ 응답 인터셉터 (401 처리)
  api.interceptors.response.use(
    (response) => {
      // API 응답 구조에서 에러 체크
      if (response.data?.code?.startsWith("E")) {
        // E로 시작하는 코드는 에러로 처리
        return Promise.reject(new Error(response.data.message));
      }
      return response;
    },
    (error) => {
      const status = error.response?.status;
      if (status === 401) {
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common["Authorization"];
        router.push("/auth/login");
      }
      return Promise.reject(error);
    }
  );
}
