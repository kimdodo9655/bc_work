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

      <!-- Response Examples Section - Full Width -->
      <div class="examples-section-full" v-if="selectedTemplate">
        <div class="examples-header">
          <h2>📋 Response Examples - {{ selectedTemplate.name }}</h2>
          <button @click="closeExamples" class="close-examples-btn">✕ 닫기</button>
        </div>

        <!-- Dynamic Examples Table -->
        <div v-if="selectedTemplate.examples && selectedTemplate.examples.length > 0" class="examples-content">
          <div class="examples-table-wrapper">
            <table class="examples-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Code</th>
                  <th>Response Data & Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(example, index) in selectedTemplate.examples" :key="index" :class="example.type === 'success' ? 'success-row' : 'error-row'">
                  <td>
                    <span :class="['type-badge', example.type]">{{ example.type === "success" ? "Success" : "Error" }}</span>
                  </td>
                  <td>
                    <span :class="['status-code', example.type]">{{ example.status }}</span>
                  </td>
                  <td>
                    <code>{{ example.code }}</code>
                  </td>
                  <td class="response-preview">
                    <details>
                      <summary>{{ example.message }}</summary>
                      <div class="response-content">
                        <pre>{{ JSON.stringify(example.responseData, null, 2) }}</pre>
                        <button @click="loadExample(example)" :class="['preview-btn', example.type]">Load Example</button>
                      </div>
                    </details>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Examples Yet -->
        <div v-else class="no-examples">
          <div class="no-examples-icon">📝</div>
          <h3>아직 Response Examples가 없습니다</h3>
          <p>{{ selectedTemplate.name }} API의 Response Examples는 준비 중입니다.</p>
          <div class="coming-soon">
            <span class="badge">Coming Soon</span>
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
  examples?: Array<{
    type: "success" | "error";
    status: number;
    code: string;
    message: string;
    responseData: any;
  }>;
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

