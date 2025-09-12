import axios from "axios";
import { getApiBaseUrl, isDev } from "@/utils/env";
import router from "@/router";

// ==========================================
// Axios 타입 확장
// ==========================================
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      requestId: number;
      startTime: number;
    };
  }
}

// ==========================================
// 로거 설정
// ==========================================
type LogLevel = "debug" | "info" | "warn" | "error";
type AuthChecker = () => boolean | Promise<boolean>;

const logConfig = {
  level: "debug" as LogLevel,
  showHeaders: true,
  showQueryParams: true,
  showResponseSize: true,
  showAuthStatus: true,
  colorize: true,
  maxDataLength: 1000,
} as const;

// ==========================================
// 유틸리티 함수들
// ==========================================
const colors = {
  blue: "color:#2196F3;font-weight:bold;",
  green: "color:#4CAF50;font-weight:bold;",
  red: "color:#F44336;font-weight:bold;",
  amber: "color:#FF9800;",
  reset: "color:inherit;",
} as const;

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

// 유틸리티 함수들
const nowKR = () => new Date().toLocaleString("ko-KR");
const toKB = (bytes: number) => (bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

const jsonSize = (data: any) => {
  try {
    const s = JSON.stringify(data ?? "");
    return toKB(new Blob([s]).size);
  } catch {
    return "0 B";
  }
};

const truncate = (data: any, max = 1000) => {
  try {
    const s = JSON.stringify(data, null, 2);
    return s.length <= max ? s : s.slice(0, max) + "\n... (truncated)";
  } catch {
    return String(data);
  }
};

const parseQS = (url?: string) => {
  if (!url) return "{}";
  try {
    const u = new URL(url, window.location.origin);
    const obj: Record<string, string> = {};
    u.searchParams.forEach((v, k) => (obj[k] = v));
    return Object.keys(obj).length ? JSON.stringify(obj, null, 2) : "{}";
  } catch {
    return "{}";
  }
};

const perfGrade = (ms: number) => {
  if (ms < 200) return { grade: "FAST", style: colors.green };
  if (ms < 500) return { grade: "NORMAL", style: colors.amber };
  if (ms < 1000) return { grade: "SLOW", style: colors.red };
  return { grade: "VERY SLOW", style: colors.red };
};

const maskHeaders = (headers?: any) => {
  if (!headers) return headers;
  const safe = { ...headers };
  Object.keys(safe).forEach((k) => {
    if (/authorization/i.test(k)) safe[k] = "***MASKED***";
  });
  return safe;
};

const log = (msg: string, style?: string) => {
  if (logConfig.colorize && style) {
    console.log(`%c${msg}`, style);
  } else {
    console.log(msg);
  }
};

const formatRemain = (ms: number) => {
  if (ms <= 0) return "만료됨";
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
};

// ==========================================
// 토큰 만료/인증 체크
// ==========================================
const tokenExpiryGetters = {
  storage: (): number | null => {
    const v = localStorage.getItem("accessTokenExpiry") || localStorage.getItem("tokenExpiry") || localStorage.getItem("expiresAt");
    return v ? parseInt(v) : null;
  },
  session: (): number | null => {
    const v = sessionStorage.getItem("accessTokenExpiry") || sessionStorage.getItem("tokenExpiry") || sessionStorage.getItem("expiresAt");
    return v ? parseInt(v) : null;
  },
  jwt: (): number | null => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  },
  pinia: (): number | null => {
    try {
      const s = (window as any).authStore || (window as any).useAuthStore?.();
      return s?.accessTokenExpiry ?? null;
    } catch {
      return null;
    }
  },
  custom: (): number | null => {
    try {
      return (window as any).getTokenExpiry?.() ?? null;
    } catch {
      return null;
    }
  },
};

let getExpiry: () => number | null = () => tokenExpiryGetters.storage() || tokenExpiryGetters.session() || tokenExpiryGetters.jwt() || tokenExpiryGetters.pinia();

const authCheckers = {
  ls: () => {
    const tokens = ["accessToken", "authToken", "token"];
    const t = tokens.find((token) => localStorage.getItem(token));
    return t ? !["undefined", "null"].includes(localStorage.getItem(t) || "") : false;
  },
  ss: () => {
    const tokens = ["accessToken", "authToken", "token"];
    const t = tokens.find((token) => sessionStorage.getItem(token));
    return t ? !["undefined", "null"].includes(sessionStorage.getItem(t) || "") : false;
  },
  cookie: () => {
    const cookieTokens = ["accessToken", "authToken", "token", "jwt"];
    return document.cookie.split(";").some((c) => cookieTokens.includes(c.trim().split("=")[0]));
  },
  header: () => !!(api.defaults.headers?.common?.Authorization || api.defaults.headers?.common?.authorization),
  custom: () => {
    try {
      return !!(window as any).user || !!(window as any).isAuthenticated;
    } catch {
      return false;
    }
  },
};

let isAuthed: AuthChecker = () => authCheckers.ls() || authCheckers.ss() || authCheckers.header() || authCheckers.custom();

const getAuthStatus = async () => {
  try {
    const ok = await Promise.resolve(isAuthed());
    if (!ok) return { icon: "🔓", label: "Not Authenticated" as const };

    const exp = getExpiry();
    if (!exp) return { icon: "🔐", label: "Authenticated" as const };

    const left = exp - Date.now();
    const remains = formatRemain(left);
    return { icon: "🔐", label: `Authenticated (${remains})` as const, left };
  } catch {
    return { icon: "❓", label: "Auth Check Failed" as const };
  }
};

// ==========================================
// Axios 인스턴스 생성
// ==========================================
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// 인터셉터 설정
// ==========================================
let reqSeq = 0;

