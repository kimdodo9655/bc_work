import api from "@/api/client/axios";
import type { ApiResponse } from "@/api/types/dto";
import { extractSuccessData } from "@/utils/api";

// 로그인 (any 타입 사용)
export const login = async (payload: any) => {
  const response = await api.post<ApiResponse>("/user/login", payload);
  return extractSuccessData(response);
};

// 로그아웃
export const logout = async () => {
  const response = await api.post<ApiResponse>("/user/logout");
  return extractSuccessData(response);
};

// 토큰 갱신
export const getToken = async () => {
  const response = await api.get<ApiResponse>("/user/get-token");
  return extractSuccessData(response);
};
