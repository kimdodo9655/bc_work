import { useMutation } from "@tanstack/vue-query";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNavigation } from "./useNavigation";
import * as authAPI from "@/api";
import api from "@/api/client";
import type { AxiosError } from "axios";
import { useUI } from "@/composables/useUI";
import { logApiSuccess, logApiError } from "@/utils/apiHelpers";

// ==========================================
// MAC Address 관련 함수들 (useAuth 전용)
// ==========================================
const DUMMY_MAC = "00:00:00:00:00:00";

const isValidMac = (mac: string) => /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac.trim());

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = 1200) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const getMacAddress = async (): Promise<string> => {
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
};

export function useAuth() {
  const router = useRouter();
  const authStore = useAuthStore();
  const ui = useUI();
  const { goToSiteBlocked } = useNavigation();

  // ==========================================
  // 로그인
  // ==========================================
  const login = useMutation<any, AxiosError, any>({
    mutationFn: async (loginData: any) => {
      const macAddress = await getMacAddress();
      return authAPI.login({ ...loginData, macAddress });
    },
    onSuccess: (response, variables) => {
      const res = logApiSuccess("로그인", response);

      // ✅ 이메일 인증 미진행
      if (res.code === "U-S005") {
        ui.alert(res.title, res.message);
        return;
      }

      // ✅ 비밀번호 유효기간 초과
      if (res.code === "U-S006") {
        return;
      }

      if (res.data?.accessToken && res.data?.accessTokenExpiry) {
        const { accessToken, accessTokenExpiry } = res.data;
        const userId = variables.userId;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userId", userId);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        authStore.setToken(accessToken, accessTokenExpiry);

        console.log("✅ Authorization 토큰 설정 완료");
        console.log("✅ userId 저장 완료:", userId);

        router.push("/");
      }
    },
    onError: async (error: any) => {
      const err = logApiError("로그인", error);

      if (err.code === "A-E005") {
        const currentMacAddress = await getMacAddress();
        const registeredMacAddress = err.data?.accountMacAddress || "알 수 없음";

        ui.alert(err.title, err.message, () => {
          goToSiteBlocked({
            currentMacAddress,
            registeredMacAddress,
            errorMessage: err.message,
          });
        });
        return;
      }
    },
  });

  // ==========================================
  // 로그아웃
  // ==========================================
  const logout = useMutation<any, Error, void>({
    mutationFn: authAPI.logout,
    onSuccess: (response) => {
      logApiSuccess("로그아웃", response);
    },
    onError: (error) => {
      logApiError("로그아웃", error);
    },
    onSettled: () => authStore.clearToken(),
  });

  // ==========================================
  // 토큰 갱신
  // ==========================================
  const renewToken = useMutation<any, Error>({
    mutationFn: authAPI.getToken,
    onSuccess: (response) => {
      const res = logApiSuccess("토큰 갱신", response);

      if (res.data?.accessToken && res.data?.accessTokenExpiry) {
        const { accessToken, accessTokenExpiry } = res.data;
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        authStore.setToken(accessToken, accessTokenExpiry);
      }
    },
    onError: (error) => {
      logApiError("토큰 갱신", error);
    },
  });

  // ==========================================
  // 비밀번호 변경 전 인증 메일 발송
  // ==========================================
  const sendSecureEmail = useMutation<any, Error, any>({
    mutationFn: authAPI.sendAuthEmailBeforeChgPwd,
    onSuccess: (response) => {
      logApiSuccess("📧 인증 메일 발송", response);
    },
    onError: (error) => {
      logApiError("📧 인증 메일 발송", error);
    },
  });

  // 이메일 인증키 검증
  const verifyEmailKey = useMutation<any, Error, any>({
    mutationFn: authAPI.verifyEmailAuthKey,
    onSuccess: (response) => {
      logApiSuccess("🔑 이메일 인증키 검증", response);
    },
    onError: (error) => {
      logApiError("🔑 이메일 인증키 검증", error);
    },
  });

  // 이메일 재발송
  const resendEmail = useMutation<any, Error, any>({
    mutationFn: authAPI.sendAuthEmail,
    onSuccess: (response) => {
      logApiSuccess("📤 인증 메일 재발송", response);
    },
    onError: (error) => {
      logApiError("📤 인증 메일 재발송", error);
    },
  });

  // 비밀번호 변경
  const changePassword = useMutation<any, Error, any>({
    mutationFn: authAPI.changePassword,
    onSuccess: (response) => {
      logApiSuccess("🔒 비밀번호 변경", response);
    },
    onError: (error) => {
      logApiError("🔒 비밀번호 변경", error);
    },
  });

  // 로그인 후 비밀번호 변경
  const changeMyPassword = useMutation<any, Error, any>({
    mutationFn: authAPI.changeMyPassword,
    onSuccess: (response) => {
      logApiSuccess("🛡️ 로그인 후 비밀번호 변경", response);
    },
    onError: (error) => {
      logApiError("🛡️ 비밀번호 변경", error);
    },
  });

  // 등기 견적 관리 리스트 조회
  const searchRegister = useMutation<any, Error, any>({
    mutationFn: authAPI.searchRegister,
    onSuccess: (response) => {
      logApiSuccess("📋 견적서 조회", response);
    },
    onError: (error) => {
      logApiError("📋 견적서 조회", error);
    },
  });

  // 견적서 철회
  const withdrawEstimate = useMutation<any, Error, { estimateId: number }>({
    mutationFn: authAPI.withdrawEstimate,
    onSuccess: (response) => {
      logApiSuccess("🧹 견적 철회", response);
      ui.success("견적이 철회되었습니다.");
    },
    onError: (error) => {
      const err = logApiError("🧹 견적 철회", error);
      ui.error(err.message || "견적 철회에 실패했습니다.");
    },
  });

  // 견적서 작성정보 조회 (단건)
  const getEstimateInfo = useMutation<any, Error, { registerId: number }>({
    mutationFn: authAPI.getEstimateInfo,
    onSuccess: (response) => {
      const res = logApiSuccess("📄 견적 기본정보 조회", response);
      console.debug("📦 estimateInfo:", res.data);
    },
    onError: (error) => {
      logApiError("📄 견적 기본정보 조회", error);
    },
  });

  // 견적서 기본 정보 조회
  const getEstimateDefaultInfo = useMutation<
    any,
    Error,
    {
      registerId: number;
      registerType: string;
    }
  >({
    mutationFn: authAPI.getEstimateDefaultInfo,
    onSuccess: (response) => {
      const res = logApiSuccess("⚙️ 견적 기본값 조회", response);
      console.debug("⚙️ defaults:", res.data);
    },
    onError: (error) => {
      logApiError("⚙️ 견적 기본값 조회", error);
    },
  });

  // 견적서 제출
  const insEstimateInfo = useMutation<any, Error, any>({
    mutationFn: authAPI.insEstimateInfo,
    onSuccess: (response) => {
      logApiSuccess("📝 견적 등록", response);
      ui.success("견적이 등록되었습니다.");
    },
    onError: (error) => {
      const err = logApiError("📝 견적 등록", error);
      ui.error(err.message || "견적 등록에 실패했습니다.");
    },
  });

  return {
    // Mutations
    login,
    logout,
    renewToken,
    sendSecureEmail,
    verifyEmailKey,
    resendEmail,
    changePassword,
    changeMyPassword,
    searchRegister,
    // 신규(Estimate)
    withdrawEstimate,
    getEstimateInfo,
    getEstimateDefaultInfo,
    insEstimateInfo,

    // Loading states
    isLoggingIn: login.isPending,
    isLoggingOut: logout.isPending,
    isRenewing: renewToken.isPending,

    // Error states
    loginError: login.error,
  };
}
