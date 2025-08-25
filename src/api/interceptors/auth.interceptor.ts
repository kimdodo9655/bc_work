import api from "@/api/axios";
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
    (response) => response,
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
