import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

// 예시 인증 함수
function isAuthenticated() {
  return !!localStorage.getItem("accessToken");
}

const routes: Array<RouteRecordRaw> = [
  {
    // "/"에서 로그인 여부에 따라 리다이렉트
    path: "/",
    name: "RootRedirect",
    // Vue Router 4에선 next대신 반환해도 됩니다.
    beforeEnter: () => {
      return isAuthenticated() ? { name: "Main" } : { name: "Login" };
    },
    component: { template: "<div />" },
  },
  {
    path: "/main",
    name: "Main",
    component: () => import("@/views/main/Main.vue"),
    meta: { requiresAuth: true },
  },
  {
    // 비로그인 상태 전용 Layout
    path: "/auth",
    component: () => import("@/views/auth/AuthViews.vue"),
    children: [
      {
        // Login
        path: "",
        redirect: { name: "Login" },
      },
      {
        // Login
        path: "login",
        name: "Login",
        component: () => import("@/views/auth/Login.vue"),
        meta: { requiresAuth: false },
      },
    ],
  },

  // 404
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/common/PageNotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// (옵션) 전역 가드: 보호 라우트 접근 시 로그인 유도
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: "Login", query: { redirect: to.fullPath } };
  }
  if (to.name === "Login" && isAuthenticated()) {
    return { name: "Main" };
  }
});

export default router;