// 요청 인터셉터
api.interceptors.request.use((config) => {
  // 토큰 설정
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // 개발 모드에서만 로깅
  if (isDev()) {
    const reqId = ++reqSeq;
    const start = Date.now();
    config.metadata = { requestId: reqId, startTime: start };

    const { method, url, data, headers } = config;
    const t = nowKR();
    const qs = logConfig.showQueryParams ? parseQS(url) : "{}";
    const hdr = logConfig.showHeaders ? maskHeaders(headers) : undefined;

    const headerBlock = hdr ? `\n│ Headers  : ${JSON.stringify(hdr, null, 2).replace(/\n/g, "\n│            ")}` : "";
    const qsBlock = qs !== "{}" ? `\n│ Query    : ${qs.replace(/\n/g, "\n│            ")}` : "";

    const startLog = async () => {
      const auth = logConfig.showAuthStatus ? await getAuthStatus() : null;

      const msg = `
🚀 [API Request #${reqId}]
┌─────────────────────────────────────────────────
│ Time     : ${t}${auth ? `\n│ Auth     : ${auth.icon} ${auth.label}` : ""}
│ Method   : ${method?.toUpperCase()}
│ Endpoint : ${url}
│ Size     : ${jsonSize(data)}${qsBlock}${headerBlock}
│ Data     :
│ ${truncate(data, logConfig.maxDataLength).replace(/\n/g, "\n│ ")}
└─────────────────────────────────────────────────`;
      log(msg, colors.blue);
    };

    startLog();
  }

  return config;
});

// 응답 인터셉터
api.interceptors.response.use(
  async (response) => {
    // API 응답 구조에서 에러 체크
    if (response.data?.code?.includes("-E")) {
      return Promise.reject(new Error(response.data.message));
    }

    // 개발 모드에서만 로깅
    if (isDev()) {
      const { config, status, data, headers } = response;
      const { requestId, startTime } = config.metadata ?? {};
      const t = nowKR();
      const dur = Date.now() - (startTime ?? Date.now());
      const p = perfGrade(dur);
      const auth = logConfig.showAuthStatus ? await getAuthStatus() : null;

      const importantHeaders = ["content-type", "cache-control", "etag", "x-ratelimit-remaining", "x-response-time"];
      const hdr = logConfig.showHeaders
        ? (() => {
            const imp: Record<string, any> = {};
            importantHeaders.forEach((k) => {
              if ((headers as any)?.[k]) imp[k] = (headers as any)[k];
            });
            return Object.keys(imp).length ? `\n│ Headers     : ${JSON.stringify(imp, null, 2).replace(/\n/g, "\n│               ")}` : "";
          })()
        : "";

      const msg = `
✅ [API Response #${requestId ?? "unknown"}]
┌─────────────────────────────────────────────────
│ Time        : ${t}${auth ? `\n│ Auth        : ${auth.icon} ${auth.label}` : ""}
│ Endpoint    : ${config.url}
│ Status      : ${status} ${statusTexts[status] ?? ""}
│ Duration    : ${dur}ms (${p.grade})
│ Size        : ${jsonSize(data)}${hdr}
│ Data        :
│ ${truncate(data, logConfig.maxDataLength).replace(/\n/g, "\n│ ")}
└─────────────────────────────────────────────────`;
      log(msg, dur > 1000 ? colors.red : colors.green);
    }

    return response;
  },
  async (error) => {
    const status = error.response?.status;

    // 401 에러 처리
    if (status === 401) {
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];
      router.push("/auth/login");
    }

    // 개발 모드에서만 로깅
    if (isDev()) {
      const config = error?.config ?? {};
      const { requestId, startTime } = (config as any).metadata ?? {};
      const t = nowKR();
      const dur = Date.now() - (startTime ?? Date.now());
      const data = error?.response?.data ?? { message: error?.message };
      const auth = logConfig.showAuthStatus ? await getAuthStatus() : null;

      const msg = `
❌ [API Error #${requestId ?? "unknown"}]
┌─────────────────────────────────────────────────
│ Time        : ${t}${auth ? `\n│ Auth        : ${auth.icon} ${auth.label}` : ""}
│ Endpoint    : ${config.url ?? "unknown"}
│ Status      : ${status} ${typeof status === "number" ? statusTexts[status] ?? "" : ""}
│ Duration    : ${dur}ms
│ Error Type  : ${error?.name ?? "Unknown"}
│ Message     : ${error?.message ?? ""}
│ Data        :
│ ${truncate(data, logConfig.maxDataLength).replace(/\n/g, "\n│ ")}
└─────────────────────────────────────────────────`;
      log(msg, colors.red);
    }

    return Promise.reject(error);
  }
);

// ==========================================
// 런타임 설정 API
// ==========================================
if (isDev()) {
  console.log("🔧 API Logger가 활성화되었습니다.");

  Object.assign(window as any, {
    configureApiLogger: (cfg: Partial<typeof logConfig>) => {
      Object.assign(logConfig as any, cfg);
      console.log("📝 API Logger 설정 변경:", logConfig);
    },
    setAuthChecker: (fn: AuthChecker) => {
      isAuthed = fn;
      console.log("🔑 Auth checker 변경됨");
    },
    setExpiryGetter: (fn: () => number | null) => {
      getExpiry = fn;
      console.log("⏰ Expiry getter 변경됨");
    },
    useAuthChecker: (k: keyof typeof authCheckers) => {
      if (authCheckers[k]) {
        isAuthed = authCheckers[k];
        console.log(`🔑 Auth checker → ${k}`);
      }
    },
    useExpiryGetter: (k: keyof typeof tokenExpiryGetters) => {
      if (tokenExpiryGetters[k]) {
        getExpiry = tokenExpiryGetters[k];
        console.log(`⏰ Expiry getter → ${k}`);
      }
    },
  });
}

export default api;
