<template>
  <div class="auth-card-position ac01 login-card">
    <div class="ac01-inner-left">
      <IconoirProvider :icon-props="{ color: '#FFFFFF', width: 180, height: 180 }">
        <LogIn />
      </IconoirProvider>
    </div>

    <div class="ac01-inner-right">
      <header class="login-card__header">
        <h3 class="login-card__subtitle mb-4">법무대리인 등기지원시스템</h3>
        <h1 class="login-card__title">로그인</h1>
      </header>

      <form class="login-form" @submit.prevent="onSubmit">
        <IconoirProvider :icon-props="{ color: '#dddddd', width: 30, height: 30 }">
          <!-- 아이디 입력 필드 -->
          <div class="input-wrapper">
            <User class="input-icon" />
            <input class="login-form__input" type="text" v-model="userId" placeholder="아이디" />
          </div>

          <!-- 비밀번호 입력 필드 -->
          <div class="input-wrapper">
            <Lock class="input-icon" />
            <input class="login-form__input" :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="비밀번호" />
            <button type="button" class="password-toggle" @click="togglePasswordVisibility" :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'" tabindex="-1">
              <Eye v-if="!showPassword" />
              <EyeClosed v-else />
            </button>
          </div>

          <ul class="login-form__meta">
            <li class="login-form__remember" :class="rememberUser ? 'checked' : ''">
              <button type="button" class="remember-toggle" @click="toggleRememberUser" :aria-label="rememberUser ? '아이디 기억하기 해제' : '아이디 기억하기'">
                <CheckSquare v-if="!rememberUser" />
                <CheckSquareSolid v-else />
                아이디 기억하기
              </button>
            </li>
            <li class="login-form__link">
              <button type="button" @click="goToLogin">비밀번호 변경</button>
            </li>
          </ul>
        </IconoirProvider>

        <button class="login-form__submit link_btn" type="submit">로그인</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { LogIn, User, Lock, Eye, EyeClosed, CheckSquare, CheckSquareSolid } from "@iconoir/vue";
import { ref, onMounted } from "vue";
import { useLogin } from "@/composables/auth/useLogin";
import { useNavigation } from "@/composables/useNavigation";

const { goToLogin } = useNavigation();

// 🧾 폼 데이터
const userId = ref("test1");
const password = ref("happyTEst2025@@#");
const showPassword = ref(false);
const rememberUser = ref(false);
const macAddress = ref("42:00:40:f2:b8:43"); // MAC 주소는 실제로는 시스템에서 가져와야 함

// ✅ 로그인 훅
const { mutate: login } = useLogin();

// 컴포넌트 마운트 시 저장된 아이디 불러오기
onMounted(() => {
  const savedUser = localStorage.getItem("rememberedUser");
  const isRemembered = localStorage.getItem("rememberUser") === "true";

  if (isRemembered && savedUser) {
    userId.value = savedUser;
    rememberUser.value = true;
  }
});

// 로그인 제출
const onSubmit = () => {
  if (!userId.value || !password.value) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  // 아이디 기억하기 처리
  if (rememberUser.value) {
    localStorage.setItem("rememberedUser", userId.value);
    localStorage.setItem("rememberUser", "true");
  } else {
    localStorage.removeItem("rememberedUser");
    localStorage.removeItem("rememberUser");
  }

  // API 호출
  login({
    userId: userId.value,
    password: password.value,
    macAddress: macAddress.value,
  });
};

// UI 상호작용 함수들
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function toggleRememberUser() {
  rememberUser.value = !rememberUser.value;

  // 즉시 체크 해제 시 저장된 정보 삭제
  if (!rememberUser.value) {
    localStorage.removeItem("rememberedUser");
    localStorage.removeItem("rememberUser");
  }
}
</script>

<style scoped>
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .login-form__input {
  padding-left: 60px;
  padding-right: 65px;
  margin-bottom: 0;
}

.input-wrapper:not(:has(.password-toggle)) .login-form__input {
  padding-right: 20px;
}

.input-icon {
  position: absolute;
  left: 15px;
  z-index: 1;
  pointer-events: none;
  transition: color 0.2s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #90cbcd;
}

.password-toggle {
  position: absolute;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  outline: none;
}

.input-wrapper svg {
  transition: 0.2s;
  stroke-width: 2px;
}

.password-toggle:hover svg {
  color: #90cbcd;
}

.password-toggle:focus {
  outline: none;
}

/* 아이디 기억하기 스타일 */
.login-form__remember {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: all 0.2s ease;
}

.remember-toggle:focus-visible {
  outline: 5px solid #cadfdf;
}

/* 체크 해제 상태 (기본) */
.remember-toggle svg {
  width: 25px;
  height: 25px;
  stroke-width: 2px;
  color: #bbbbbb;
  margin-right: 10px;
}

.remember-toggle {
  font-size: 16px;
  font-weight: 600;
  color: #bbbbbb;
  display: flex;
  align-items: flex-start;
  padding-right: 5px;
}

/* 호버 상태 */
.login-form__remember:hover .remember-toggle svg,
.login-form__remember:hover .remember-toggle {
  color: #5f9ea0;
}

.login-form__meta {
  align-items: center;
}

.login-form__remember.checked .remember-toggle svg,
.login-form__remember.checked .remember-toggle {
  color: #5f9ea0;
}

.login-form__link button {
  border: 0;
  background-color: unset;
  font-size: 16px;
  font-weight: 600;
  color: #5f9ea0;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
}

.login-form__link button:focus-visible {
  outline: 5px solid #cadfdf;
}
</style>
