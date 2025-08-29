<template>
  <div class="auth-card-position ac01 login-card">
    <!-- 좌측 이미지 영역 -->
    <div class="ac01-inner-left">
      <IconoirProvider :icon-props="iconProps">
        <LogIn />
      </IconoirProvider>
    </div>

    <!-- 우측 로그인 폼 영역 -->
    <div class="ac01-inner-right">
      <!-- 헤더 -->
      <header class="login-header">
        <h3 class="login-header__subtitle">법무대리인 등기지원시스템</h3>
        <h1 class="login-header__title">로그인</h1>
      </header>

      <!-- MAC 주소 오류 표시 -->
      <div v-if="macError" class="error-message">
        <p>⚠️ {{ macError }}</p>
        <button type="button" @click="retryGetMacAddress" class="retry-btn">다시 시도</button>
      </div>

      <!-- 로그인 폼 -->
      <form class="login-form" @submit.prevent="handleSubmit">
        <IconoirProvider :icon-props="inputIconProps">
          <!-- 아이디 입력 -->
          <div class="input-group">
            <User class="input-group__icon" />
            <input v-model="formData.userId" class="input-group__field" type="text" placeholder="아이디" autocomplete="username" />
          </div>

          <!-- 비밀번호 입력 -->
          <div class="input-group">
            <Lock class="input-group__icon" />
            <input v-model="formData.password" class="input-group__field" :type="showPassword ? 'text' : 'password'" placeholder="비밀번호" autocomplete="current-password" />
            <button type="button" class="input-group__toggle" @click="togglePasswordVisibility" :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'" tabindex="-1">
              <Eye v-if="!showPassword" />
              <EyeClosed v-else />
            </button>
          </div>

          <!-- 폼 하단 메타 정보 -->
          <div class="form-meta">
            <div class="form-meta__left">
              <button type="button" class="checkbox-btn" :class="{ 'checkbox-btn--checked': rememberUser }" @click="toggleRememberUser" :aria-label="rememberUser ? '아이디 기억하기 해제' : '아이디 기억하기'">
                <CheckSquare v-if="!rememberUser" />
                <CheckSquareSolid v-else />
                아이디 기억하기
              </button>
            </div>
            <div class="form-meta__right">
              <button type="button" class="link-btn" @click="goToPasswordReset">비밀번호 변경</button>
            </div>
          </div>
        </IconoirProvider>

        <!-- 제출 버튼 -->
        <button type="submit" class="submit-btn" :disabled="isLoginPending || isMacLoading">
          <span v-if="isMacLoading">MAC 주소 확인 중...</span>
          <span v-else-if="isLoginPending">로그인 중...</span>
          <span v-else>로그인</span>
        </button>
      </form>

      <!-- 디버그 정보 (개발 환경에서만 표시) -->
      <div v-if="isDev && currentMacAddress" class="debug-info">
        <small>🔧 현재 MAC 주소: {{ currentMacAddress }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { LogIn, User, Lock, Eye, EyeClosed, CheckSquare, CheckSquareSolid } from "@iconoir/vue";
import { ref, onMounted, reactive, computed } from "vue";
import { useLogin } from "@/composables/auth/useLogin";
import { useNavigation } from "@/composables/useNavigation";
import { useMacAddress } from "@/composables/useMacAddress";
import { isDev } from "@/utils/env";

// ==========================================
// 컴포저블
// ==========================================
const { goToPasswordReset } = useNavigation();
const { mutate: login, isPending: isLoginPending } = useLogin();

// ✅ MAC 주소 관리
const { macAddress: currentMacAddress, isLoading: isMacLoading, error: macError, fetchMacAddress, resetMacAddress } = useMacAddress();

// ==========================================
// 반응형 상태
// ==========================================
const formData = reactive({
  userId: "test1",
  password: "happyTEst2025@@#",
});

const showPassword = ref(false);
const rememberUser = ref(false);

// ==========================================
// 계산된 속성
// ==========================================

// 아이콘 속성
const iconProps = {
  color: "#FFFFFF",
  width: 180,
  height: 180,
};

const inputIconProps = {
  color: "#dddddd",
  width: 30,
  height: 30,
};

// 폼 유효성 검사
const isFormValid = computed(() => {
  return formData.userId.trim() !== "" && formData.password.trim() !== "";
});

// ==========================================
// 생명주기 훅
// ==========================================
onMounted(async () => {
  loadSavedUserData();
  await initializeMacAddress();
});

// ==========================================
// 메서드
// ==========================================

/**
 * 저장된 사용자 데이터 로드
 */
function loadSavedUserData() {
  const savedUser = localStorage.getItem("rememberedUser");
  const isRemembered = localStorage.getItem("rememberUser") === "true";

  if (isRemembered && savedUser) {
    formData.userId = savedUser;
    rememberUser.value = true;
  }
}

/**
 * MAC 주소 초기화
 */
async function initializeMacAddress() {
  try {
    await fetchMacAddress();
    console.log("✅ MAC 주소 초기화 완료:", currentMacAddress.value);
  } catch (error) {
    console.error("🚨 MAC 주소 초기화 실패:", error);
  }
}

/**
 * MAC 주소 재시도
 */
async function retryGetMacAddress() {
  resetMacAddress();
  await initializeMacAddress();
}

/**
 * 로그인 폼 제출 처리
 */
async function handleSubmit() {
  // 폼 유효성 검사
  if (!isFormValid.value) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  // MAC 주소 확인 및 재시도
  if (!currentMacAddress.value) {
    console.log("MAC 주소가 없어서 다시 가져오는 중...");
    try {
      await fetchMacAddress();
    } catch (error) {
      alert("MAC 주소를 가져올 수 없습니다. 프로그램이 정상적으로 설치되었는지 확인해주세요.");
      return;
    }
  }

  // 아이디 기억하기 처리
  handleRememberUser();

  // 로그인 API 호출
  login({
    userId: formData.userId,
    password: formData.password,
    macAddress: currentMacAddress.value,
  });
}

/**
 * 아이디 기억하기 처리
 */
function handleRememberUser() {
  if (rememberUser.value) {
    localStorage.setItem("rememberedUser", formData.userId);
    localStorage.setItem("rememberUser", "true");
  } else {
    localStorage.removeItem("rememberedUser");
    localStorage.removeItem("rememberUser");
  }
}

/**
 * 비밀번호 보기/숨기기 토글
 */
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

/**
 * 아이디 기억하기 토글
 */
function toggleRememberUser() {
  rememberUser.value = !rememberUser.value;

  // 체크 해제 시 저장된 정보 즉시 삭제
  if (!rememberUser.value) {
    localStorage.removeItem("rememberedUser");
    localStorage.removeItem("rememberUser");
  }
}
</script>

<style scoped>
/* ==========================================
   에러 메시지 스타일
   ========================================== */
.error-message {
  margin-bottom: 1rem;
  padding: 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 5px;
  color: #c33;
}

.error-message p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.retry-btn {
  background: #c33;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background: #a22;
}

/* ==========================================
   디버그 정보 스타일
   ========================================== */
.debug-info {
  margin-top: 1rem;
  padding: 8px;
  background-color: #f0f8ff;
  border: 1px solid #ccc;
  border-radius: 3px;
  text-align: center;
}

.debug-info small {
  color: #666;
  font-family: monospace;
}

/* ==========================================
   제출 버튼 비활성화 상태
   ========================================== */
.submit-btn:disabled {
  background-color: #ccc !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.submit-btn:disabled:hover {
  background-color: #ccc !important;
}

/* ==========================================
   로딩 상태 애니메이션
   ========================================== */
.submit-btn:disabled span {
  position: relative;
}

.submit-btn:disabled span::after {
  content: "";
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: translateY(-50%) rotate(0deg);
  }
  100% {
    transform: translateY(-50%) rotate(360deg);
  }
}
</style>
