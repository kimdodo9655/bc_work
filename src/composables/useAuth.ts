import { useMutation } from "@tanstack/vue-query";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNavigation } from "./useNavigation";
import * as authAPI from "@/api";
import api from "@/api/client";
import type { AxiosError } from "axios";

// MAC Address Utilities (기존 로직 통합)
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
  const { goToSiteBlocked } = useNavigation();

  // 로그인
  const login = useMutation<any, AxiosError, any>({
    mutationFn: async (loginData: any) => {
      const macAddress = await getMacAddress();
      return authAPI.login({ ...loginData, macAddress });
    },
    onSuccess: (data, variables) => {
      if (data?.code === "U-S005") {
        console.warn("최초 로그인으로 판단. 이메일 인증 진행");
        return;
      }

      if (data.data?.accessToken && data.data?.accessTokenExpiry) {
        const token = data.data.accessToken;
        const expiry = data.data.accessTokenExpiry;
        const userId = variables.userId;

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

  // 로그아웃
  const logout = useMutation<any, Error, void>({
    mutationFn: authAPI.logout,
    onSuccess: () => console.log("✅ 로그아웃 성공"),
    onError: (error) => console.error("🚨 로그아웃 실패:", error.message),
    onSettled: () => authStore.clearToken(),
  });

  // 토큰 갱신
  const renewToken = useMutation<any, Error>({
    mutationFn: authAPI.getToken,
    onSuccess: (data) => {
      if (data.data?.accessToken && data.data?.accessTokenExpiry) {
        const { accessToken, accessTokenExpiry } = data.data;
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        authStore.setToken(accessToken, accessTokenExpiry);
        console.log("🔁 토큰 갱신 완료:", accessToken);
      }
    },
    onError: (err) => console.error("🚨 토큰 갱신 실패:", err.message),
  });

  // 비밀번호 변경 전 인증 메일 발송
  const sendSecureEmail = useMutation<any, Error, any>({
    mutationFn: authAPI.sendAuthEmailBeforeChgPwd,
    onSuccess: (data) => console.log("📧 인증 메일 발송 (비밀번호 변경 전) 성공:", data?.message),
    onError: (err) => console.error("🚨 인증 메일 발송 실패:", err.message),
  });

  // 이메일 인증키 검증
  const verifyEmailKey = useMutation<any, Error, any>({
    mutationFn: authAPI.verifyEmailAuthKey,
    onSuccess: (data) => console.log("🔑 이메일 인증키 검증 성공:", data?.message),
    onError: (err) => console.error("🚨 이메일 인증키 검증 실패:", err.message),
  });

  // 이메일 재발송
  const resendEmail = useMutation<any, Error, any>({
    mutationFn: authAPI.sendAuthEmail,
    onSuccess: (data) => console.log("📤 인증 메일 발송 성공:", data?.message),
    onError: (err) => console.error("🚨 인증 메일 발송 실패:", err.message),
  });

  // 비밀번호 변경
  const changePassword = useMutation<any, Error, any>({
    mutationFn: authAPI.changePassword,
    onSuccess: (data) => console.log("🔒 비밀번호 변경 성공:", data?.message),
    onError: (err) => console.error("🚨 비밀번호 변경 실패:", err.message),
  });

  // 로그인 후 비밀번호 변경
  const changeMyPassword = useMutation<any, Error, any>({
    mutationFn: authAPI.changeMyPassword,
    onSuccess: (data) => console.log("🛡️ 로그인 후 비밀번호 변경 성공:", data?.message),
    onError: (err) => console.error("🚨 비밀번호 변경 실패 (로그인 후):", err.message),
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

    // Loading states
    isLoggingIn: login.isPending,
    isLoggingOut: logout.isPending,
    isRenewing: renewToken.isPending,

    // Error states
    loginError: login.error,
  };
}
