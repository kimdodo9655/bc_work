<template>
  <div class="container">
    <div class="header">
      <h1>WebSocket Test Client</h1>
      <p>간단한 WebSocket 연결 테스트 클라이언트</p>
    </div>

    <div class="content">
      <!-- 연결 상태 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">
            <span :class="statusIndicatorClass" class="status-indicator"></span>
            {{ connectionStatus }}
          </div>
          <div class="stat-label">연결 상태</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ messageCount }}</div>
          <div class="stat-label">수신된 메시지</div>
        </div>
      </div>

      <!-- API 발송 패널 -->
      <div class="api-panel">
        <h3>API 테스트</h3>
        <div class="form-group">
          <label for="apiUrl">API URL</label>
          <input id="apiUrl" v-model="apiUrl" type="text" />
        </div>
        <div class="form-group">
          <label for="targetUserId">대상 사용자 ID</label>
          <input id="targetUserId" v-model="targetUserId" type="text" placeholder="알람을 받을 사용자 ID" />
        </div>
        <button @click="sendApiRequest" class="btn btn-info" :disabled="isSendingApi">
          {{ isSendingApi ? "전송 중..." : "알람 발송" }}
        </button>
      </div>

      <!-- 연결 설정 -->
      <div class="connection-panel">
        <h3>연결 설정</h3>

        <div class="form-group">
          <label for="wsUrl">WebSocket URL</label>
          <input id="wsUrl" v-model="wsUrl" type="text" :disabled="isConnected" />
        </div>

        <div class="form-group">
          <label for="userId">사용자 ID (localStorage.userId)</label>
          <input id="userId" v-model="userId" type="text" readonly />
        </div>

        <button v-if="!isConnected" @click="connect" class="btn btn-primary" :disabled="isConnecting">
          {{ isConnecting ? "연결 중..." : "연결" }}
        </button>

        <button v-if="isConnected" @click="disconnect" class="btn btn-danger">연결 해제</button>

        <button @click="clearMessages" class="btn btn-success">메시지 초기화</button>
      </div>

      <!-- 메시지 로그 -->
      <div class="message-panel">
        <h3>메시지 로그</h3>
        <div class="message-list" ref="messageListRef">
          <div v-for="(message, index) in messages" :key="index" :class="['message-item', getMessageClass(message.type)]">
            <div class="message-timestamp">{{ message.timestamp }}</div>
            <div>{{ message.content }}</div>
            <div v-if="message.data" class="json-view">
              {{ formatJson(message.data) }}
            </div>
          </div>
          <div v-if="messages.length === 0" class="empty-messages">아직 메시지가 없습니다.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

// 타입 정의
interface Message {
  type: "received" | "system" | "error" | "api-success" | "api-error";
  content: string;
  timestamp: string;
  data?: any;
}

// 반응형 상태
const wsUrl = ref<string>("ws://localhost:3000");
const apiUrl = ref<string>("http://localhost:8100/test/alarm-send");
const targetUserId = ref<string>("test2");
const userId = ref<string>("");
const isConnected = ref<boolean>(false);
const isConnecting = ref<boolean>(false);
const isSendingApi = ref<boolean>(false);
const messages = ref<Message[]>([]);
const messageCount = ref<number>(0);

// 템플릿 참조
const messageListRef = ref<HTMLElement>();

// WebSocket 변수
let ws: WebSocket | null = null;

// 연결 상태 계산된 속성
const connectionStatus = computed<string>(() => {
  if (isConnecting.value) return "연결 중";
  return isConnected.value ? "연결됨" : "연결 안됨";
});

const statusIndicatorClass = computed<string>(() => {
  if (isConnecting.value) return "status-connecting";
  return isConnected.value ? "status-connected" : "status-disconnected";
});

// localStorage에서 userId 가져오기
const loadUserIdFromStorage = (): void => {
  try {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      userId.value = storedUserId;
      addMessage("system", `localStorage에서 userId를 로드했습니다: ${storedUserId}`);
    } else {
      userId.value = "";
      addMessage("system", "localStorage에서 userId를 찾을 수 없습니다");
    }
  } catch (error) {
    userId.value = "";
    addMessage("error", "localStorage 접근 중 오류가 발생했습니다");
  }
};

