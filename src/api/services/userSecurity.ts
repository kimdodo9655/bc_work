import api from "@/api/client/axios";
import type { ApiResponse } from "@/api/types/dto";
import { extractSuccessData } from "@/utils/api";

// 비밀번호 변경 전 인증 이메일 발송
export const sendAuthEmailBeforeChgPwd = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/secure-send-auth-email", data);
  return extractSuccessData(response);
};

// 이메일 인증키 검증
export const verifyEmailAuthKey = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/verify-email-auth-key", data);
  return extractSuccessData(response);
};

// 인증 메일 발송 (일반)
export const sendAuthEmail = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/send-auth-email", data);
  return extractSuccessData(response);
};

// 비밀번호 변경
export const changePassword = async (data: any) => {
  const response = await api.patch<ApiResponse>("/user/change-pwd", data);
  return extractSuccessData(response);
};

// 로그인 이후 비밀번호 변경
export const changeMyPassword = async (data: any) => {
  const response = await api.patch<ApiResponse>("/user/change-my-pwd", data);
  return extractSuccessData(response);
};
