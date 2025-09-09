// src/composables/useChangeMyPassword.ts
import { useMutation } from "@tanstack/vue-query";
import { changeMyPassword } from "@/api/services/index";

export function useChangeMyPassword() {
  return useMutation<any, Error, any>({
    mutationFn: changeMyPassword,
    onSuccess: (data) => {
      console.log("🛡️ 로그인 후 비밀번호 변경 성공:", data.message);
    },
    onError: (err) => {
      console.error("🚨 비밀번호 변경 실패 (로그인 후):", err.message);
    },
  });
}
