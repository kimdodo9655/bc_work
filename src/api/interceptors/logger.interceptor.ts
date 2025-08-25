import api from "@/api/client/axios";

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

// 인증 상태 확인 함수 타입
type AuthChecker = () => boolean | Promise<boolean>;

// 로그 설정
const logConfig = {
  level: "debug" as LogLevel,
  showHeaders: true,
  showQueryParams: true,
  showResponseSize: true,
  showAuthStatus: true, // 인증 상태 표시 여부
  colorize: true,
  maxDataLength: 1000, // 응답 데이터 최대 길이 (너무 길면 잘라냄)
};

// 토큰 만료 시간 가져오기 함수들
const tokenExpiryGetters = {
  // localStorage에서 만료 시간 확인
  getFromStorage: (): number | null => {
    const expiry = localStorage.getItem("accessTokenExpiry") || localStorage.getItem("tokenExpiry") || localStorage.getItem("expiresAt");
    return expiry ? parseInt(expiry) : null;
  },

  // sessionStorage에서 만료 시간 확인
  getFromSession: (): number | null => {
    const expiry = sessionStorage.getItem("accessTokenExpiry") || sessionStorage.getItem("tokenExpiry") || sessionStorage.getItem("expiresAt");
    return expiry ? parseInt(expiry) : null;
  },

  // JWT 토큰에서 exp 클레임 추출
  getFromJWT: (): number | null => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp ? payload.exp * 1000 : null; // JWT exp는 초 단위이므로 밀리초로 변환
    } catch {
      return null;
    }
  },

  // Pinia store에서 가져오기 (Vue 프로젝트용)
  getFromPinia: (): number | null => {
    try {
      // Vue에서 Pinia store 접근
      const authStore = (window as any).authStore || (window as any).useAuthStore?.();
      return authStore?.accessTokenExpiry || null;
    } catch {
      return null;
    }
  },

  // 사용자 정의 함수
  getCustomExpiry: (): number | null => {
    try {
      // 여기에 실제 앱의 토큰 만료 시간 가져오기 로직을 구현하세요
      return (window as any).getTokenExpiry?.() || null;
    } catch {
      return null;
    }
  },
};

// 현재 사용할 만료 시간 getter
let currentExpiryGetter = (): number | null => {
  return tokenExpiryGetters.getFromStorage() || tokenExpiryGetters.getFromSession() || tokenExpiryGetters.getFromJWT() || tokenExpiryGetters.getFromPinia();
};

// 인증 상태 확인 함수들
const authCheckers = {
  // 방법 1: localStorage의 토큰 확인
  checkTokenInStorage: (): boolean => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("authToken") || localStorage.getItem("token");
    return !!token && token !== "undefined" && token !== "null";
  },

  // 방법 2: sessionStorage의 토큰 확인
  checkTokenInSession: (): boolean => {
    const token = sessionStorage.getItem("accessToken") || sessionStorage.getItem("authToken") || sessionStorage.getItem("token");
    return !!token && token !== "undefined" && token !== "null";
  },

  // 방법 3: 쿠키의 토큰 확인
  checkTokenInCookie: (): boolean => {
    return document.cookie.split(";").some((cookie) => {
      const [name] = cookie.trim().split("=");
      return ["accessToken", "authToken", "token", "jwt"].includes(name);
    });
  },

  // 방법 4: Authorization 헤더 확인
  checkAuthHeader: (): boolean => {
    const defaultHeaders = api.defaults.headers?.common;
    return !!(defaultHeaders?.Authorization || defaultHeaders?.authorization);
  },

  // 방법 5: 사용자 정의 함수 (전역 상태 등)
  checkCustomAuth: (): boolean => {
    // 여기에 실제 앱의 인증 상태 확인 로직을 구현하세요
    // 예: Redux store, Zustand, Context API 등
    try {
      // 예시: window 객체에 있는 사용자 정보 확인
      return !!(window as any).user || !!(window as any).isAuthenticated;
    } catch {
      return false;
    }
  },
};

// 기본 인증 확인 함수 (여러 방법을 조합)
let currentAuthChecker: AuthChecker = (): boolean => {
  return authCheckers.checkTokenInStorage() || authCheckers.checkTokenInSession() || authCheckers.checkAuthHeader() || authCheckers.checkCustomAuth();
};

// 색상 스타일 (개발 환경에서만)
const colors = {
  request: "color: #2196F3; font-weight: bold;",
  response: "color: #4CAF50; font-weight: bold;",
  error: "color: #F44336; font-weight: bold;",
  info: "color: #FF9800;",
  authenticated: "color: #4CAF50;",
  unauthenticated: "color: #F44336;",
  reset: "color: inherit;",
};