// 새로 추가된 상태
const selectedTemplate = ref<ApiTemplate | null>(null);

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
        user_id: "test10",
        password: "happyTEst2025@@#",
        mac_address: "d0:11:e5:7b:11:ed",
      },
      null,
      2
    ),
    examples: [
      // SUCCESS CASES
      {
        type: "success",
        status: 200,
        code: "S-U002",
        message: "로그인이 성공했습니다.",
        responseData: {
          status: 200,
          code: "S-U002",
          title: "로그인 성공",
          message: "로그인이 성공했습니다.",
          data: {
            accessTokenExpiry: 1757577197625,
            accessToken: "eyJhbGciOiJSUzI1NiJ9.eyJ1c2VySWQiOiJ0ZXN0MiIsInJvbGUiOiJ....",
            financial: [
              {
                code: "002",
                name: "산업은행",
                isActive: true,
                logo: "kdb.png",
              },
              {
                code: "003",
                name: "기업은행",
                isActive: true,
                logo: "ibk.png",
              },
            ],
            userRole: 2,
            userId: "test2",
          },
        },
      },
      {
        type: "success",
        status: 200,
        code: "S-U005",
        message: "시스템 이용시 이메일 인증이 필요합니다. 이메일 인증을 진행합니다.",
        responseData: {
          status: 200,
          code: "S-U005",
          title: "이메일 인증 미진행",
          message: "시스템 이용시 이메일 인증이 필요합니다. 이메일 인증을 진행합니다.",
          data: null,
        },
      },
      {
        type: "success",
        status: 200,
        code: "S-U006",
        message: "비밀번호 사용일이 90일이 초과되었습니다. 비밀번호 변경을 위해 보안키가 등록된 이메일로 발송되었습니다.",
        responseData: {
          status: 200,
          code: "S-U006",
          title: "비밀번호 유효기간 초과",
          message: "비밀번호 사용일이 90일이 초과되었습니다. 비밀번호 변경을 위해 보안키가 등록된 이메일로 발송되었습니다.",
          data: null,
        },
      },
      // ERROR CASES
      {
        type: "error",
        status: 400,
        code: "E-A016",
        message: "입력된 계정 정보가 없습니다. 아이디와 비밀번호를 입력 바랍니다.",
        responseData: {
          status: 400,
          code: "E-A016",
          title: "계정 정보 미입력",
          message: "입력된 계정 정보가 없습니다. 아이디와 비밀번호를 입력 바랍니다.",
          data: null,
        },
      },
      {
        type: "error",
        status: 400,
        code: "E-A017",
        message: "mac address 자릿수가 맞지 않습니다.",
        responseData: {
          status: 400,
          code: "E-A017",
          title: "Mad address 주소 자릿수 미일치",
          message: "mac address 자릿수가 맞지 않습니다.",
          data: null,
        },
      },
      {
        type: "error",
        status: 401,
        code: "E-A005",
        message: "사전에 등록된 기기가 아닙니다. 기기 등록 후 다시 이용 바랍니다.",
        responseData: {
          status: 401,
          code: "E-A005",
          title: "사이트 접근제한 알림",
          message: "사전에 등록된 기기가 아닙니다. 기기 등록 후 다시 이용 바랍니다.",
          data: {
            accountMacAddress: "00:00:00:00:00:00",
          },
        },
      },
      {
        type: "error",
        status: 401,
        code: "E-A004",
        message: "아이디와 비밀번호가 일치하지 않습니다. 계정 정보 확인 후 다시 입력 바랍니다.",
        responseData: {
          status: 401,
          code: "E-A004",
          title: "계정 정보 미일치",
          message: "아이디와 비밀번호가 일치하지 않습니다. 계정 정보 확인 후 다시 입력 바랍니다.",
          data: null,
        },
      },
      {
        type: "error",
        status: 400,
        code: "E-A006",
        message: "계정 정보가 5회 오류가 발생하였습니다. 비밀번호 변경 업무를 진행 바랍니다.",
        responseData: {
          status: 400,
          code: "E-A006",
          title: "계정 정보 잠김",
          message: "계정 정보가 5회 오류가 발생하였습니다. 비밀번호 변경 업무를 진행 바랍니다.",
          data: null,
        },
      },
      {
        type: "error",
        status: 400,
        code: "A-E018",
        message: "mac address값이 없습니다.",
        responseData: {
          status: 400,
          code: "A-E018",
          title: "Mad address 정보 없음",
          message: "mac address값이 없습니다.",
          data: null,
        },
      },
    ],
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
        macAddress: "d0:11:e5:7b:11:ed",
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
        macAddress: "d0:11:e5:7b:11:ed",
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

// 새로 추가된 메서드들
const closeExamples = (): void => {
  selectedTemplate.value = null;
};

const loadExample = (example: any): void => {
  response.value = {
    status: example.status,
    statusText: example.type === "success" ? "OK" : "Error",
    headers: {
      "content-type": "application/json",
      "x-example": example.type,
    },
    data: example.responseData,
  } as any;

  responseTime.value = Math.floor(Math.random() * 200) + 50;
  showNotification(`${example.message} 예시를 로드했습니다.`, example.type === "success" ? "success" : "info");
};

