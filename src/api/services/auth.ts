import api from "@/api/client/axios";
import type { ApiResponse } from "@/api/types/dto";

// 로그인 (any 타입 사용) - extractSuccessData 사용하지 않고 직접 응답 반환
export const login = async (payload: any) => {
  const response = await api.post<ApiResponse>("/user/login", payload);

  // U-S005 같은 특수 케이스를 위해 response.data를 직접 반환
  if (!response.data) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  // 에러 코드 체크
  if (response.data.code && response.data.code.includes("-E")) {
    throw new Error(response.data.message);
  }

  return response.data;
};

// 로그아웃
export const logout = async () => {
  const response = await api.post<ApiResponse>("/user/logout");
  return response.data;
};

// 토큰 갱신
export const getToken = async () => {
  const response = await api.get<ApiResponse>("/user/get-token");
  return response.data;
};
