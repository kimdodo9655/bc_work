// src/composables/auth/useLogin.ts
import { useMutation } from "@tanstack/vue-query";
import { login } from "@/api/services/index";
import api from "@/api/client/axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AxiosError } from "axios";
import { useNavigation } from "@/composables/useNavigation";

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

    const finalMac = isValidMac(mac) ? mac : DUMMY_MAC;
    console.log("맥주소:", finalMac, isValidMac(mac) ? "" : "(invalid → dummy)");
    return finalMac;
  } catch (err) {
    console.error("MAC 주소 가져오기 실패:", err);
    console.log("맥주소: 더미 사용", DUMMY_MAC);
    return DUMMY_MAC;
  }
}

export function useLogin() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { goToSiteBlocked } = useNavigation();

  return useMutation<any, AxiosError, any>({
    mutationFn: async (loginData: any) => {
      const macAddress = await getMacAddress();
      return login({
        ...loginData,
        macAddress,
      });
    },

    onSuccess: (data, variables) => {
      // 토큰 설정이 필요하지 않은 응답들 (특정 코드로 구분)
      if (data?.code === "U-S005") {
        console.warn("최초 로그인으로 판단. 이메일 인증 진행");
        return;
      }

      // 토큰 정보가 있는 경우에만 설정
      if (data.data?.accessToken && data.data?.accessTokenExpiry) {
        const token = data.data.accessToken;
        const expiry = data.data.accessTokenExpiry;
        const userId = variables.userId;

        // ✅ 토큰과 userId 저장 및 헤더 설정
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userId", userId);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        authStore.setToken(token, expiry);

        console.log("✅ 로그인 성공 - Authorization 토큰 설정 완료");
        console.log("✅ userId 저장 완료:", userId);
        router.push("/");
      }
    },

    onError: async (err: any) => {
      if (err.response?.data?.code === "A005") {
        const currentMacAddress = await getMacAddress();
        const registeredMacAddress = err.response.data.data?.accountMacAddress || "알 수 없음";

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
