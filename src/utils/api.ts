// src/utils/api.ts
// 실제 API 구조에 맞는 유틸리티

import type { AxiosResponse } from "axios";
import type { ApiResponse, PaginationMeta } from "@/api/types/dto";

/**
 * API 응답에서 data 추출 (null 체크 포함)
 */
export const extractApiData = <T>(response: AxiosResponse<ApiResponse<T>>): T | null => {
  return response.data.data;
};

/**
 * API 응답에서 title 추출 (알럿용)
 */
export const extractApiTitle = <T>(response: AxiosResponse<ApiResponse<T>>): string => {
  return response.data.title;
};

/**
 * API 응답에서 message 추출 (알럿용)
 */
export const extractApiMessage = <T>(response: AxiosResponse<ApiResponse<T>>): string => {
  return response.data.message;
};

/**
 * API 성공 여부 체크 (코드 기반) - X-S### 형태가 성공
 */
export const isApiSuccess = <T>(response: AxiosResponse<ApiResponse<T>>): boolean => {
  // response.data가 없는 경우는 일단 false (진짜 에러)
  if (!response.data) {
    return false;
  }

  const code = response.data.code;
  // code가 없는 경우도 성공으로 판단 (data null과 별개로 code도 없을 수 있음)
  if (!code || typeof code !== "string") {
    return true; // code가 없으면 성공으로 판단
  }

  // code가 있는 경우에만 -S 포함 여부로 판단
  return code.includes("-S");
};

/**
 * 성공한 API 응답에서 안전하게 데이터 추출
 */
export const extractSuccessData = <T>(response: AxiosResponse<ApiResponse<T>>): T | null => {
  if (!isApiSuccess(response)) {
    throw new Error(`API 에러: ${response.data.message}`);
  }

  // data가 null일 수 있음 (정상적인 케이스)
  return response.data.data;
};

/**
 * 알럿용 제목과 메시지 추출
 */
export const extractAlertInfo = <T>(response: AxiosResponse<ApiResponse<T>>) => {
  return {
    title: response.data.title,
    message: response.data.message,
    isSuccess: isApiSuccess(response),
  };
};

/**
 * 페이지네이션 정보 추출
 */
export const extractPaginationMeta = (data: any): PaginationMeta | null => {
  if (!data || typeof data !== "object") return null;

  const { pageSize, hasNext, currentPage, hasPrevious, totalPages } = data;

  if (typeof pageSize === "number" && typeof currentPage === "number") {
    return {
      pageSize,
      hasNext: Boolean(hasNext),
      currentPage,
      hasPrevious: Boolean(hasPrevious),
      totalPages: totalPages || 1,
    };
  }

  return null;
};

/**
 * 페이지네이션 데이터에서 목록 추출
 */
export const extractListFromPagination = (data: any, listKey: string = "list"): any[] => {
  if (!data || typeof data !== "object") return [];

  // 일반적인 키들 시도
  const possibleKeys = [listKey, "items", "data", "results"];

  for (const key of possibleKeys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  // 키를 찾지 못하면 data 객체의 첫 번째 배열 속성 반환
  for (const [_key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};
