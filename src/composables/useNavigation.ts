// ==========================================
// src/composables/useNavigation.ts
// 라우터 네비게이션 관련 함수들을 모아놓은 컴포저블 (세션 보관/정리 포함)
// ==========================================
import { useRouter } from "vue-router";

interface MacAddressErrorData {
  currentMacAddress: string;
  registeredMacAddress: string;
  errorMessage: string;
}

interface EmailVerificationData {
  code?: string;
  macAddress?: string;
}

export function useNavigation() {
  const router = useRouter();

  // ====================== 공통 유틸/가드 ======================
  const EV_KEY = "emailVerify"; // EmailVerificationKey 세션키
  const SB_KEY = "siteBlocked"; // SiteBlocked 세션키

  // HMR 대비: 동일 가드가 중복 설치되지 않도록 전역 플래그 사용
  let guardInstalled = (window as any).__NAV_GUARD_INSTALLED__ === true;

  function saveSession(key: string, v: any) {
    try {
      if (v && Object.values(v).some(Boolean)) {
        sessionStorage.setItem(key, JSON.stringify(v));
      } else {
        sessionStorage.removeItem(key);
      }
    } catch {
      sessionStorage.removeItem(key);
    }
  }

  function clearSensitive(key?: string) {
    if (key) sessionStorage.removeItem(key);
    else {
      sessionStorage.removeItem(EV_KEY);
      sessionStorage.removeItem(SB_KEY);
    }
  }

  function getNavType(): PerformanceNavigationTiming["type"] | "unknown" {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return nav?.type ?? "unknown";
  }
  // ===========================================================

  // ==========================================
  // 루트 & 기본 네비게이션
  // ==========================================
  const goToRoot = () => {
    router.push("/");
  };

  const goToHome = () => {
    router.push("/home");
  };

  // ==========================================
  // 인증 관련 네비게이션
  // ==========================================
  const goToLogin = () => {
    router.push("/auth/login");
  };

  const goToAutoLogout = () => {
    router.push("/auth/auto_logout");
  };

  const goToProgramInstall = () => {
    router.push("/auth/program-install");
  };

  // 맥주소 불일치 페이지로 이동 (민감값 세션 저장 → 깨끗한 URL 이동)
  const goToSiteBlocked = (macErrorData?: MacAddressErrorData) => {
    if (macErrorData) {
      saveSession(SB_KEY, {
        currentMacAddress: macErrorData.currentMacAddress,
        registeredMacAddress: macErrorData.registeredMacAddress,
        errorMessage: macErrorData.errorMessage,
      });
    }
    router.push({ name: "SiteBlocked" }); // 쿼리 없이 이동
  };

  // 이메일 인증키 페이지로 이동 (민감값 세션 저장 → 깨끗한 URL 이동)
  const goToEmailVerificationKey = (emailVerificationData?: EmailVerificationData) => {
    if (emailVerificationData) {
      saveSession(EV_KEY, emailVerificationData);
    }
    router.push({ name: "EmailVerificationKey" }); // 쿼리 없이 이동
  };

  const goToPasswordSetup = () => {
    router.push("/auth/password-setup");
  };

  // 기존 함수들도 유지
  const goToRegister = () => {
    router.push("/auth/register");
  };

  const goToPasswordReset = () => {
    router.push("/auth/password-reset");
  };

  const goToEmailAuth = () => {
    router.push("/auth/email-auth");
  };

  // ==========================================
  // 대시보드 관련 네비게이션
  // ==========================================
  const goToEstimateList = () => {
    router.push("/estimates");
  };

  const goToEstimateCreateSubmit = () => {
    router.push("/estimates/create-submit");
  };

  const goToEstimateReviewWithdraw = () => {
    router.push("/estimates/review-withdraw");
  };

  // 기존 함수들
  const goToMain = () => {
    router.push("/main");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  // ==========================================
  // 온보딩 관련 네비게이션
  // ==========================================
  const goToInstitutionSelect = () => {
    router.push("/onboarding/institution-select");
  };

  const goToBankSelection = () => {
    router.push("/onboarding/select-bank");
  };

  const goToProfileSetup = () => {
    router.push("/onboarding/profile-setup");
  };

  // ==========================================
  // 공통 페이지 네비게이션
  // ==========================================
  const goToTerms = () => {
    router.push("/common/terms-of-service");
  };

  const goToPrivacy = () => {
    router.push("/common/privacy-policy");
  };

  const goTo404 = () => {
    router.push("/404");
  };

  const goToInvalidAccess = () => {
    router.push("/:pathMatch(.*)*");
  };

  // ==========================================
  // 유틸리티 네비게이션
  // ==========================================
  const goBack = () => {
    router.back();
  };

  const goForward = () => {
    router.forward();
  };

  const replaceCurrent = (path: string) => {
    router.replace(path);
  };

  // 쿼리 파라미터와 함께 이동 (필요시)
  const goToWithQuery = (path: string, query: Record<string, any>) => {
    router.push({ path, query });
  };

  // 조건부 라우팅
  const goToLoginOrHome = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      goToHome();
    } else {
      goToLogin();
    }
  };

  const goToLoginOrMain = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      goToMain();
    } else {
      goToLogin();
    }
  };

  // ================= 이탈 정리 가드 설치 =================
  if (!guardInstalled) {
    (window as any).__NAV_GUARD_INSTALLED__ = true;
    guardInstalled = true;

    // 외부/탭 이탈: 새로고침(reload)만 예외적으로 보존
    window.addEventListener("pagehide", () => {
      if (getNavType() !== "reload") {
        clearSensitive(); // email/site 모두 비움
      }
    });

    // SPA 내 라우팅 전환: 대상 라우트를 벗어나면 해당 키만 삭제
    router.afterEach((to) => {
      if (to.name !== "EmailVerificationKey") clearSensitive(EV_KEY);
      if (to.name !== "SiteBlocked") clearSensitive(SB_KEY);
    });
  }
  // =====================================================

  return {
    // Root & Basic
    goToRoot,
    goToHome,

    // Auth
    goToLogin,
    goToAutoLogout,
    goToProgramInstall,
    goToSiteBlocked,
    goToEmailVerificationKey,
    goToPasswordSetup,
    goToRegister,
    goToPasswordReset,
    goToEmailAuth,

    // Dashboard
    goToEstimateList,
    goToEstimateCreateSubmit,
    goToEstimateReviewWithdraw,
    goToMain,
    goToDashboard,

    // Onboarding
    goToInstitutionSelect,
    goToBankSelection,
    goToProfileSetup,

    // Common
    goToTerms,
    goToPrivacy,
    goTo404,
    goToInvalidAccess,

    // Utils
    goBack,
    goForward,
    replaceCurrent,
    goToWithQuery,
    goToLoginOrHome,
    goToLoginOrMain,
  };
}
