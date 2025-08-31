<template>
  <div class="auth-card-position ac01 pw-setup-card">
    <div class="ac01-inner-left">
      <IconoirProvider
        :icon-props="{
          color: '#FFFFFF',
          width: 130,
          height: 130,
          strokeWidth: 1.5,
        }"
      >
        <PasswordCursor />
      </IconoirProvider>
    </div>

    <div class="ac01-inner-right">
      <header>
        <h2 class="mb-4">비밀번호 설정</h2>

        <p class="subtext">이용하실 비밀번호를 설정하시기 바랍니다.</p>
      </header>

      <form class="pw-setup-form">
        <IconoirProvider :icon-props="inputIconProps">
          <!-- 비밀번호 입력 -->
          <div class="input-group">
            <Lock class="input-group__icon" />
            <input
              v-model="formData.password"
              class="input-group__field"
              :type="showPassword ? 'text' : 'password'"
              placeholder="비밀번호"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="input-group__toggle"
              @click="togglePasswordVisibility"
              :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
              tabindex="-1"
            >
              <Eye v-if="!showPassword" />
              <EyeClosed v-else />
            </button>
          </div>
          <!-- 비밀번호 재입력 -->
          <div class="input-group">
            <Lock class="input-group__icon" />
            <input
              v-model="formData.password"
              class="input-group__field"
              :type="showPassword ? 'text' : 'password'"
              placeholder="비밀번호"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="input-group__toggle"
              @click="togglePasswordVisibility"
              :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
              tabindex="-1"
            >
              <Eye v-if="!showPassword" />
              <EyeClosed v-else />
            </button>
          </div>
        </IconoirProvider>

        <!-- 제출 버튼 -->
        <button type="submit" class="submit-btn">로그인</button>
      </form>
    </div>
  </div>
  <div class="auth-card-position site-blocked-notice">
    <h3 class="mb-4">시스템 비밀번호 작성 규칙</h3>
    <p class="mb-1">
      1. 비밀번호는 영문, 숫자, 특수문자 조합을 통해 최소 10자리 이상으로 입력
      바랍니다. (최대 16자리)
    </p>
    <p class="mb-1">
      2. 비밀번호 유효기간은 최대 90일이며, 유효기간이 만료되었을 경우
      비밀번호를 변경하여야 합니다
    </p>
    <p>
      3. 아이디와 비밀번호가 제3자에게 노출되었을 경우 즉시 비밀번호를
      변경하시기 바랍니다.
      <br />
      비밀번호 미변경으로 인해 개인정보 유출이 발생한 경우 시스템 사용자에게
      책임이 전가될 수 있습니다.
    </p>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from '@iconoir/vue';
import { PasswordCursor, Lock, Eye, EyeClosed } from '@iconoir/vue';

import { ref, reactive } from 'vue';

const formData = reactive({
  password: 'happyTEst2025@@#',
});

const showPassword = ref(false);

// 아이콘 속성

const inputIconProps = {
  color: '#dddddd',
  width: 30,
  height: 30,
};

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}
</script>
