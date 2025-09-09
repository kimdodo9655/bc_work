// src/composables/auth/useGetToken.ts
import { useMutation } from "@tanstack/vue-query";
import { getToken } from "@/api/services/index";
import api from "@/api/client/axios";
import { useAuthStore } from "@/stores/auth";

export function useGetToken() {
  const authStore = useAuthStore();

  return useMutation<any, Error>({
    mutationFn: getToken,

    onSuccess: (data) => {
      // 토큰 갱신이 필요하지 않은 응답들 (특정 코드로 구분)
      // 예: if (data?.code === "특정코드") { return; }

      // 토큰 정보가 있는 경우에만 설정
      if (data?.accessToken && data?.accessTokenExpiry) {
        const { accessToken, accessTokenExpiry } = data;

        // ✅ 저장 및 헤더 설정
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        authStore.setToken(accessToken, accessTokenExpiry);

        console.log("🔁 토큰 갱신 완료:", accessToken);
      }
    },

    onError: (err) => {
      console.error("🚨 토큰 갱신 실패:", err.message);
    },
  });
}
