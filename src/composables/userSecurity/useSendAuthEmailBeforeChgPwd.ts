// src/composables/useSendAuthEmailBeforeChgPwd.ts
import { useMutation } from "@tanstack/vue-query";
import { sendAuthEmailBeforeChgPwd } from "@/api/services/index";

export function useSendAuthEmailBeforeChgPwd() {
  return useMutation<any, Error, any>({
    mutationFn: sendAuthEmailBeforeChgPwd,
    onSuccess: (data) => {
      console.log("📧 인증 메일 발송 (비밀번호 변경 전) 성공:", data.message);
    },
    onError: (err) => {
      console.error("🚨 인증 메일 발송 실패:", err.message);
    },
  });
}
