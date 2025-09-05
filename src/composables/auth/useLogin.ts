import { useMutation } from "@tanstack/vue-query";
import type { LoginReqDto, LoginResDto } from "@/api/types/dto/index";
import { login } from "@/api/services/index";
import api from "@/api/client/axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AxiosError } from "axios";
import { useNavigation } from "@/composables/useNavigation";

type ApiError = {
  status: number;
  code: string;
  message: string;
  data: {
    accountMacAddress?: string;
    [key: string]: unknown;
  } | null;
};

type LoginRequest = Omit<LoginReqDto, "macAddress">;

// ==========================================
// MAC 주소 유틸리티 함수들
// ==========================================
const DUMMY_MAC = "00:00:00:00:00:00";

function isValidMac(mac: string) {
  return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac.trim());
}

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 1200) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

async function getMacAddress(): Promise<string> {
  try {
    const res = await fetchWithTimeout("http://localhost:8102/mac", {}, 1200);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const mac = (data?.macAddress ?? "").trim();

    // 유효성 검사 통과 시만 사용, 아니면 더미
    const finalMac = isValidMac(mac) ? mac : DUMMY_MAC;
    console.log("맥주소:", finalMac, isValidMac(mac) ? "" : "(invalid → dummy)");
    return finalMac;
  } catch (err) {
    console.error("MAC 주소 가져오기 실패:", err);
    console.log("맥주소: 더미 사용", DUMMY_MAC);
    return DUMMY_MAC; // 실패 시 더미로 자동 대체
  }
}

export function useLogin() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { goToSiteBlocked } = useNavigation();

  return useMutation<LoginResDto, AxiosError<ApiError>, LoginRequest>({
    mutationFn: async (loginData: LoginRequest) => {
      // API 실행 시 맥주소 가져오기
      const macAddress = await getMacAddress();

      // 맥주소를 포함한 완전한 로그인 데이터로 API 호출
      return login({
        ...loginData,
        macAddress,
      });
    },

    onSuccess: (data, variables) => {
      if (!data) {
        console.warn("로그인 응답 데이터가 null입니다. 이 경우 최초 로그인으로 판단. 이메일 인증 진행");
        return;
      }

      const token = data.accessToken;
      const expiry = data.accessTokenExpiry;
      const userId = variables.userId; // 요청 DTO에서 userId 가져오기

      // ✅ 토큰과 userId 저장 및 헤더 설정
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", userId);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      authStore.setToken(token, expiry);

      console.log("✅ 로그인 성공 - Authorization 토큰 설정 완료");
      console.log("✅ userId 저장 완료:", userId);
      router.push("/");
    },

    onError: async (err) => {
      if (err.response?.data?.code === "A005") {
        // 현재 기기의 맥주소 다시 가져오기
        const currentMacAddress = await getMacAddress();

        // 서버에서 온 등록된 맥주소
        const registeredMacAddress = err.response.data.data?.accountMacAddress || "알 수 없음";

        // 맥주소 불일치 페이지로 데이터와 함께 이동
        goToSiteBlocked({
          currentMacAddress,
          registeredMacAddress,
          errorMessage: err.response.data.message,
        });
        return;
      }
      console.error("🚨 로그인 실패:", err.message);
    },
  });
}
