<template>
  <div class="api-tester-bg">
    <div class="api-tester">
      <!-- 헤더 -->
      <div class="header">
        <h1>🚀 Universal API Tester</h1>
        <div class="status-bar">
          <span class="status-item">
            <span :class="['indicator', isConnected ? 'connected' : 'disconnected']"></span>
            {{ baseUrl }}
          </span>
          <span class="status-item">
            <span class="indicator auth"></span>
            {{ authState.token ? "인증됨" : "미인증" }}
          </span>
        </div>
      </div>

      <!-- 메인 컨텐츠 - 좌우 분할 -->
      <div class="main-content">
        <!-- 좌측: 컨트롤 패널 -->
        <div class="left-panel">
          <div class="control-panel">
            <!-- Headers -->
            <div class="section">
              <h3>Headers</h3>
              <div class="header-list">
                <div v-for="(header, index) in request.headers" :key="index" class="header-row">
                  <input v-model="header.key" type="text" placeholder="Header Key" class="header-input" />
                  <input v-model="header.value" type="text" placeholder="Header Value" class="header-input" />
                  <button @click="removeHeader(index)" class="remove-btn">×</button>
                </div>
                <button @click="addHeader" class="add-btn">+ Add Header</button>
              </div>

              <div class="auth-section" v-if="authState.token">
                <button @click="useCurrentAuth" :disabled="!authState.token" class="auth-btn" title="현재 저장된 토큰을 Authorization 헤더에 추가">현재 인증 토큰 사용</button>
                <button @click="clearAuth" class="auth-btn secondary" title="Authorization 헤더 제거">인증 해제</button>
                <div class="auth-info">
                  <small v-if="authState.token">
                    🔐 토큰 보유 중 (만료: {{ formatTokenExpiry() }})
                    <br />
                    ⏰ 자동 로그아웃: {{ formatAutoLogoutTime() }}
                  </small>
                  <small v-else>🔓 토큰 없음</small>
                </div>
              </div>
            </div>

            <!-- 빠른 선택 버튼들 -->
            <div class="quick-actions">
              <h3>Quick API Templates</h3>
              <div class="template-grid">
                <button v-for="template in apiTemplates" :key="template.name" @click="loadTemplate(template)" class="template-btn">
                  {{ template.name }}
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>HTTP Method</label>
                <select v-model="request.method" class="select">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div class="form-group flex-grow">
                <label>Endpoint URL</label>
                <div class="url-input">
                  <span class="base-url">{{ baseUrl }}</span>
                  <input v-model="request.endpoint" type="text" placeholder="/user/login" class="endpoint-input" @keyup.enter="sendRequest" />
                </div>
              </div>

              <button @click="sendRequest" :disabled="loading || !request.endpoint" class="send-btn">
                {{ loading ? "전송 중..." : "전송" }}
              </button>
            </div>

            <!-- Request Body -->
            <div class="section" v-if="['POST', 'PUT', 'PATCH'].includes(request.method)">
              <h3>Request Body</h3>
              <div class="body-controls">
                <label>
                  <input type="radio" v-model="bodyType" value="json" />
                  JSON
                </label>
                <label>
                  <input type="radio" v-model="bodyType" value="form" />
                  Form Data
                </label>
                <label>
                  <input type="radio" v-model="bodyType" value="text" />
                  Raw Text
                </label>
              </div>

              <!-- JSON Body -->
              <div v-if="bodyType === 'json'">
                <div class="json-controls">
                  <button @click="formatJson" class="format-btn">Format JSON</button>
                  <button @click="minifyJson" class="format-btn">Minify</button>
                  <button @click="validateJson" class="format-btn">Validate</button>
                </div>
                <textarea v-model="request.body" rows="12" placeholder='{"key": "value"}' class="json-textarea" :class="{ error: jsonError }"></textarea>
                <div v-if="jsonError" class="json-error">{{ jsonError }}</div>
              </div>

              <!-- Form Data -->
              <div v-if="bodyType === 'form'">
                <div v-for="(field, index) in formData" :key="index" class="form-field-row">
                  <input v-model="field.key" type="text" placeholder="Field Key" class="form-input" />
                  <input v-model="field.value" type="text" placeholder="Field Value" class="form-input" />
                  <button @click="removeFormField(index)" class="remove-btn">×</button>
                </div>
                <button @click="addFormField" class="add-btn">+ Add Field</button>
              </div>

              <!-- Raw Text -->
              <div v-if="bodyType === 'text'">
                <textarea v-model="request.body" rows="8" placeholder="Raw request body" class="text-textarea"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측: Response & History -->
        <div class="right-panel">
          <!-- Response Section -->
          <div class="response-section">
            <h2>Response</h2>

            <!-- Response Info -->
            <div class="response-info" v-if="response || error">
              <div class="info-item">
                <span class="label">Status:</span>
                <span :class="['status', getStatusClass(response?.status)]">
                  {{ response?.status || "Error" }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Time:</span>
                <span>{{ responseTime }}ms</span>
              </div>
              <div class="info-item">
                <span class="label">Size:</span>
                <span>{{ responseSize }}</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!response && !error && !loading" class="empty-state">
              <div class="empty-icon">📡</div>
              <p>API 요청을 보내면 여기에 응답이 표시됩니다</p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>요청 처리 중...</p>
            </div>

            <!-- Response Tabs -->
            <div class="response-tabs" v-if="response || error">
              <button @click="activeTab = 'body'" :class="['tab', { active: activeTab === 'body' }]">Response Body</button>
              <button @click="activeTab = 'headers'" :class="['tab', { active: activeTab === 'headers' }]">Headers</button>
              <button @click="activeTab = 'raw'" :class="['tab', { active: activeTab === 'raw' }]">Raw</button>
            </div>

            <!-- Response Content -->
            <div class="response-content" v-if="response || error">
              <!-- Body Tab -->
              <div v-if="activeTab === 'body'">
                <div class="response-controls">
                  <button @click="copyResponse" class="copy-btn">📋 Copy</button>
                  <button @click="downloadResponse" class="copy-btn">💾 Download</button>
                </div>
                <pre class="response-body">{{ formattedResponse }}</pre>
              </div>

              <!-- Headers Tab -->
              <div v-if="activeTab === 'headers'">
                <div class="headers-display">
                  <div v-for="[key, value] in Object.entries(response?.headers || {})" :key="key" class="header-display-row">
                    <span class="header-key">{{ key }}:</span>
                    <span class="header-value">{{ value }}</span>
                  </div>
                </div>
              </div>

              <!-- Raw Tab -->
              <div v-if="activeTab === 'raw'">
                <pre class="raw-response">{{ rawResponse }}</pre>
              </div>
            </div>
          </div>

          <!-- History -->
          <div class="history-section">
            <h2>Request History</h2>

            <!-- Empty State for History -->
            <div v-if="history.length === 0" class="empty-state">
              <div class="empty-icon">📜</div>
              <p>아직 API 요청 기록이 없습니다</p>
            </div>

            <!-- History List -->
            <div v-else>
              <div class="history-list">
                <div v-for="(item, index) in history" :key="index" @click="loadFromHistory(item)" class="history-item">
                  <div class="history-method">{{ item.method }}</div>
                  <div class="history-url">{{ item.endpoint }}</div>
                  <div class="history-status" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </div>
                  <div class="history-time">{{ formatTime(item.timestamp) }}</div>
                </div>
              </div>
              <button @click="clearHistory" class="clear-history-btn">Clear History</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Toast -->
      <div v-if="notification.show" :class="['notification-toast', `notification-${notification.type}`]">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from "vue";
import { env } from "@/utils/env";
import type { AxiosResponse, AxiosError } from "axios";
import axios from "axios";

// Types
interface HeaderItem {
  key: string;
  value: string;
}

interface FormDataItem {
  key: string;
  value: string;
}

interface ApiTemplate {
  name: string;
  method: string;
  endpoint: string;
  body: string;
}

interface ApiRequest {
  method: string;
  endpoint: string;
  headers: HeaderItem[];
  body: string;
}

interface HistoryItem {
  method: string;
  endpoint: string;
  status: number | string;
  timestamp: Date;
  request: ApiRequest;
  response: any;
}

// API 테스터 완전 독립 인증 상태 (authStore 완전 제거)
const authState = reactive({
  token: localStorage.getItem("accessToken") || "",
  expiry: parseInt(localStorage.getItem("accessTokenExpiry") || "0"),
});

// Reactive state
const request = reactive<ApiRequest>({
  method: "GET",
  endpoint: "/user/login",
  headers: [{ key: "Content-Type", value: "application/json" }],
  body: "",
});

const formData = ref<FormDataItem[]>([{ key: "", value: "" }]);
const bodyType = ref<"json" | "form" | "text">("json");
const loading = ref<boolean>(false);
const response = ref<AxiosResponse | null>(null);
const error = ref<AxiosError | null>(null);
const responseTime = ref<number>(0);
const activeTab = ref<"body" | "headers" | "raw">("body");
const history = ref<HistoryItem[]>([]);
const jsonError = ref<string>("");

// Base URL
const baseUrl = computed(() => env.getApiBaseUrl());
const isConnected = ref<boolean>(true);

// API Templates
const apiTemplates: ApiTemplate[] = [
  {
    name: "로그인",
    method: "POST",
    endpoint: "/user/login",
    body: JSON.stringify(
      {
        userId: "test10",
        password: "happyTEst2025@@#",
        macAddress: "d0:11:e5:7b:11:ed",
      },
      null,
      2
    ),
  },
  {
    name: "로그아웃",
    method: "POST",
    endpoint: "/user/logout",
    body: "",
  },
  {
    name: "토큰 갱신",
    method: "GET",
    endpoint: "/user/get-token",
    body: "",
  },
  {
    name: "견적서 조회",
    method: "POST",
    endpoint: "/register/search-register",
    body: JSON.stringify(
      {
        page: 1,
        size: 10,
        registerType: "소유권이전",
      },
      null,
      2
    ),
  },
  {
    name: "견적 기본정보",
    method: "POST",
    endpoint: "/estimate/get-estimate-info",
    body: JSON.stringify(
      {
        registerId: 7,
      },
      null,
      2
    ),
  },
  {
    name: "견적 기본값",
    method: "POST",
    endpoint: "/estimate/get-default-info",
    body: JSON.stringify(
      {
        registerId: 7,
        registerType: "transfer",
      },
      null,
      2
    ),
  },
  {
    name: "비밀번호 변경 메일",
    method: "POST",
    endpoint: "/user/secure-send-auth-email",
    body: JSON.stringify(
      {
        macAddress: "00:00:00:00:00:00",
      },
      null,
      2
    ),
  },
  {
    name: "이메일 인증",
    method: "POST",
    endpoint: "/user/verify-email-auth-key",
    body: JSON.stringify(
      {
        macAddress: "00:00:00:00:00:00",
        emailAuthKey: "TEST123",
      },
      null,
      2
    ),
  },
];

// Computed
const formattedResponse = computed(() => {
  if (!response.value) return "";
  try {
    return JSON.stringify(response.value.data || response.value, null, 2);
  } catch {
    return String(response.value);
  }
});

const rawResponse = computed(() => {
  if (!response.value) return "";
  return JSON.stringify(
    {
      status: response.value.status,
      statusText: response.value.statusText,
      headers: response.value.headers,
      data: response.value.data,
    },
    null,
    2
  );
});

const responseSize = computed(() => {
  if (!response.value) return "0 B";
  const size = JSON.stringify(response.value).length;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

// Methods
const addHeader = (): void => {
  request.headers.push({ key: "", value: "" });
};

const removeHeader = (index: number): void => {
  request.headers.splice(index, 1);
};

const addFormField = (): void => {
  formData.value.push({ key: "", value: "" });
};

const removeFormField = (index: number): void => {
  formData.value.splice(index, 1);
};

const useCurrentAuth = (): void => {
  const authHeader = request.headers.find((h) => h.key.toLowerCase() === "authorization");
  if (authHeader) {
    authHeader.value = `Bearer ${authState.token}`;
  } else {
    request.headers.push({
      key: "Authorization",
      value: `Bearer ${authState.token}`,
    });
  }
};

const clearAuth = (): void => {
  const index = request.headers.findIndex((h) => h.key.toLowerCase() === "authorization");
  if (index >= 0) {
    request.headers.splice(index, 1);
  }

  // API 테스터 독립 상태 클리어 (authStore 완전 제거)
  authState.token = "";
  authState.expiry = 0;

  // localStorage에서 토큰 제거
  localStorage.removeItem("accessToken");
  localStorage.removeItem("accessTokenExpiry");

  // 자동 로그아웃 타이머 정지
  stopAutoLogoutTimer();

  showNotification("✅ 인증이 해제되었습니다.", "success");
  console.log("🔓 Auth cleared (API Tester independent state only)");
};

// Auto-manage auth headers for login/logout
const autoAddAuthHeader = (token: string): void => {
  const authHeader = request.headers.find((h) => h.key.toLowerCase() === "authorization");
  if (authHeader) {
    authHeader.value = `Bearer ${token}`;
  } else {
    request.headers.push({
      key: "Authorization",
      value: `Bearer ${token}`,
    });
  }
};

const autoRemoveAuthHeader = (): void => {
  const index = request.headers.findIndex((h) => h.key.toLowerCase() === "authorization");
  if (index >= 0) {
    request.headers.splice(index, 1);
  }
};

const formatJson = (): void => {
  try {
    const parsed = JSON.parse(request.body);
    request.body = JSON.stringify(parsed, null, 2);
    jsonError.value = "";
  } catch (e) {
    jsonError.value = "Invalid JSON format";
  }
};

const minifyJson = (): void => {
  try {
    const parsed = JSON.parse(request.body);
    request.body = JSON.stringify(parsed);
    jsonError.value = "";
  } catch (e) {
    jsonError.value = "Invalid JSON format";
  }
};

const validateJson = (): void => {
  try {
    JSON.parse(request.body);
    jsonError.value = "";
    showNotification("JSON is valid! ✓", "success");
  } catch (e) {
    jsonError.value = `Invalid JSON: ${(e as Error).message}`;
    showNotification("Invalid JSON format", "error");
  }
};

const sendRequest = async (): Promise<void> => {
  if (!request.endpoint || loading.value) return;

  loading.value = true;
  error.value = null;
  response.value = null;

  const startTime = Date.now();

  try {
    // Prepare headers
    const headers: Record<string, string> = {};
    request.headers.forEach((h) => {
      if (h.key && h.value) {
        headers[h.key] = h.value;
      }
    });

    // Prepare body
    let body: any = undefined;
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      if (bodyType.value === "json") {
        body = request.body ? JSON.parse(request.body) : undefined;
      } else if (bodyType.value === "form") {
        body = {};
        formData.value.forEach((f) => {
          if (f.key && f.value) {
            body[f.key] = f.value;
          }
        });
      } else {
        body = request.body;
      }
    }

    // Create dedicated axios instance for testing (no interceptors)
    const testApi = axios.create({
      baseURL: baseUrl.value,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    // Make request without using project's API client to avoid side effects
    const config = {
      method: request.method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete",
      url: request.endpoint,
      data: body,
    };

    const result = await testApi.request(config);

    responseTime.value = Date.now() - startTime;
    response.value = result;

    // Handle login success - automatically add auth header
    if (request.endpoint === "/user/login" && result.status === 200 && result.data?.data?.accessToken) {
      const token = result.data.data.accessToken;
      const expiry = result.data.data.accessTokenExpiry;

      // Update API Tester 독립 상태 (authStore 완전 제거!)
      authState.token = token;
      authState.expiry = expiry;

      // localStorage에 토큰 저장 (로그인 상태 유지)
      localStorage.setItem("accessToken", token);
      localStorage.setItem("accessTokenExpiry", expiry.toString());

      // Auto-add authorization header to current request headers
      autoAddAuthHeader(token);

      // 자동 로그아웃 타이머 시작
      startAutoLogoutTimer();

      showNotification("✅ 로그인 성공! Authorization 헤더가 자동 등록되었습니다.", "success");
      console.log("🔐 Login success (API Tester independent state)");
    }

    // Handle token refresh success - automatically update auth header
    if (request.endpoint === "/user/get-token" && result.status === 200 && result.data?.data?.accessToken) {
      const token = result.data.data.accessToken;
      const expiry = result.data.data.accessTokenExpiry;

      // Update API Tester 독립 상태
      authState.token = token;
      authState.expiry = expiry;

      // localStorage에 새 토큰 저장
      localStorage.setItem("accessToken", token);
      localStorage.setItem("accessTokenExpiry", expiry.toString());

      // Auto-update authorization header
      autoAddAuthHeader(token);

      // 자동 로그아웃 타이머 재시작
      startAutoLogoutTimer();

      showNotification("🔄 토큰 갱신 성공! Authorization 헤더가 자동 업데이트되었습니다.", "success");
      console.log("🔄 Token refresh success (API Tester independent state)");
    }

    // Handle logout success - automatically remove auth header
    if (request.endpoint === "/user/logout" && result.status === 200) {
      // API 테스터 독립 상태 클리어 (authStore 완전 제거!)
      authState.token = "";
      authState.expiry = 0;

      // localStorage에서 토큰 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("accessTokenExpiry");

      // Auto-remove authorization header
      autoRemoveAuthHeader();

      // 자동 로그아웃 타이머 정지
      stopAutoLogoutTimer();

      showNotification("✅ 로그아웃 성공! Authorization 헤더가 자동 삭제되었습니다.", "success");
      console.log("🔓 Logout success (API Tester independent state)");
    }

    // Add to history
    history.value.unshift({
      method: request.method,
      endpoint: request.endpoint,
      status: result.status,
      timestamp: new Date(),
      request: { ...request, headers: [...request.headers] },
      response: result,
    });

    // Keep only last 20 requests
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20);
    }

    console.log("✅ API Test Success:", {
      endpoint: request.endpoint,
      method: request.method,
      status: result.status,
      responseTime: responseTime.value + "ms",
    });
  } catch (err: any) {
    responseTime.value = Date.now() - startTime;
    error.value = err;
    response.value = err.response || { status: "ERROR", data: err.message };

    // Add error to history too
    history.value.unshift({
      method: request.method,
      endpoint: request.endpoint,
      status: err.response?.status || "ERROR",
      timestamp: new Date(),
      request: { ...request, headers: [...request.headers] },
      response: err.response || { data: err.message },
    });

    console.error("❌ API Test Error:", {
      endpoint: request.endpoint,
      method: request.method,
      status: err.response?.status || "ERROR",
      error: err.message,
      responseTime: responseTime.value + "ms",
    });
  } finally {
    loading.value = false;
  }
};

const loadTemplate = (template: ApiTemplate): void => {
  request.method = template.method;
  request.endpoint = template.endpoint;
  request.body = template.body;

  if (template.method !== "GET") {
    bodyType.value = "json";
  }

  // Clear response when loading new template
  response.value = null;
  error.value = null;
};

const getStatusClass = (status: number | string | undefined): string => {
  if (typeof status === "string") return "error";
  if (!status) return "unknown";
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "client-error";
  if (status >= 500) return "server-error";
  return "unknown";
};

const copyResponse = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(formattedResponse.value);
    showNotification("Response copied to clipboard!", "success");
  } catch (err) {
    console.error("Failed to copy:", err);
    showNotification("Failed to copy response", "error");
  }
};

