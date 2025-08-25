import { useMutation } from "@tanstack/vue-query";
import type { LoginReqDto, LoginResDto } from "@/api/types/auth";
import { login } from "@/api/auth";
import api from "@/api/axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export function useLogin() {
  const router = useRouter();
  const authStore = useAuthStore();

  return useMutation<LoginResDto, Error, LoginReqDto>({
    mutationFn: login,

    onSuccess: (data) => {
      if (!data) {
        console.warn("로그인 응답 데이터가 null입니다.");
        return;
      }

      const token = data.accessToken;
      const expiry = data.accessTokenExpiry;

      if (!token || !expiry) {
        console.warn("accessToken 또는 accessTokenExpiry 누락됨.");
        return;
      }

      // ✅ 저장 및 헤더 설정
      localStorage.setItem("accessToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      authStore.setToken(token, expiry);

      console.log("✅ 로그인 성공 - 토큰 설정 완료:", token);
      router.push("/");
    },

    onError: (err) => {
      console.error("🚨 로그인 실패:", err.message);
    },
  });
}
