// src/composables/useVerifyEmailAuthKey.ts
import { useMutation } from "@tanstack/vue-query";
import { verifyEmailAuthKey } from "@/api/services/index";

export function useVerifyEmailAuthKey() {
  return useMutation<any, Error, any>({
    mutationFn: verifyEmailAuthKey,
    onSuccess: (data) => {
      console.log("🔑 이메일 인증키 검증 성공:", data.message);
    },
    onError: (err) => {
      console.error("🚨 이메일 인증키 검증 실패:", err.message);
    },
  });
}
