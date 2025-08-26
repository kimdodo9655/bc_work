// 공통 응답 DTO
// 모든 API 응답은 이 타입을 기본으로 따름

export interface BasicResDto<T = Record<string, any>> {
  status: number;
  code: string;
  message: string;
  data: T;
}
