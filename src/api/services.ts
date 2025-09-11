import api from "./client";
import type { ApiResponse } from "@/api/types";

// Helper function
const extractFullResponse = <T>(response: any): ApiResponse<T> => {
  if (!response.data) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }
  return response.data;
};

// Auth Services
export const login = async (payload: any) => {
  const response = await api.post<ApiResponse>("/user/login", payload);
  return extractFullResponse(response);
};

export const logout = async () => {
  const response = await api.post<ApiResponse>("/user/logout");
  return extractFullResponse(response);
};

export const getToken = async () => {
  const response = await api.get<ApiResponse>("/user/get-token");
  return extractFullResponse(response);
};

// User Security Services
export const sendAuthEmailBeforeChgPwd = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/secure-send-auth-email", data);
  return extractFullResponse(response);
};

export const verifyEmailAuthKey = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/verify-email-auth-key", data);
  return extractFullResponse(response);
};

export const sendAuthEmail = async (data: any) => {
  const response = await api.post<ApiResponse>("/user/send-auth-email", data);
  return extractFullResponse(response);
};

export const changePassword = async (data: any) => {
  const response = await api.patch<ApiResponse>("/user/change-pwd", data);
  return extractFullResponse(response);
};

export const changeMyPassword = async (data: any) => {
  const response = await api.patch<ApiResponse>("/user/change-my-pwd", data);
  return extractFullResponse(response);
};
