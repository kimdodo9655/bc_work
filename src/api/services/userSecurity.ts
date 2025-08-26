import api from "@/api/client/axios";
import type { ChangePwdReqDto, BasicResDto } from "@/api/types/dto/index";

// 비밀번호 변경 전 인증 이메일 발송
export const sendAuthEmailBeforeChgPwd = (data: ChangePwdReqDto) => api.post<BasicResDto>("/user/secure-send-auth-email", data).then((res) => res.data);

// 이메일 인증키 검증
export const verifyEmailAuthKey = (data: ChangePwdReqDto) => api.post<BasicResDto>("/user/verify-email-auth-key", data).then((res) => res.data);

// 인증 메일 발송 (일반)
export const sendAuthEmail = (data: ChangePwdReqDto) => api.post<BasicResDto>("/user/send-auth-email", data).then((res) => res.data);

// 비밀번호 변경
export const changePassword = (data: ChangePwdReqDto) => api.patch<BasicResDto>("/user/change-pwd", data).then((res) => res.data);

// 로그인 이후 비밀번호 변경
export const changeMyPassword = (data: ChangePwdReqDto) => api.patch<BasicResDto>("/user/change-my-pwd", data).then((res) => res.data);
