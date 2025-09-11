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

export const searchRegister = async (data: any) => {
  const response = await api.post<ApiResponse>("/register/search-register", data);
  return extractFullResponse(response);
};

/* ================================
 *  Estimate Services (신규 추가)
 * ================================ */

// 견적 철회
export const withdrawEstimate = async (data: { estimateId: number }) => {
  const response = await api.patch<ApiResponse>("/estimate/withdraw-estimate", data);
  return extractFullResponse(response);
};

// 견적 기본정보 조회 (등기신청번호 기반)
export const getEstimateInfo = async (data: { registerApplicationNumber: string }) => {
  const response = await api.post<ApiResponse>("/estimate/get-estimate-info", data);
  return extractFullResponse(response);
};

export const getEstimateDefaultInfo = async (data: {
  registerApplicationNumber: string;
  registerType: "transfer" | string; // 스펙상 "transfer" (소유권이전) 사용
}) => {
  const response = await api.post<ApiResponse>("/estimate/get-default-info", data);
  return extractFullResponse(response);
};

// 견적 입력(등록)
export const insEstimateInfo = async (data: {
  registerApplicationNumber: string;
  registerProgressName: string; // "전자등기"
  registerTypeId: number; // 예: 1(소유권이전)
  isTermsAgreed: boolean;
  maintenanceFee: {
    baseFee: number;
    additionalFee: number;
    causeCertFee: number;
    publicChargeFee: number;
    bondSaleFee: number;
    realEstateReportFee: number;
    reimbursementFee: number;
    certificationFee: number;
    confirmationFee: number;
    otherCosts: number;
    vat: number;
    totalFee: number;
  };
  utilityBills: {
    acquisitionTax: number;
    registerLicenseTax: number;
    educationTax: number;
    ruralSpecialTax: number;
    stampTax: number;
    applicationFee: number;
    totalPublicCharges: number;
  };
}) => {
  const response = await api.post<ApiResponse>("/estimate/ins-estimate-info", data);
  return extractFullResponse(response);
};
