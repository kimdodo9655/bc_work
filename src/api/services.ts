import api from "./client";
import type { ApiResponse } from "@/api/types";

// Helper function
const extractSuccessData = <T>(response: any): T | null => {
  if (!response.data.code.includes("-S")) {
    throw new Error(`API 에러: ${response.data.message}`);
  }
  return response.data.data;
};

// Auth Services
export const login = async (payload: any) => {
  const response = await api.post<ApiResponse>("/user/login", payload);

  if (!response.data) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  if (response.data.code && response.data.code.includes("-E")) {
    throw new Error(response.data.message);
  }

  return response.data;
};

export const logout = async () => {
  const response = await api.post<ApiResponse>("/user/logout");
  return response.data;
};

export const getToken = async () => {
  const response = await api.get<ApiResponse>("/user/get-token");
  return response.data;
};

// User Security Services
export const sendAuthEmailBeforeChgPwd = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/secure-send-auth-email", data);
  return extractSuccessData(response);
};

export const verifyEmailAuthKey = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/verify-email-auth-key", data);
  return extractSuccessData(response);
};

export const sendAuthEmail = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/send-auth-email", data);
  return extractSuccessData(response);
};

export const changePassword = async (data: any) => {
  const response = await api.patch<ApiResponse>("/user/change-pwd", data);
  return extractSuccessData(response);
};

export const changeMyPassword = async (data: any) => {
  const response = await api.patch<ApiResponse>("/user/change-my-pwd", data);
  return extractSuccessData(response);
};
