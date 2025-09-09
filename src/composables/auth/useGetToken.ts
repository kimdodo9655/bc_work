import { useMutation } from "@tanstack/vue-query";
import { getToken } from "@/api/services/index";
import api from "@/api/client/axios";
import { useAuthStore } from "@/stores/auth";

export function useGetToken() {
  const authStore = useAuthStore();

  return useMutation<any, Error>({
    mutationFn: getToken,

    onSuccess: (data) => {
      if (!data || !data.accessToken || !data.accessTokenExpiry) {
        console.warn("⚠️ 토큰 갱신 응답이 올바르지 않음:", data);
        return;
      }

      const { accessToken, accessTokenExpiry } = data;

      // ✅ 저장 및 헤더 설정
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      authStore.setToken(accessToken, accessTokenExpiry);

      console.log("🔁 토큰 갱신 완료:", accessToken);
    },

    onError: (err) => {
      console.error("🚨 토큰 갱신 실패:", err.message);
    },
  });
}
