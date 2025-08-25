import api from "@/api/axios";

// Axios config 타입 확장
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      requestId: number;
      startTime: number;
    };
  }
}

const requestTimeMap = new Map<string, number>();
let requestCounter = 0;

// 로그 레벨 타입
type LogLevel = "debug" | "info" | "warn" | "error";

// 로그 설정
const logConfig = {
  level: "debug" as LogLevel,
  showHeaders: true,
  showQueryParams: true,
  showResponseSize: true,
  colorize: true,
  maxDataLength: 1000, // 응답 데이터 최대 길이 (너무 길면 잘라냄)
};

// 색상 스타일 (개발 환경에서만)
const colors = {
  request: "color: #2196F3; font-weight: bold;",
  response: "color: #4CAF50; font-weight: bold;",
  error: "color: #F44336; font-weight: bold;",
  info: "color: #FF9800;",
  reset: "color: inherit;",
};

// 데이터 크기 계산
function getDataSize(data: any): string {
  if (!data) return "0 B";
  const jsonString = JSON.stringify(data);
  const bytes = new Blob([jsonString]).size;

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 데이터 자르기 (너무 긴 경우)
function truncateData(data: any, maxLength: number): string {
  const jsonString = JSON.stringify(data, null, 2);
  if (jsonString.length <= maxLength) return jsonString;
  return jsonString.substring(0, maxLength) + "\n... (truncated)";
}

// 쿼리 파라미터 파싱
function parseQueryParams(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    const params = urlObj.searchParams;
    if (params.toString()) {
      const paramObj: Record<string, string> = {};
      params.forEach((value, key) => {
        paramObj[key] = value;
      });
      return JSON.stringify(paramObj, null, 2);
    }
    return "{}";
  } catch {
    return "{}";
  }
}

// 성능 등급 반환
function getPerformanceGrade(duration: number): { grade: string; color: string } {
  if (duration < 200) return { grade: "FAST", color: "#4CAF50" };
  if (duration < 500) return { grade: "NORMAL", color: "#FF9800" };
  if (duration < 1000) return { grade: "SLOW", color: "#FF5722" };
  return { grade: "VERY SLOW", color: "#F44336" };
}

// 로그 출력 함수
function logWithStyle(message: string, style: string = colors.reset) {
  if (logConfig.colorize) {
    console.log(`%c${message}`, style);
  } else {
    console.log(message);
  }
}

// HTTP 상태 코드 텍스트 반환
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusTexts[status] || "";
}

