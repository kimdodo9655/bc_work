// ==========================================
// src/composables/useNavigation.ts
// 라우터 네비게이션 관련 함수들을 모아놓은 컴포저블
// ==========================================
import { useRouter } from "vue-router";

export function useNavigation() {
  const router = useRouter();

  const goToRoot = () => {
    router.push("/");
  };

  // ==========================================
  // 인증 관련 네비게이션
  // ==========================================
  const goToLogin = () => {
    router.push("/auth/login");
  };

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
  // 메인 페이지 네비게이션
  // ==========================================

  const goToMain = () => {
    router.push("/main");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  // ==========================================
  // 온보딩 관련 네비게이션
  // ==========================================
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
  const goToLoginOrMain = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      goToMain();
    } else {
      goToLogin();
    }
  };

  return {
    goToRoot,

    // Auth
    goToLogin,
    goToRegister,
    goToPasswordReset,
    goToEmailAuth,

    // Main
    goToMain,
    goToDashboard,

    // Onboarding
    goToBankSelection,
    goToProfileSetup,

    // Common
    goToTerms,
    goToPrivacy,
    goTo404,

    // Utils
    goBack,
    goForward,
    replaceCurrent,
    goToWithQuery,
    goToLoginOrMain,
  };
}
