export interface ApiResponse<T = any> {
  status: number;
  code: string;
  title: string;
  message: string;
  data: T | null;
}

export interface PaginationMeta {
  pageSize: number;
  hasNext: boolean;
  currentPage: number;
  hasPrevious: boolean;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface AlertInfo {
  title: string;
  message: string;
  isSuccess: boolean;
}

export const extractAlertInfo = <T>(response: { data: ApiResponse<T> }): AlertInfo => ({
  title: response.data.title,
  message: response.data.message,
  isSuccess: response.data.code.includes("-S"),
});
