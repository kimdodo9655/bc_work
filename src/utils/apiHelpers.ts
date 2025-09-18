// src/utils/apiHelpers.ts

/* ***********************************
 * API 응답/에러 처리를 위한 공통 헬퍼 함수들
 *********************************** */

// 성공 응답 헬퍼 - 직접 객체 반환
export const getRes = (response: any) => response || {};

// 에러 응답 헬퍼 - 직접 객체 반환
export const getErr = (error: any) => error?.response?.data || {};

// 응답 로깅 헬퍼
export const logApiSuccess = (operation: string, response: any) => {
  const res = getRes(response);
  console.log(`✅ ${operation} 성공 [${res.status}] ${res.title}: ${res.message}`);
  return res;
};

// 에러 로깅 헬퍼
export const logApiError = (operation: string, error: any) => {
  const err = getErr(error);
  console.error(`🚨 ${operation} 실패 [${err.status || "Unknown"}] ${err.title || "Error"}: ${err.message || error.message}`);
  return err;
};
