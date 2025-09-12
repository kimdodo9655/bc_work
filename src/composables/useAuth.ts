import { useMutation } from "@tanstack/vue-query";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNavigation } from "./useNavigation";
import * as authAPI from "@/api";
import api from "@/api/client";
import type { AxiosError } from "axios";
import { useUI } from "@/composables/useUI";

// ==========================================
// Response Helper Functions
// ==========================================

// 성공 응답 헬퍼 - 직접 객체 반환
const getRes = (response: any) => response || {};

// 에러 응답 헬퍼 - 직접 객체 반환
const getErr = (error: any) => error?.response?.data || {};

// ==========================================
// MAC Address 가져오기
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
      const res = getRes(response);
      console.log(`📊 [${res.status}] ${res.title}: ${res.message}`);

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

        console.log("✅ 로그인 성공 - Authorization 토큰 설정 완료");
        console.log("✅ userId 저장 완료:", userId);

        router.push("/");
      }
    },
    onError: async (error: any) => {
      const err = getErr(error);
      console.error(`🚨 로그인 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);

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
      const res = getRes(response);
      console.log(`✅ 로그아웃 성공 [${res.status}] ${res.title}: ${res.message}`);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 로그아웃 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);
    },
    onSettled: () => authStore.clearToken(),
  });

  // ==========================================
  // 토큰 갱신
  // ==========================================
  const renewToken = useMutation<any, Error>({
    mutationFn: authAPI.getToken,
    onSuccess: (response) => {
      const res = getRes(response);

      if (res.data?.accessToken && res.data?.accessTokenExpiry) {
        const { accessToken, accessTokenExpiry } = res.data;
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        authStore.setToken(accessToken, accessTokenExpiry);
        console.log(`🔁 토큰 갱신 완료 [${res.status}] ${res.title}: ${res.message}`);
      }
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 토큰 갱신 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);
    },
  });

  // ==========================================
  // 비밀번호 변경 전 인증 메일 발송
  // ==========================================
  const sendSecureEmail = useMutation<any, Error, any>({
    mutationFn: authAPI.sendAuthEmailBeforeChgPwd,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`📧 인증 메일 발송 성공 [${res.status}] ${res.title}: ${res.message}`);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 인증 메일 발송 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);
    },
  });

  // 이메일 인증키 검증
  const verifyEmailKey = useMutation<any, Error, any>({
    mutationFn: authAPI.verifyEmailAuthKey,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`🔑 이메일 인증키 검증 성공 [${res.status}] ${res.title}: ${res.message}`);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 이메일 인증키 검증 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);
    },
  });

  // 이메일 재발송
  const resendEmail = useMutation<any, Error, any>({
    mutationFn: authAPI.sendAuthEmail,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`📤 인증 메일 발송 성공 [${res.status}] ${res.title}: ${res.message}`);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 인증 메일 발송 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);
    },
  });

  // 비밀번호 변경
  const changePassword = useMutation<any, Error, any>({
    mutationFn: authAPI.changePassword,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`🔒 비밀번호 변경 성공 [${res.status}] ${res.title}: ${res.message}`);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 비밀번호 변경 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);
    },
  });

  // 로그인 후 비밀번호 변경
  const changeMyPassword = useMutation<any, Error, any>({
    mutationFn: authAPI.changeMyPassword,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`🛡️ 로그인 후 비밀번호 변경 성공 [${res.status}] ${res.title}: ${res.message}`);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 비밀번호 변경 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);
    },
  });

  // 등기 견적 관리 리스트 조회
  const searchRegister = useMutation<any, Error, any>({
    mutationFn: authAPI.searchRegister,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`견적서 조회 [${res.status}] ${res.title}: ${res.message}`);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 견적서 조회 실패 [${err.status}] ${err.title}: ${err.message || error.message}`);
    },
  });

  // 견적서 철회
  const withdrawEstimate = useMutation<any, Error, { estimateId: number }>({
    mutationFn: authAPI.withdrawEstimate,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`🧹 견적 철회 성공 [${res.status}] ${res.title}: ${res.message}`);
      ui.alert?.("title", "견적이 철회되었습니다.");
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 견적 철회 실패 [${err.status}] ${err.title}: ${err.message || (error as any).message}`);
      ui.alert?.("견적 철회 실패", err.message || "알 수 없는 오류");
    },
  });

  // 견적서 작성정보 조회 (단건)
  const getEstimateInfo = useMutation<any, Error, { registerId: number }>({
    mutationFn: authAPI.getEstimateInfo,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`📄 견적 기본정보 조회 성공 [${res.status}] ${res.title}: ${res.message}`);
      console.debug("📦 estimateInfo:", res.data);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 견적 기본정보 조회 실패 [${err.status}] ${err.title}: ${err.message || (error as any).message}`);
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
      const res = getRes(response);
      console.log(`⚙️ 견적 기본값 조회 성공 [${res.status}] ${res.title}: ${res.message}`);
      console.debug("⚙️ defaults:", res.data);
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 견적 기본값 조회 실패 [${err.status}] ${err.title}: ${err.message || (error as any).message}`);
    },
  });

  // 견적서 제출
  const insEstimateInfo = useMutation<any, Error, any>({
    mutationFn: authAPI.insEstimateInfo,
    onSuccess: (response) => {
      const res = getRes(response);
      console.log(`📝 견적 등록 성공 [${res.status}] ${res.title}: ${res.message}`);
      ui.alert?.("title", "견적이 등록되었습니다.");
    },
    onError: (error) => {
      const err = getErr(error);
      console.error(`🚨 견적 등록 실패 [${err.status}] ${err.title}: ${err.message || (error as any).message}`);
      ui.alert?.("견적 등록 실패", err.message || "알 수 없는 오류");
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
