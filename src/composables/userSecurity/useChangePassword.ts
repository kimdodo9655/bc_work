// src/composables/useChangePassword.ts
import { useMutation } from "@tanstack/vue-query";
import { changePassword } from "@/api/services/index";
import type { ChangePwdReqDto, BasicResDto } from "@/api/types/dto";

export function useChangePassword() {
  return useMutation<BasicResDto, Error, ChangePwdReqDto>({
    mutationFn: changePassword,
    onSuccess: (data) => {
      console.log("🔒 비밀번호 변경 성공:", data.message);
    },
    onError: (err) => {
      console.error("🚨 비밀번호 변경 실패:", err.message);
    },
  });
}
