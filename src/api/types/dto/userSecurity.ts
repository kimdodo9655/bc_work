// 패스워드 변경 처리 DTO
export interface ChangePwdReqDto {
  newPassword?: string;
  macAddress: string;
  emailAuthKey?: string;
}

export interface BasicResDto {
  status: number;
  code: string;
  message: string;
  data: Record<string, any>;
}
