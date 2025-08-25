// api/auth.ts
import api from "@/api/client/axios";
import type { LoginReqDto, LoginResDto, LogoutResDto, TokenResDto } from "@/api/types/index";

export const login = async (payload: LoginReqDto): Promise<LoginResDto> => {
  const res = await api.post<{ data: LoginResDto }>("/user/login", payload);
  return res.data.data;
};

export const logout = async (): Promise<LogoutResDto> => {
  const res = await api.post<LogoutResDto>("/user/logout");
  return res.data;
};

export const getToken = async (): Promise<TokenResDto> => {
  const res = await api.get<{ data: TokenResDto }>("/user/get-token");
  return res.data.data;
};