const downloadResponse = (): void => {
  const blob = new Blob([formattedResponse.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `api-response-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const loadFromHistory = (item: HistoryItem): void => {
  request.method = item.request.method;
  request.endpoint = item.request.endpoint;
  request.headers = [...item.request.headers];
  request.body = item.request.body;
  response.value = item.response;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const clearHistory = (): void => {
  if (confirm("Clear all request history?")) {
    history.value = [];
    showNotification("History cleared", "success");
  }
};

// 실시간 업데이트를 위한 타이머들
const autoLogoutTimer = ref<number | null>(null);
const uiUpdateTimer = ref<number | null>(null);

// UI 실시간 업데이트를 위한 reactive 상태
const currentTime = ref<number>(Date.now());

// 타이머 시작/정지 함수
const startAutoLogoutTimer = (): void => {
  // 기존 타이머들 정리
  if (autoLogoutTimer.value) {
    clearInterval(autoLogoutTimer.value);
    autoLogoutTimer.value = null;
  }
  if (uiUpdateTimer.value) {
    clearInterval(uiUpdateTimer.value);
    uiUpdateTimer.value = null;
  }

  if (!authState.expiry) {
    console.log("❌ No expiry time, cannot start timer");
    return;
  }

  console.log(`🔄 Starting auto logout timer. Expiry: ${new Date(authState.expiry).toLocaleString()}`);

  // UI 업데이트 타이머 (1초마다 현재 시간 업데이트)
  uiUpdateTimer.value = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);

  // 자동 로그아웃 체크 타이머 (1초마다)
  autoLogoutTimer.value = setInterval(() => {
    const now = Date.now();
    const timeLeft = authState.expiry - now;

    // 디버깅용 로그 (1분마다만 출력)
    if (Math.floor(timeLeft / 1000) % 60 === 0 && timeLeft > 0) {
      console.log(`⏰ Token expires in: ${Math.floor(timeLeft / 1000 / 60)} minutes`);
    }

    // 토큰 만료 시 처리
    if (authState.expiry && now >= authState.expiry) {
      console.log("⏰ Token expired, auto logout triggered");
      stopAutoLogoutTimer();

      // API 테스터 독립 상태 클리어
      authState.token = "";
      authState.expiry = 0;

      // localStorage에서 토큰 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("accessTokenExpiry");

      autoRemoveAuthHeader();
      showNotification("⏰ 토큰이 만료되어 자동 로그아웃되었습니다.", "info");
    }
  }, 1000);
};

const stopAutoLogoutTimer = (): void => {
  if (autoLogoutTimer.value) {
    console.log("🛑 Stopping auto logout timer");
    clearInterval(autoLogoutTimer.value);
    autoLogoutTimer.value = null;
  }
  if (uiUpdateTimer.value) {
    console.log("🛑 Stopping UI update timer");
    clearInterval(uiUpdateTimer.value);
    uiUpdateTimer.value = null;
  }
};

const formatTokenExpiry = (): string => {
  if (!authState.token || !authState.expiry) return "";
  const expiry = new Date(authState.expiry);
  const now = new Date(currentTime.value); // 실시간 업데이트를 위해 currentTime 사용
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return "만료됨";

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분 후`;
  } else {
    return `${minutes}분 후`;
  }
};

const formatAutoLogoutTime = (): string => {
  if (!authState.token || !authState.expiry) return "";

  const expiry = new Date(authState.expiry);
  const now = new Date(currentTime.value); // 실시간 업데이트를 위해 currentTime 사용
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return "이미 만료됨";

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};

// Notification system for better UX without alerts
const notification = ref<{
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}>({
  show: false,
  message: "",
  type: "info",
});

const showNotification = (message: string, type: "success" | "error" | "info" = "info"): void => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString();
};

