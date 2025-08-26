// src/composables/useSendAuthEmail.ts
import { useMutation } from "@tanstack/vue-query";
import { sendAuthEmail } from "@/api/services/index";
import type { ChangePwdReqDto, BasicResDto } from "@/api/types/dto";

export function useSendAuthEmail() {
  return useMutation<BasicResDto, Error, ChangePwdReqDto>({
    mutationFn: sendAuthEmail,
    onSuccess: (data) => {
      console.log("📤 인증 메일 발송 성공:", data.message);
    },
    onError: (err) => {
      console.error("🚨 인증 메일 발송 실패:", err.message);
    },
  });
}
