export interface ApiResponse<T = any> {
  status: number;
  code: string;
  title: string;
  message: string;
  data: T | null;
}

export interface PaginationMeta {
  pageSize: number;
  hasNext: boolean;
  currentPage: number;
  hasPrevious: boolean;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

// UI 관련 타입
export interface AlertInfo {
  title: string;
  message: string;
  isSuccess: boolean;
}

// API 응답에서 알럿 정보 추출 헬퍼
export const extractAlertInfo = <T>(response: { data: ApiResponse<T> }): AlertInfo => {
  const { title, message, code } = response.data;
  const codeStr = typeof code === "string" ? code : "";
  return {
    title: title || "",
    message: message || "",
    isSuccess: codeStr.startsWith("S-"),
  };
};

// ==========================================
// 도메인별 요청/응답 타입 정의
// ==========================================

// Auth 관련 타입
export interface LoginRequest {
  userId: string;
  password: string;
  macAddress: string;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiry: number;
}

export interface MacAddressRequest {
  macAddress: string;
}

export interface EmailVerificationRequest {
  macAddress: string;
  emailAuthKey: string;
}

export interface PasswordChangeRequest {
  newPassword: string;
  macAddress: string;
}

// Register 관련 타입
export interface RegisterSearchRequest {
  page: number;
  size: number;
  registerType?: string;
  lot?: string | null;
  requestedStartDate?: string;
  requestedEndDate?: string;
  receivedStartDate?: string;
  receivedEndDate?: string;
  integratedText?: string | null;
  estimateStatusIdCode?: string | null;
  estimateWrittenCode?: string | null;
  estimateSelectionCode?: string | null;
}

// Estimate 관련 타입
export interface EstimateWithdrawRequest {
  estimateId: number;
}

export interface EstimateInfoRequest {
  registerId: number;
}

export interface EstimateDefaultInfoRequest {
  registerId: number;
  registerType: string;
}

export interface MaintenanceFee {
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
}

export interface UtilityBills {
  acquisitionTax: number;
  registerLicenseTax: number;
  educationTax: number;
  ruralSpecialTax: number;
  stampTax: number;
  applicationFee: number;
  totalPublicCharges: number;
}

export interface EstimateCreateRequest {
  registerApplicationNumber: string;
  registerProgressName: string;
  registerTypeId: number;
  isTermsAgreed: boolean;
  maintenanceFee: MaintenanceFee;
  utilityBills: UtilityBills;
}
