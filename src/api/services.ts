import api from "./client";
import type { ApiResponse, LoginRequest, LoginResponse, MacAddressRequest, EmailVerificationRequest, PasswordChangeRequest, RegisterSearchRequest, EstimateWithdrawRequest, EstimateInfoRequest, EstimateDefaultInfoRequest, EstimateCreateRequest } from "./types";

// ==========================================
// Helper Functions
// ==========================================
const extractFullResponse = <T>(response: any): ApiResponse<T> => {
  if (!response.data) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }
  return response.data;
};

// ==========================================
// Auth Services
// ==========================================
export const login = async (payload: LoginRequest) => {
  const response = await api.post<ApiResponse<LoginResponse>>("/user/login", payload);
  return extractFullResponse(response);
};

export const logout = async () => {
  const response = await api.post<ApiResponse>("/user/logout");
  return extractFullResponse(response);
};

export const getToken = async () => {
  const response = await api.get<ApiResponse<LoginResponse>>("/user/get-token");
  return extractFullResponse(response);
};

// ==========================================
// User Security Services
// ==========================================
export const sendAuthEmailBeforeChgPwd = async (data: MacAddressRequest) => {
  const response = await api.post<ApiResponse>("/user/secure-send-auth-email", data);
  return extractFullResponse(response);
};

export const verifyEmailAuthKey = async (data: EmailVerificationRequest) => {
  const response = await api.post<ApiResponse>("/user/verify-email-auth-key", data);
  return extractFullResponse(response);
};

export const sendAuthEmail = async (data: MacAddressRequest) => {
  const response = await api.post<ApiResponse>("/user/send-auth-email", data);
  return extractFullResponse(response);
};

export const changePassword = async (data: PasswordChangeRequest) => {
  const response = await api.patch<ApiResponse>("/user/change-pwd", data);
  return extractFullResponse(response);
};

export const changeMyPassword = async (data: PasswordChangeRequest) => {
  const response = await api.patch<ApiResponse>("/user/change-my-pwd", data);
  return extractFullResponse(response);
};

// ==========================================
// Register Services
// ==========================================
export const searchRegister = async (data: RegisterSearchRequest) => {
  const response = await api.post<ApiResponse>("/register/search-register", data);
  return extractFullResponse(response);
};

// ==========================================
// Estimate Services
// ==========================================
export const withdrawEstimate = async (data: EstimateWithdrawRequest) => {
  const response = await api.patch<ApiResponse>("/estimate/withdraw-estimate", data);
  return extractFullResponse(response);
};

export const getEstimateInfo = async (data: EstimateInfoRequest) => {
  const response = await api.post<ApiResponse>("/estimate/get-estimate-info", data);
  return extractFullResponse(response);
};

export const getEstimateDefaultInfo = async (data: EstimateDefaultInfoRequest) => {
  const response = await api.post<ApiResponse>("/estimate/get-default-info", data);
  return extractFullResponse(response);
};

export const insEstimateInfo = async (data: EstimateCreateRequest) => {
  const response = await api.post<ApiResponse>("/estimate/ins-estimate-info", data);
  return extractFullResponse(response);
};
