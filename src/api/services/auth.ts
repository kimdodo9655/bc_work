import api from "@/api/client/axios";
import type { LoginReqDto, LoginResDto, LogoutResDto, TokenResDto } from "@/api/types/dto/index";

// 로그인
export const login = async (payload: LoginReqDto): Promise<LoginResDto> => {
  const res = await api.post<{ data: LoginResDto }>("/user/login", payload);
  return res.data.data;
};

// 로그아웃
export const logout = async (): Promise<LogoutResDto> => {
  const res = await api.post<LogoutResDto>("/user/logout");
  return res.data;
};

// 토큰 갱신
export const getToken = async (): Promise<TokenResDto> => {
  const res = await api.get<{ data: TokenResDto }>("/user/get-token");
  return res.data.data;
};
