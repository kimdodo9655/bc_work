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
        <button type="submit" class="submit-btn">로그인</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { LogIn, User, Lock, Eye, EyeClosed, CheckSquare, CheckSquareSolid } from "@iconoir/vue";
import { ref, onMounted, reactive } from "vue";
import { useLogin } from "@/composables/auth/useLogin";
import { useNavigation } from "@/composables/useNavigation";

// ==========================================
// 컴포저블
// ==========================================
const { goToPasswordReset } = useNavigation();
const { mutate: login } = useLogin();

// ==========================================
// 반응형 상태
// ==========================================
const formData = reactive({
  userId: "test1",
  password: "happyTEst2025@@#",
});

const showPassword = ref(false);
const rememberUser = ref(false);

// 실제로는 시스템에서 가져와야 할 MAC 주소
const macAddress = "42:00:40:f2:b8:43";

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

// ==========================================
// 생명주기 훅
// ==========================================
onMounted(() => {
  loadSavedUserData();
});

// ==========================================
// 메서드
// ==========================================
function loadSavedUserData() {
  const savedUser = localStorage.getItem("rememberedUser");
  const isRemembered = localStorage.getItem("rememberUser") === "true";

  if (isRemembered && savedUser) {
    formData.userId = savedUser;
    rememberUser.value = true;
  }
}

function handleSubmit() {
  // 아이디 기억하기 처리
  handleRememberUser();

  // 로그인 API 호출
  login({
    userId: formData.userId,
    password: formData.password,
    macAddress,
  });
}

function handleRememberUser() {
  if (rememberUser.value) {
    localStorage.setItem("rememberedUser", formData.userId);
    localStorage.setItem("rememberUser", "true");
  } else {
    localStorage.removeItem("rememberedUser");
    localStorage.removeItem("rememberUser");
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function toggleRememberUser() {
  rememberUser.value = !rememberUser.value;

  // 체크 해제 시 저장된 정보 즉시 삭제
  if (!rememberUser.value) {
    localStorage.removeItem("rememberedUser");
    localStorage.removeItem("rememberUser");
  }
}
</script>
