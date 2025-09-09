// src/types/dto.ts
// 베이직 공통 타입만 정의 (기존 기능용)

// ==========================================
// 공통 API 응답 타입
// ==========================================
export interface ApiResponse<T = any> {
  status: number;
  code: string;
  title: string;
  message: string;
  data: T | null;
}

// ==========================================
// 페이지네이션 관련 타입
// ==========================================
export interface PaginationMeta {
  pageSize: number;
  hasNext: boolean;
  currentPage: number;
  hasPrevious: boolean;
  totalPages: number;
}

// 페이지네이션 요청 파라미터
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  [key: string]: any; // 검색, 필터 등 추가 파라미터
}

// ==========================================
// 공통 요청 파라미터 타입
// ==========================================
export interface BaseParams {
  [key: string]: any;
}