// Check connection and sync auth state on mount
onMounted(() => {
  // 현재 시간 초기화
  currentTime.value = Date.now();

  // Test connection to API
  fetch(baseUrl.value + "/health", { method: "HEAD" })
    .then(() => (isConnected.value = true))
    .catch(() => (isConnected.value = false));

  // Sync existing auth token if available
  if (authState.token) {
    const authHeader = request.headers.find((h) => h.key.toLowerCase() === "authorization");
    if (!authHeader) {
      request.headers.push({
        key: "Authorization",
        value: `Bearer ${authState.token}`,
      });
      console.log("🔐 Existing token synced (API Tester independent)");
    }

    // 기존 토큰이 있으면 자동 로그아웃 타이머 시작 (UI 업데이트 타이머 포함)
    startAutoLogoutTimer();
  } else {
    // 토큰이 없어도 UI 업데이트 타이머는 시작 (실시간 시계 역할)
    uiUpdateTimer.value = setInterval(() => {
      currentTime.value = Date.now();
    }, 1000);
  }
});

// 컴포넌트 해제 시 타이머 정리
onUnmounted(() => {
  stopAutoLogoutTimer();
});
</script>

<style scoped>
.api-tester-bg {
  width: 100%;
  height: auto;
  background: #0d1117;
}

