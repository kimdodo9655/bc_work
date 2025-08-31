// ==========================================
// src/composables/useNavigation.ts
// 라우터 네비게이션 관련 함수들을 모아놓은 컴포저블 (완전판)
// ==========================================
import { useRouter } from "vue-router";

export function useNavigation() {
  const router = useRouter();

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

  const goToSiteBlocked = () => {
    router.push("/auth/site-blocked");
  };

  const goToEmailVerificationKey = () => {
    router.push("/auth/verify-email-key");
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

  // 기존 함수들도 유지
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

  // 쿼리 파라미터와 함께 이동
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

  // 기존 함수도 유지
  const goToLoginOrMain = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      goToMain();
    } else {
      goToLogin();
    }
  };

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
