<template>
  <div class="auth-card-position ac01 password-setup-card">
    <!-- 좌측 이미지 영역 -->
    <div class="ac01-inner-left">
      <IconoirProvider :icon-props="iconProps">
        <PasswordCursor />
      </IconoirProvider>
    </div>

    <!-- 우측 비밀번호 설정 폼 영역 -->
    <div class="ac01-inner-right">
      <!-- 헤더 -->
      <header class="password-setup-header">
        <h2 class="mb-4">비밀번호 설정</h2>
        <p class="subtext">이용하실 비밀번호를 설정하시기 바랍니다.</p>
      </header>

      <!-- 비밀번호 설정 폼 -->
      <form class="password-setup-form" @submit.prevent="handleSubmit">
        <IconoirProvider :icon-props="inputIconProps">
          <!-- 비밀번호 입력 -->
          <div class="input-group">
            <Lock class="input-group__icon" />
            <input v-model="formData.password" class="input-group__field" :type="showPassword ? 'text' : 'password'" placeholder="새 비밀번호" autocomplete="new-password" />
            <button type="button" class="input-group__toggle" @click="togglePasswordVisibility" :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'" tabindex="-1">
              <Eye v-if="!showPassword" />
              <EyeClosed v-else />
            </button>
          </div>

          <!-- 비밀번호 확인 입력 -->
          <div class="input-group">
            <Lock class="input-group__icon" />
            <input v-model="formData.confirmPassword" class="input-group__field" :type="showConfirmPassword ? 'text' : 'password'" placeholder="비밀번호 확인" autocomplete="new-password" />
            <button type="button" class="input-group__toggle" @click="toggleConfirmPasswordVisibility" :aria-label="showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'" tabindex="-1">
              <Eye v-if="!showConfirmPassword" />
              <EyeClosed v-else />
            </button>
          </div>
        </IconoirProvider>

        <!-- 제출 버튼 -->
        <button type="submit" class="submit-btn">비밀번호 설정</button>
      </form>
    </div>
  </div>

  <!-- 비밀번호 규칙 안내 -->
  <div class="auth-card-position password-setup-notice">
    <h3 class="mb-4">시스템 비밀번호 작성 규칙</h3>
    <ol class="password-setup-rules">
      <li>비밀번호는 영문, 숫자, 특수문자 조합을 통해 최소 10자리 이상으로 입력 바랍니다. (최대 16자리)</li>
      <li>비밀번호 유효기간은 최대 90일이며, 유효기간이 만료되었을 경우 비밀번호를 변경하여야 합니다</li>
      <li>
        아이디와 비밀번호가 제3자에게 노출되었을 경우 즉시 비밀번호를 변경하시기 바랍니다.
        <br />
        비밀번호 미변경으로 인해 개인정보 유출이 발생한 경우 시스템 사용자에게 책임이 전가될 수 있습니다.
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { PasswordCursor, Lock, Eye, EyeClosed } from "@iconoir/vue";
import { ref, reactive } from "vue";
import { useNavigation } from "@/composables/useNavigation";

// ==========================================
// 컴포저블
// ==========================================
const { goToLogin } = useNavigation();

// ==========================================
// 반응형 상태
// ==========================================
const formData = reactive({
  password: "",
  confirmPassword: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

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
// 메서드
// ==========================================
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function toggleConfirmPasswordVisibility() {
  showConfirmPassword.value = !showConfirmPassword.value;
}

function handleSubmit() {
  console.log("비밀번호 설정:", {
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  });

  // TODO: API 호출 로직 추가
  // 임시로 로그인 페이지로 이동
  goToLogin();
}
</script>

<style scoped>
/* 컴포넌트별 스타일은 auth.scss로 이동됨 */
</style>