export function setupLoggerInterceptor() {
  console.log("🔧 API Logger가 활성화되었습니다.");

  // 전역에서 로거 설정 변경할 수 있도록 window 객체에 추가
  (window as any).configureApiLogger = (config: Partial<typeof logConfig>) => {
    Object.assign(logConfig, config);
    console.log("📝 API Logger 설정이 변경되었습니다:", logConfig);
  };

  // 요청 로그
  api.interceptors.request.use((config) => {
    const { method, url, data, headers } = config;
    const now = Date.now();
    const timestamp = new Date().toLocaleString("ko-KR"); // 한국 시간 형식
    const reqId = ++requestCounter;

    if (url) {
      requestTimeMap.set(`${url}-${reqId}`, now);
    }

    // 요청 ID를 config에 저장 (응답에서 매칭용)
    (config as any).metadata = { requestId: reqId, startTime: now };

    let logMessage = `
🚀 [API Request #${reqId}]
┌─────────────────────────────────────────────────
│ Time     : ${timestamp}
│ Method   : ${method?.toUpperCase()}
│ Endpoint : ${url}
│ Size     : ${getDataSize(data)}`;

    // 쿼리 파라미터 표시
    if (logConfig.showQueryParams && url) {
      const queryParams = parseQueryParams(url);
      if (queryParams !== "{}") {
        logMessage += `
│ Query    : ${queryParams.replace(/\n/g, "\n│           ")}`;
      }
    }

    // 헤더 표시 (인증 정보 등 민감한 정보는 마스킹)
    if (logConfig.showHeaders && headers) {
      const safeHeaders = { ...headers };
      if (safeHeaders.Authorization) {
        safeHeaders.Authorization = "***MASKED***";
      }
      logMessage += `
│ Headers  : ${JSON.stringify(safeHeaders, null, 2).replace(/\n/g, "\n│           ")}`;
    }

    // 요청 데이터
    logMessage += `
│ Data     :
│ ${data ? truncateData(data, logConfig.maxDataLength).replace(/\n/g, "\n│ ") : "{}"}
└─────────────────────────────────────────────────`;

    logWithStyle(logMessage, colors.request);

    return config;
  });

  // 응답 로그 (성공)
  api.interceptors.response.use(
    (response) => {
      const { config, status, data, headers } = response;
      const reqId = (config as any).metadata?.requestId || "unknown";
      const startTime = (config as any).metadata?.startTime || Date.now();
      const duration = Date.now() - startTime;
      const timestamp = new Date().toLocaleString("ko-KR");
      const performanceInfo = getPerformanceGrade(duration);

      // Map에서 제거
      if (config.url) {
        requestTimeMap.delete(`${config.url}-${reqId}`);
      }

      let logMessage = `
✅ [API Response #${reqId}] 
┌─────────────────────────────────────────────────
│ Time        : ${timestamp}
│ Endpoint    : ${config.url}
│ Status      : ${status} ${getStatusText(status)}
│ Duration    : ${duration}ms (${performanceInfo.grade})
│ Size        : ${getDataSize(data)}`;

      // 응답 헤더에서 유용한 정보 추출
      if (logConfig.showHeaders && headers) {
        const importantHeaders: Record<string, any> = {};

        // 유용한 헤더들만 선별
        ["content-type", "cache-control", "etag", "x-ratelimit-remaining", "x-response-time"].forEach((key) => {
          if (headers[key]) importantHeaders[key] = headers[key];
        });

        if (Object.keys(importantHeaders).length > 0) {
          logMessage += `
│ Headers     : ${JSON.stringify(importantHeaders, null, 2).replace(/\n/g, "\n│              ")}`;
        }
      }

      logMessage += `
│ Data        :
│ ${truncateData(data, logConfig.maxDataLength).replace(/\n/g, "\n│ ")}
└─────────────────────────────────────────────────`;

      // 성능에 따라 색상 변경
      const logColor = duration > 1000 ? colors.error : colors.response;
      logWithStyle(logMessage, logColor);

      return response;
    },

    (error) => {
      const config = error.config || {};
      const reqId = (config as any).metadata?.requestId || "unknown";
      const startTime = (config as any).metadata?.startTime || Date.now();
      const duration = Date.now() - startTime;
      const timestamp = new Date().toLocaleString("ko-KR");
      const status = error.response?.status || "Network Error";
      const errorData = error.response?.data || { message: error.message };

      // Map에서 제거
      if (config.url) {
        requestTimeMap.delete(`${config.url}-${reqId}`);
      }

      let logMessage = `
❌ [API Error #${reqId}]
┌─────────────────────────────────────────────────
│ Time        : ${timestamp}
│ Endpoint    : ${config.url || "unknown"}
│ Status      : ${status} ${error.response ? getStatusText(status) : ""}
│ Duration    : ${duration}ms
│ Error Type  : ${error.name || "Unknown"}
│ Message     : ${error.message}`;

      // 네트워크 오류인지 서버 오류인지 구분
      if (error.code) {
        logMessage += `
│ Error Code  : ${error.code}`;
      }

      logMessage += `
│ Data        :
│ ${truncateData(errorData, logConfig.maxDataLength).replace(/\n/g, "\n│ ")}
└─────────────────────────────────────────────────`;

      logWithStyle(logMessage, colors.error);

      return Promise.reject(error);
    }
  );
}