// API 요청 보내기
const sendApiRequest = async (): Promise<void> => {
  if (isSendingApi.value) return;

  if (!targetUserId.value.trim()) {
    addMessage("error", "대상 사용자 ID를 입력해주세요");
    return;
  }

  isSendingApi.value = true;

  try {
    addMessage("system", `API 요청 전송 중... (대상: ${targetUserId.value})`);

    const response = await fetch(apiUrl.value, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: targetUserId.value,
      }),
    });

    const responseData = await response.json();

    if (response.ok) {
      addMessage("api-success", `API 요청 성공 (상태: ${response.status})`, responseData);
    } else {
      addMessage("api-error", `API 요청 실패 (상태: ${response.status})`, responseData);
    }
  } catch (error) {
    addMessage("api-error", `API 요청 중 오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
  } finally {
    isSendingApi.value = false;
  }
};

// 메시지 추가 함수
const addMessage = (type: Message["type"], content: string, data: any = null): void => {
  const message: Message = {
    type,
    content,
    timestamp: new Date().toLocaleTimeString(),
    data,
  };

  messages.value.push(message);

  if (type === "received") messageCount.value++;

  // 자동 스크롤
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

// 메시지 클래스 결정
const getMessageClass = (type: Message["type"]): string => {
  return `message-${type}`;
};

// JSON 포맷팅
const formatJson = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(data);
  }
};

// WebSocket 연결
const connect = (): void => {
  if (isConnected.value || isConnecting.value) return;

  loadUserIdFromStorage();

  if (!userId.value) {
    addMessage("error", "localStorage에 userId가 없습니다");
    return;
  }

  isConnecting.value = true;
  addMessage("system", `${wsUrl.value}에 연결 시도 중...`);

  try {
    // URL 파라미터로 userId 전달
    const wsUrlWithUserId = `${wsUrl.value}?userId=${encodeURIComponent(userId.value)}`;
    ws = new WebSocket(wsUrlWithUserId);

    ws.onopen = (_event: Event) => {
      isConnected.value = true;
      isConnecting.value = false;
      addMessage("system", "서버에 연결되었습니다");
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        let content = `타입: ${data.type || "unknown"}`;
        if (data.message) content += `, 메시지: ${data.message}`;
        if (data.userId) content += `, 사용자ID: ${data.userId}`;

        addMessage("received", content, data);
      } catch (e) {
        addMessage("received", `원시 데이터: ${event.data}`);
      }
    };

    ws.onclose = (event: CloseEvent) => {
      isConnected.value = false;
      isConnecting.value = false;

      const reason = event.code === 1000 ? "정상 종료" : event.code === 1006 ? "비정상 종료" : event.code === 1008 ? "인증 실패" : `종료 (코드: ${event.code})`;

      addMessage("system", `연결이 종료되었습니다. ${reason}`);
    };

    ws.onerror = (_event: Event) => {
      isConnecting.value = false;
      addMessage("error", "연결 중 오류가 발생했습니다");
    };
  } catch (error) {
    isConnecting.value = false;
    addMessage("error", `연결 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
  }
};

// WebSocket 연결 해제
const disconnect = (): void => {
  if (ws && isConnected.value) {
    ws.close(1000, "User requested disconnect");
    ws = null;
  }
};

// 메시지 초기화
const clearMessages = (): void => {
  messages.value = [];
  messageCount.value = 0;
  addMessage("system", "메시지가 초기화되었습니다");
};

// 라이프사이클 훅
onMounted(() => {
  addMessage("system", "WebSocket 테스트 클라이언트가 준비되었습니다");
  loadUserIdFromStorage();
});

onUnmounted(() => {
  disconnect();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  text-align: center;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.header p {
  opacity: 0.9;
}

.content {
  padding: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  color: #6c757d;
  font-size: 14px;
}

.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-connected {
  background: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

.status-disconnected {
  background: #dc3545;
}

.status-connecting {
  background: #ffc107;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.api-panel,
.connection-panel,
.message-panel {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
}

.api-panel h3,
.connection-panel h3,
.message-panel h3 {
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
  margin-bottom: 10px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.message-list {
  background: #1e1e1e;
  color: #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  height: 400px;
  overflow-y: auto;
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.4;
}

.message-item {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 5px;
  border-left: 4px solid;
}

.message-received {
  background: rgba(40, 167, 69, 0.1);
  border-left-color: #28a745;
}

.message-system {
  background: rgba(255, 193, 7, 0.1);
  border-left-color: #ffc107;
}

.message-error {
  background: rgba(220, 53, 69, 0.1);
  border-left-color: #dc3545;
}

.message-api-success {
  background: rgba(23, 162, 184, 0.1);
  border-left-color: #17a2b8;
}

.message-api-error {
  background: rgba(220, 53, 69, 0.1);
  border-left-color: #dc3545;
}

.message-timestamp {
  color: #6c757d;
  font-size: 11px;
  margin-bottom: 5px;
}

.json-view {
  background: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  color: #333;
  margin-top: 10px;
}

.empty-messages {
  text-align: center;
  color: #6c757d;
  padding: 50px;
}

@media (max-width: 768px) {
  .content {
    padding: 20px;
  }
}
</style>
