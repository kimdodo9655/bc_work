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
 * API 성공 여부 체크 (코드 기반)
 */
export const isApiSuccess = <T>(response: AxiosResponse<ApiResponse<T>>): boolean => {
  return response.data.code.startsWith("S");
};

/**
 * 성공한 API 응답에서 안전하게 데이터 추출
 */
export const extractSuccessData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!isApiSuccess(response)) {
    throw new Error(`API 에러: ${response.data.message}`);
  }

  const data = response.data.data;
  if (data === null) {
    throw new Error("응답 데이터가 null입니다.");
  }

  return data;
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