// 시간 포맷팅 함수
function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return "만료됨";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  }
  return `${seconds}초`;
}

// 인증 상태 아이콘 및 텍스트
function getAuthStatus(): { icon: string; text: string; color: string } {
  try {
    const isAuthenticated = currentAuthChecker();

    if (isAuthenticated) {
      // 토큰 만료 시간 확인
      const expiryTime = currentExpiryGetter();

      if (expiryTime) {
        const timeLeft = expiryTime - Date.now();
        const timeText = formatTimeRemaining(timeLeft);

        // 만료 시간에 따라 색상 변경
        let color = colors.authenticated;
        if (timeLeft <= 5 * 60 * 1000) {
          // 5분 이하
          color = colors.error;
        } else if (timeLeft <= 10 * 60 * 1000) {
          // 10분 이하
          color = colors.info;
        }

        return {
          icon: "🔐",
          text: `Authenticated (${timeText})`,
          color,
        };
      }

      return {
        icon: "🔐",
        text: "Authenticated",
        color: colors.authenticated,
      };
    }

    return {
      icon: "🔓",
      text: "Not Authenticated",
      color: colors.unauthenticated,
    };
  } catch (error) {
    return {
      icon: "❓",
      text: "Auth Check Failed",
      color: colors.error,
    };
  }
}

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

  // 인증 확인 함수 변경
  (window as any).setAuthChecker = (checker: AuthChecker) => {
    currentAuthChecker = checker;
    console.log("🔑 Auth checker가 변경되었습니다.");
  };

  // 토큰 만료 시간 getter 변경
  (window as any).setExpiryGetter = (getter: () => number | null) => {
    currentExpiryGetter = getter;
    console.log("⏰ Token expiry getter가 변경되었습니다.");
  };

  // 미리 정의된 인증 확인 방법들 제공
  (window as any).useAuthChecker = (type: keyof typeof authCheckers) => {
    if (authCheckers[type]) {
      currentAuthChecker = authCheckers[type];
      console.log(`🔑 Auth checker를 ${type}로 변경했습니다.`);
    }
  };

  // 미리 정의된 만료 시간 getter 제공
  (window as any).useExpiryGetter = (type: keyof typeof tokenExpiryGetters) => {
    if (tokenExpiryGetters[type]) {
      currentExpiryGetter = tokenExpiryGetters[type];
      console.log(`⏰ Expiry getter를 ${type}로 변경했습니다.`);
    }
  };

  // 요청 로그
  api.interceptors.request.use((config) => {
    const { method, url, data, headers } = config;
    const now = Date.now();
    const timestamp = new Date().toLocaleString("ko-KR"); // 한국 시간 형식
    const reqId = ++requestCounter;
    const authStatus = logConfig.showAuthStatus ? getAuthStatus() : null;

    if (url) {
      requestTimeMap.set(`${url}-${reqId}`, now);
    }

    // 요청 ID를 config에 저장 (응답에서 매칭용)
    (config as any).metadata = { requestId: reqId, startTime: now };

    let logMessage = `
🚀 [API Request #${reqId}]
┌─────────────────────────────────────────────────
│ Time     : ${timestamp}`;

    // 인증 상태 표시
    if (authStatus) {
      logMessage += `
│ Auth     : ${authStatus.icon} ${authStatus.text}`;
    }

    logMessage += `
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
      const authStatus = logConfig.showAuthStatus ? getAuthStatus() : null;

      // Map에서 제거
      if (config.url) {
        requestTimeMap.delete(`${config.url}-${reqId}`);
      }

      let logMessage = `
✅ [API Response #${reqId}] 
┌─────────────────────────────────────────────────
│ Time        : ${timestamp}`;

      // 인증 상태 표시
      if (authStatus) {
        logMessage += `
│ Auth        : ${authStatus.icon} ${authStatus.text}`;
      }

      logMessage += `
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
      const authStatus = logConfig.showAuthStatus ? getAuthStatus() : null;

      // Map에서 제거
      if (config.url) {
        requestTimeMap.delete(`${config.url}-${reqId}`);
      }

      let logMessage = `
❌ [API Error #${reqId}]
┌─────────────────────────────────────────────────
│ Time        : ${timestamp}`;

      // 인증 상태 표시
      if (authStatus) {
        logMessage += `
│ Auth        : ${authStatus.icon} ${authStatus.text}`;
      }

      logMessage += `
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