.api-tester {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Monaco", "Menlo", monospace;
  background: #0d1117;
  color: #c9d1d9;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #1f2937, #374151);
  border-radius: 12px;
}

.header h1 {
  color: #60a5fa;
  margin-bottom: 10px;
}

.status-bar {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.indicator.connected {
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.indicator.disconnected {
  background: #ef4444;
}

.indicator.auth {
  background: #8b5cf6;
}

/* 메인 컨텐츠 좌우 분할 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

.left-panel {
  display: flex;
  flex-direction: column;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.control-panel {
  background: #161b22;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #30363d;
}

.form-row {
  display: flex;
  gap: 15px;
  align-items: end;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.flex-grow {
  flex: 1;
}

.form-group label {
  font-weight: 600;
  color: #f0f6fc;
  font-size: 14px;
}

.select,
.endpoint-input {
  padding: 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-family: inherit;
  font-size: 14px;
}

.url-input {
  display: flex;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  overflow: hidden;
}

.base-url {
  background: #2d333b;
  padding: 12px;
  border-right: 1px solid #30363d;
  color: #7d8590;
  font-size: 14px;
  white-space: nowrap;
}

.endpoint-input {
  border: none;
  background: transparent;
  flex: 1;
  outline: none;
}

.send-btn {
  background: #238636;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #2ea043;
}

.send-btn:disabled {
  background: #373e47;
  cursor: not-allowed;
}

.quick-actions {
  margin-bottom: 25px;
}

.quick-actions h3 {
  margin-bottom: 15px;
  color: #f0f6fc;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.template-btn {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.template-btn:hover {
  background: #30363d;
  border-color: #8b949e;
}

.section {
  margin-bottom: 25px;
}

.section h3 {
  color: #f0f6fc;
  margin-bottom: 15px;
}

.header-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header-row,
.form-field-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-input,
.form-input {
  flex: 1;
  padding: 8px 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-family: inherit;
  font-size: 13px;
}

.remove-btn {
  background: #da3633;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn {
  background: #0969da;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 10px;
}

.auth-section {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.auth-info {
  flex: 1;
  text-align: right;
}

.auth-info small {
  color: #7d8590;
  font-size: 12px;
  line-height: 1.4;
}

.auth-btn {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.auth-btn.secondary {
  background: #6e7681;
}

.auth-btn:disabled {
  background: #373e47;
  cursor: not-allowed;
}

.body-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.body-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.json-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.format-btn {
  background: #6f42c1;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.json-textarea,
.text-textarea {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #c9d1d9;
  font-family: "Monaco", "Menlo", monospace;
  font-size: 13px;
  line-height: 1.4;
  padding: 15px;
  resize: vertical;
  box-sizing: border-box;
}

.json-textarea.error {
  border-color: #da3633;
}

.json-error {
  color: #f85149;
  font-size: 12px;
  margin-top: 5px;
}

.response-section,
.history-section {
  background: #161b22;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #30363d;
}

.response-section h2,
.history-section h2 {
  color: #f0f6fc;
  margin-bottom: 20px;
}

.response-info {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background: #21262d;
  border-radius: 8px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  gap: 8px;
}

.label {
  color: #7d8590;
  font-weight: 600;
}

.status {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.success {
  background: #238636;
  color: white;
}
.status.redirect {
  background: #0969da;
  color: white;
}
.status.client-error {
  background: #d1242f;
  color: white;
}
.status.server-error {
  background: #a40e26;
  color: white;
}
.status.error {
  background: #6e2c00;
  color: white;
}

.response-tabs {
  display: flex;
  border-bottom: 1px solid #30363d;
  margin-bottom: 20px;
}

.tab {
  background: transparent;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  color: #7d8590;
  border-bottom: 2px solid transparent;
  font-size: 14px;
}

.tab.active {
  color: #58a6ff;
  border-bottom-color: #58a6ff;
}

.response-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.copy-btn {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.response-body,
.raw-response {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 20px;
  font-family: "Monaco", "Menlo", monospace;
  font-size: 13px;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
}

.headers-display {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.header-display-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
}

.header-key {
  color: #79c0ff;
  min-width: 150px;
  font-weight: 600;
}

.header-value {
  color: #a5d6ff;
  word-break: break-all;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: grid;
  grid-template-columns: 60px 1fr 60px 80px;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.history-item:hover {
  background: #30363d;
  border-color: #8b949e;
}

.history-method {
  font-weight: 600;
  color: #79c0ff;
  text-align: center;
  padding: 2px 6px;
  background: #1f2937;
  border-radius: 4px;
  font-size: 11px;
}

.history-url {
  color: #c9d1d9;
  font-family: "Monaco", "Menlo", monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.history-status {
  text-align: center;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.history-time {
  color: #7d8590;
  text-align: right;
  font-size: 10px;
}

.clear-history-btn {
  background: #da3633;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  width: 100%;
}

.clear-history-btn:hover {
  background: #b91c1c;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .right-panel {
    position: static;
    max-height: none;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-group.flex-grow {
    flex: none;
  }

  .template-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .response-info {
    flex-direction: column;
    gap: 10px;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .api-tester {
    padding: 10px;
  }

  .control-panel,
  .response-section,
  .history-section {
    padding: 15px;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .history-item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: left;
  }

  .history-method,
  .history-status {
    text-align: left;
  }

  .history-time {
    text-align: left;
  }

  .url-input {
    flex-direction: column;
  }

  .base-url {
    border-right: none;
    border-bottom: 1px solid #30363d;
  }

  .auth-section {
    flex-direction: column;
  }
}

/* 다크 테마 스크롤바 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #161b22;
}

::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}

/* 포커스 상태 개선 */
input:focus,
textarea:focus,
select:focus,
button:focus {
  outline: 2px solid #58a6ff;
  outline-offset: 2px;
}

/* 애니메이션 개선 */
.history-item,
.template-btn,
.tab,
.send-btn {
  transition: all 0.2s ease-in-out;
}

/* 로딩 애니메이션 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.send-btn:disabled {
  animation: pulse 2s infinite;
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
}

.notification-success {
  background: #238636;
  color: white;
}

.notification-error {
  background: #da3633;
  color: white;
}

.notification-info {
  background: #0969da;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Response status indicators */
.response-section.success {
  border-left: 4px solid #238636;
}

.response-section.error {
  border-left: 4px solid #da3633;
}

/* Loading states */
.loading-state {
  opacity: 0.6;
  pointer-events: none;
}

/* Empty State & Loading State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #7d8590;
  border: 2px dashed #30363d;
  border-radius: 8px;
  background: #0d1117;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #58a6ff;
  border: 2px solid #30363d;
  border-radius: 8px;
  background: #0d1117;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #30363d;
  border-top: 3px solid #58a6ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-state p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

/* Test mode indicator */
.api-tester::before {
  content: "🧪 TEST MODE - Safe API Testing Environment";
  display: block;
  text-align: center;
  padding: 8px;
  background: linear-gradient(45deg, #0969da, #8b5cf6);
  color: white;
  font-size: 12px;
  font-weight: 600;
  margin: -20px -20px 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Empty State & Loading State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #7d8590;
  border: 2px dashed #30363d;
  border-radius: 8px;
  background: #0d1117;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #58a6ff;
  border: 2px solid #30363d;
  border-radius: 8px;
  background: #0d1117;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #30363d;
  border-top: 3px solid #58a6ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-state p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
