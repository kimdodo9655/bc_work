import { useMutation } from "@tanstack/vue-query";
import type { LoginReqDto, LoginResDto } from "@/api/types/dto/index";
import { login } from "@/api/services/index";
import api from "@/api/client/axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AxiosError } from "axios";

type ApiError = {
  status: number;
  code: string; // 🔹 여기에 code가 있다고 명시
  message: string;
  data: unknown | null;
};

export function useLogin() {
  const router = useRouter();
  const authStore = useAuthStore();

  return useMutation<LoginResDto, AxiosError<ApiError>, LoginReqDto>({
    mutationFn: login,

    onSuccess: (data) => {
      if (!data) {
        console.warn("로그인 응답 데이터가 null입니다. 이 경우 최초 로그인으로 판단. 이메일 인증 진행");
        return;
      }

      const token = data.accessToken;
      const expiry = data.accessTokenExpiry;

      // ✅ 저장 및 헤더 설정
      localStorage.setItem("accessToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      authStore.setToken(token, expiry);

      console.log("✅ 로그인 성공 - Authorization 토큰 설정 완료");
      router.push("/");
    },

    onError: (err) => {
      if (err.response?.data?.code === "A016") {
        console.warn("🚨 A016 에러: 등록된 MAC 주소와 일치하지 않습니다.");
        return;
      }
      console.error("🚨 로그인 실패:", err.message);
    },
  });
}