// Methods (기존 코드 유지)
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

  authState.token = "";
  authState.expiry = 0;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("accessTokenExpiry");

  stopAutoLogoutTimer();

  showNotification("인증이 해제되었습니다.", "success");
  console.log("Auth cleared (API Tester independent state only)");
};

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
    showNotification("JSON is valid!", "success");
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
    const headers: Record<string, string> = {};
    request.headers.forEach((h) => {
      if (h.key && h.value) {
        headers[h.key] = h.value;
      }
    });

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

    const testApi = axios.create({
      baseURL: baseUrl.value,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    const config = {
      method: request.method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete",
      url: request.endpoint,
      data: body,
    };

    const result = await testApi.request(config);

    responseTime.value = Date.now() - startTime;
    response.value = result;

    if (request.endpoint === "/user/login" && result.status === 200 && result.data?.data?.accessToken) {
      const token = result.data.data.accessToken;
      const expiry = result.data.data.accessTokenExpiry;

      authState.token = token;
      authState.expiry = expiry;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("accessTokenExpiry", expiry.toString());

      autoAddAuthHeader(token);
      startAutoLogoutTimer();

      showNotification("로그인 성공! Authorization 헤더가 자동 등록되었습니다.", "success");
      console.log("Login success (API Tester independent state)");
    }

    if (request.endpoint === "/user/get-token" && result.status === 200 && result.data?.data?.accessToken) {
      const token = result.data.data.accessToken;
      const expiry = result.data.data.accessTokenExpiry;

      authState.token = token;
      authState.expiry = expiry;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("accessTokenExpiry", expiry.toString());

      autoAddAuthHeader(token);
      startAutoLogoutTimer();

      showNotification("토큰 갱신 성공! Authorization 헤더가 자동 업데이트되었습니다.", "success");
      console.log("Token refresh success (API Tester independent state)");
    }

    if (request.endpoint === "/user/logout" && result.status === 200) {
      authState.token = "";
      authState.expiry = 0;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("accessTokenExpiry");

      autoRemoveAuthHeader();
      stopAutoLogoutTimer();

      showNotification("로그아웃 성공! Authorization 헤더가 자동 삭제되었습니다.", "success");
      console.log("Logout success (API Tester independent state)");
    }

    history.value.unshift({
      method: request.method,
      endpoint: request.endpoint,
      status: result.status,
      timestamp: new Date(),
      request: { ...request, headers: [...request.headers] },
      response: result,
    });

    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20);
    }

    console.log("API Test Success:", {
      endpoint: request.endpoint,
      method: request.method,
      status: result.status,
      responseTime: responseTime.value + "ms",
    });
  } catch (err: any) {
    responseTime.value = Date.now() - startTime;
    error.value = err;
    response.value = err.response || { status: "ERROR", data: err.message };

    history.value.unshift({
      method: request.method,
      endpoint: request.endpoint,
      status: err.response?.status || "ERROR",
      timestamp: new Date(),
      request: { ...request, headers: [...request.headers] },
      response: err.response || { data: err.message },
    });

    console.error("API Test Error:", {
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

  response.value = null;
  error.value = null;

  // Show examples for selected template
  selectedTemplate.value = template;
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
  if (autoLogoutTimer.value) {
    clearInterval(autoLogoutTimer.value);
    autoLogoutTimer.value = null;
  }
  if (uiUpdateTimer.value) {
    clearInterval(uiUpdateTimer.value);
    uiUpdateTimer.value = null;
  }

  if (!authState.expiry) {
    console.log("No expiry time, cannot start timer");
    return;
  }

  console.log(`Starting auto logout timer. Expiry: ${new Date(authState.expiry).toLocaleString()}`);

  uiUpdateTimer.value = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);

  autoLogoutTimer.value = setInterval(() => {
    const now = Date.now();
    const timeLeft = authState.expiry - now;

    if (Math.floor(timeLeft / 1000) % 60 === 0 && timeLeft > 0) {
      console.log(`Token expires in: ${Math.floor(timeLeft / 1000 / 60)} minutes`);
    }

    if (authState.expiry && now >= authState.expiry) {
      console.log("Token expired, auto logout triggered");
      stopAutoLogoutTimer();

      authState.token = "";
      authState.expiry = 0;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("accessTokenExpiry");

      autoRemoveAuthHeader();
      showNotification("토큰이 만료되어 자동 로그아웃되었습니다.", "info");
    }
  }, 1000);
};

const stopAutoLogoutTimer = (): void => {
  if (autoLogoutTimer.value) {
    console.log("Stopping auto logout timer");
    clearInterval(autoLogoutTimer.value);
    autoLogoutTimer.value = null;
  }
  if (uiUpdateTimer.value) {
    console.log("Stopping UI update timer");
    clearInterval(uiUpdateTimer.value);
    uiUpdateTimer.value = null;
  }
};

const formatTokenExpiry = (): string => {
  if (!authState.token || !authState.expiry) return "";
  const expiry = new Date(authState.expiry);
  const now = new Date(currentTime.value);
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
  const now = new Date(currentTime.value);
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
  currentTime.value = Date.now();

  fetch(baseUrl.value + "/health", { method: "HEAD" })
    .then(() => (isConnected.value = true))
    .catch(() => (isConnected.value = false));

  if (authState.token) {
    const authHeader = request.headers.find((h) => h.key.toLowerCase() === "authorization");
    if (!authHeader) {
      request.headers.push({
        key: "Authorization",
        value: `Bearer ${authState.token}`,
      });
      console.log("Existing token synced (API Tester independent)");
    }

    startAutoLogoutTimer();
  } else {
    uiUpdateTimer.value = setInterval(() => {
      currentTime.value = Date.now();
    }, 1000);
  }
});

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
  margin-bottom: 30px;
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
  color: #f0f6fc;
  margin-bottom: 15px;
  border-bottom: 1px solid #30363d;
  padding-bottom: 10px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
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

