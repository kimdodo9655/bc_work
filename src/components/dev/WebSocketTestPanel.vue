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

      <!-- 연결 설정 -->
      <div class="connection-panel">
        <h3>연결 설정</h3>

        <div class="form-group">
          <label for="wsUrl">WebSocket URL</label>
          <input id="wsUrl" v-model="wsUrl" type="text" :disabled="isConnected" />
        </div>

        <div class="form-group">
          <label for="authToken">JWT 토큰 (localStorage.accessToken)</label>
          <input id="authToken" v-model="authToken" type="text" readonly />
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
  type: "received" | "system" | "error";
  content: string;
  timestamp: string;
  data?: any;
}

// 반응형 상태
const wsUrl = ref<string>("ws://localhost:3000");
const authToken = ref<string>("");
const isConnected = ref<boolean>(false);
const isConnecting = ref<boolean>(false);
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

// localStorage에서 토큰 가져오기
const loadTokenFromStorage = (): void => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      authToken.value = accessToken;
      addMessage("system", `localStorage에서 토큰을 로드했습니다`);
    } else {
      authToken.value = "";
      addMessage("system", "localStorage에서 accessToken을 찾을 수 없습니다");
    }
  } catch (error) {
    authToken.value = "";
    addMessage("error", "localStorage 접근 중 오류가 발생했습니다");
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

  loadTokenFromStorage();

  if (!authToken.value) {
    addMessage("error", "localStorage에 accessToken이 없습니다");
    return;
  }

  isConnecting.value = true;
  addMessage("system", `${wsUrl.value}에 연결 시도 중...`);

  try {
    // URL 파라미터로 토큰 전달 (브라우저 WebSocket 제한 우회)
    const wsUrlWithToken = `${wsUrl.value}?token=${encodeURIComponent(authToken.value)}`;
    ws = new WebSocket(wsUrlWithToken);

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
  loadTokenFromStorage();
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

.connection-panel,
.message-panel {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
}

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
