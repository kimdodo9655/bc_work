import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';

// 예시 인증 함수
function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

const routes: Array<RouteRecordRaw> = [
  /**
   * "/" 에서 로그인 여부에 따라 홈/로그인으로 리다이렉트
   * - 기존 'Main' 명칭이 없어 'Home'으로 정정
   */
  {
    path: '/',
    name: 'RootRedirect',
    beforeEnter: () => {
      return isAuthenticated() ? { name: 'Home' } : { name: 'Login' };
    },
    component: { template: '<div />' },
  },

  /**
   * 대시보드 / 보호 라우트
   */
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/dashboard/DashboardHomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/estimates',
    name: 'EstimateList',
    component: () => import('@/views/dashboard/EstimateListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/estimates/create-submit',
    name: 'EstimateCreateSubmit',
    component: () => import('@/views/dashboard/EstimateCreateSubmitView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/estimates/review-withdraw',
    name: 'EstimateReviewWithdraw',
    component: () => import('@/views/dashboard/EstimateReviewWithdrawView.vue'),
    meta: { requiresAuth: true },
  },

  /**
   * 온보딩
   */
  {
    path: '/onboarding/institution-select',
    name: 'OnboardingInstitutionSelect',
    component: () => import('@/views/onboarding/InstitutionSelectView.vue'),
    meta: { requiresAuth: true },
  },

  /**
   * 비로그인 전용 레이아웃 / 인증 관련
   */
  {
    path: '/auth',
    component: () => import('@/views/auth/AuthViews.vue'),
    children: [
      { path: '', redirect: { name: 'Login' } },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'auto_logout',
        name: 'AutoLogout',
        component: () => import('@/views/auth/AutoLogoutView.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'program-install',
        name: 'ProgramInstall',
        component: () => import('@/views/auth/ProgramInstallView.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'site-blocked',
        name: 'SiteBlocked',
        component: () => import('@/views/auth/SiteBlockedView.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'verify-email-key',
        name: 'EmailVerificationKey',
        component: () => import('@/views/auth/EmailVerificationKeyView.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'password-setup',
        name: 'PasswordSetup',
        component: () => import('@/views/auth/PasswordSetupView.vue'),
        meta: { requiresAuth: false },
      },
    ],
  },

  /**
   * 404
   */
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/InvalidAccessView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * 전역 가드: 보호 라우트 접근 시 로그인 유도
 */
router.beforeEach((to) => {
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth === true);

  if (requiresAuth && !isAuthenticated()) {
    return { name: 'Login', query: { redirect: to.fullPath } };
  }

  // 로그인 상태에서 로그인 페이지 접근 시 홈으로
  if (to.name === 'Login' && isAuthenticated()) {
    return { name: 'Home' };
  }
});

export default router;