/* Response Examples Section - Full Width */
.examples-section-full {
  background: #161b22;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #30363d;
  margin-top: 30px;
  animation: slideDown 0.3s ease-out;
}

.examples-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #30363d;
}

.examples-header h2 {
  color: #f0f6fc;
  margin: 0;
  font-size: 20px;
}

.close-examples-btn {
  background: #da3633;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.close-examples-btn:hover {
  background: #b91c1c;
}

.examples-content {
  overflow-x: auto;
}

.examples-table-wrapper {
  min-width: 800px;
}

.examples-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: #0d1117;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #30363d;
}

.examples-table th,
.examples-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #30363d;
  text-align: left;
  vertical-align: top;
}

.examples-table th {
  background: #21262d;
  color: #f0f6fc;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.success-row {
  background: rgba(35, 134, 54, 0.05);
}

.error-row {
  background: rgba(218, 54, 51, 0.05);
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-badge.success {
  background: rgba(35, 134, 54, 0.2);
  color: #3fb950;
}

.type-badge.error {
  background: rgba(218, 54, 51, 0.2);
  color: #f85149;
}

.status-code {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-family: monospace;
  font-size: 12px;
}

.status-code.success {
  background: #238636;
  color: white;
}

.status-code.error {
  background: #da3633;
  color: white;
}

.response-preview details {
  cursor: pointer;
}

.response-preview summary {
  color: #58a6ff;
  font-size: 12px;
  margin-bottom: 8px;
}

.response-preview pre {
  background: #21262d;
  padding: 10px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 150px;
  overflow-y: auto;
  margin: 8px 0 0 0;
}

.response-content {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
}

.preview-btn.success {
  background: #238636;
  color: white;
}

.preview-btn.success:hover {
  background: #2ea043;
}

.preview-btn.error {
  background: #da3633;
  color: white;
}

.preview-btn.error:hover {
  background: #e5534b;
}

code {
  background: #21262d;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Monaco", "Menlo", monospace;
  font-size: 11px;
  color: #79c0ff;
}

/* No Examples State */
.no-examples {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #7d8590;
  border: 2px dashed #30363d;
  border-radius: 12px;
  background: #0d1117;
}

.no-examples-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-examples h3 {
  color: #f0f6fc;
  margin: 0 0 10px 0;
  font-size: 18px;
}

.no-examples p {
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #8b949e;
}

.coming-soon {
  display: flex;
  justify-content: center;
}

.badge {
  background: linear-gradient(45deg, #8b5cf6, #06b6d4);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
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
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .response-info {
    flex-direction: column;
    gap: 10px;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
  }

  .examples-table-wrapper {
    min-width: 600px;
  }
}

@media (max-width: 768px) {
  .api-tester {
    padding: 10px;
  }

  .control-panel,
  .response-section,
  .history-section,
  .examples-section-full {
    padding: 15px;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .examples-table {
    font-size: 11px;
  }

  .examples-table th,
  .examples-table td {
    padding: 8px 4px;
  }

  .response-preview pre {
    font-size: 10px;
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

  .examples-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .examples-table-wrapper {
    min-width: 500px;
  }

  .no-examples-icon {
    font-size: 48px;
  }

  .no-examples h3 {
    font-size: 16px;
  }

  .no-examples p {
    font-size: 13px;
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
.send-btn,
.preview-btn {
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Status class helper for history items */
.history-status.success {
  background: #238636;
  color: white;
}

.history-status.redirect {
  background: #0969da;
  color: white;
}

.history-status.client-error {
  background: #d1242f;
  color: white;
}

.history-status.server-error {
  background: #a40e26;
  color: white;
}

.history-status.error {
  background: #6e2c00;
  color: white;
}

.history-status.unknown {
  background: #6e7681;
  color: white;
}
</style>
