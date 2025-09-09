// src/composables/useSendAuthEmail.ts
import { useMutation } from "@tanstack/vue-query";
import { sendAuthEmail } from "@/api/services/index";

export function useSendAuthEmail() {
  return useMutation<any, Error, any>({
    mutationFn: sendAuthEmail,
    onSuccess: (data) => {
      console.log("📤 인증 메일 발송 성공:", data.message);
    },
    onError: (err) => {
      console.error("🚨 인증 메일 발송 실패:", err.message);
    },
  });
}
