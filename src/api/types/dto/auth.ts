// 로그인 요청 DTO
export interface LoginReqDto {
  userId: string;
  password: string;
  macAddress: string;
}

// 금융기관 정보 DTO
export interface LoginFinancialDto {
  code: string;
  name: string;
  isActive: boolean;
  logo?: string;
}

// 로그인 응답 DTO
export interface LoginResDto {
  financial: LoginFinancialDto[];
  accessToken: string;
  accessTokenExpiry: number; // Long → number
  refreshToken?: string;
  loginCnt?: number;
}

// 로그아웃 응답 DTO
export interface LogoutResDto {
  status: number;
  message: string;
  data?: Record<string, any>;
}

// 토큰 갱신 응답 DTO
export interface TokenResDto {
  accessToken: string;
  accessTokenExpiry: number;
}
