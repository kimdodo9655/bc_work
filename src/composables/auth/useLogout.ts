import { useMutation } from "@tanstack/vue-query";
import { logout } from "@/api/services/index";
import type { LogoutResDto } from "@/api/types/dto/index";
import { useAuthStore } from "@/stores/auth"; // ✅ Pinia 상태 사용

export function useLogout() {
  const authStore = useAuthStore();

  return useMutation<LogoutResDto, Error, void>({
    mutationFn: logout,

    onSuccess: (data) => {
      console.log("✅ 로그아웃 성공:", data.message);
    },

    onError: (error) => {
      console.error("🚨 로그아웃 실패:", error.message);
    },

    onSettled: () => {
      // 성공 여부 관계없이 클라이언트 상태 정리
      authStore.clearToken();
    },
  });
}
