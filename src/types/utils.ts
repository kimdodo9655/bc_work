// src/types/utils.ts

// 고급 유틸리티 타입들
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// Branded Types로 타입 안전성 강화
export type MacAddress = string & { readonly __brand: "MacAddress" };
export type UserId = string & { readonly __brand: "UserId" };
export type EmailAddress = string & { readonly __brand: "EmailAddress" };

// Branded Type 생성 헬퍼
export const createMacAddress = (value: string): MacAddress => {
  if (!/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(value)) {
    throw new Error("Invalid MAC address format");
  }
  return value as MacAddress;
};

export const createUserId = (value: string): UserId => {
  if (!value || value.trim().length === 0) {
    throw new Error("Invalid user ID");
  }
  return value.trim() as UserId;
};

export const createEmailAddress = (value: string): EmailAddress => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error("Invalid email address format");
  }
  return value as EmailAddress;
};

// Discriminated Unions로 상태 관리 개선
export type AsyncState<T, E = Error> = { status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: E };

// API 응답 타입 개선
export type ApiResponse<T> = T extends void ? { status: number; message: string; code: string; title: string } : { status: number; message: string; code: string; title: string; data: T };

export type InferApiData<T> = T extends ApiResponse<infer U> ? U : never;

// 함수 오버로딩을 위한 타입
export interface TypedApiClient {
  get<T = unknown>(url: string): Promise<ApiResponse<T>>;
  get<T = unknown>(url: string, config: RequestConfig): Promise<ApiResponse<T>>;
  post<T = unknown, D = any>(url: string, data?: D): Promise<ApiResponse<T>>;
  post<T = unknown, D = any>(url: string, data: D, config: RequestConfig): Promise<ApiResponse<T>>;
  put<T = unknown, D = any>(url: string, data?: D): Promise<ApiResponse<T>>;
  patch<T = unknown, D = any>(url: string, data?: D): Promise<ApiResponse<T>>;
  delete<T = unknown>(url: string): Promise<ApiResponse<T>>;
}

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}
