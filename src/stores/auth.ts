import { defineStore } from "pinia";
import router from "@/router";

let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken"),
    accessTokenExpiry: localStorage.getItem("accessTokenExpiry") ? parseInt(localStorage.getItem("accessTokenExpiry") || "0") : null,
  }),
  actions: {
    setToken(token: string, expiry: number) {
      this.accessToken = token;
      this.accessTokenExpiry = expiry;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("accessTokenExpiry", expiry.toString());

      this.startAutoLogout();
    },

    clearToken() {
      this.accessToken = null;
      this.accessTokenExpiry = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("accessTokenExpiry");

      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = null;

      router.push("/auth/login"); // ✅ 로그아웃 시 로그인 페이지로
    },

    startAutoLogout() {
      if (!this.accessTokenExpiry) return;

      const now = Date.now();
      const timeRemaining = this.accessTokenExpiry - now;

      if (logoutTimer) clearTimeout(logoutTimer);

      if (timeRemaining > 0) {
        logoutTimer = setTimeout(() => {
          console.warn("🔒 토큰 만료 - 자동 로그아웃 처리됨.");
          this.clearToken();
        }, timeRemaining);
      } else {
        this.clearToken();
      }
    },
  },
});
