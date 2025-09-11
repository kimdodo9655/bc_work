<template>
  <TokenCountdown v-if="true" />
  <ul v-if="true">
    <!-- 로그인 -->
    <li>
      <h4>로그인</h4>
      <form @submit.prevent="onSubmit">
        <input v-model="userId" placeholder="아이디" />
        <input v-model="password" type="password" placeholder="비밀번호" />
        <button :disabled="isLoggingIn">로그인</button>
        <p v-if="loginError">에러: {{ loginError?.message }}</p>
      </form>
    </li>

    <!-- 토큰 갱신 -->
    <li>
      <h4>토큰 갱신</h4>
      <button @click="handleRenewToken" :disabled="isRenewing">갱신</button>
    </li>

    <!-- 로그아웃 -->
    <li>
      <h4>로그아웃</h4>
      <button @click="handleLogout" :disabled="isLoggingOut">로그아웃</button>
    </li>

    <!-- 비밀번호 변경 전 인증 이메일 발송 -->
    <li>
      <h4>비밀번호 변경 / mac address, 이메일 검증 및 메일 발송 API</h4>
      <button @click="handleSendSecureEmail">비밀번호 변경 인증 메일 발송</button>
    </li>

    <!-- 이메일 인증키 검증 -->
    <li>
      <h4>이메일 인증키 검증 API</h4>
      <input v-model="emailAuthKey" placeholder="이메일 인증키 입력" />
      <button @click="handleVerifyEmailKey">이메일 인증키 검증</button>
    </li>

    <!-- 인증 메일 재발송 -->
    <li>
      <h4>이메일 재발송 / 공통</h4>
      <button @click="handleResendEmail">인증 메일 재발송</button>
    </li>

    <!-- 비밀번호 변경 -->
    <li>
      <h4>비밀번호 변경 API</h4>
      <input v-model="newPassword" placeholder="새 비밀번호" />
      <button @click="handleChangePassword">비밀번호 변경</button>
    </li>

    <!-- 로그인 후 비밀번호 변경 -->
    <li>
      <h4>비밀번호 변경 API (로그인 이후)</h4>
      <input v-model="newPassword" placeholder="새 비밀번호" />
      <button @click="handleChangeMyPassword">로그인 후 비밀번호 변경</button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from "vue";

import TokenCountdown from "@/components/TokenCountdown.vue";

// 🔐 Auth 관련 훅 (통합된 useAuth 사용)
import { useAuth } from "@/composables/useAuth";

// 🧾 기본 사용자 입력
const userId = ref("test1");
const password = ref("happyTEst2025@@#");
const macAddress = ref("42:00:40:f2:b8:43");
const emailAuthKey = ref("");
const newPassword = ref("NewPassword123!");

// ✅ 통합된 useAuth 사용
const { login, logout, renewToken, sendSecureEmail, verifyEmailKey, resendEmail, changePassword, changeMyPassword, isLoggingIn, isLoggingOut, isRenewing, loginError } = useAuth();

// ✅ 로그인
const onSubmit = () => {
  login.mutate({
    userId: userId.value,
    password: password.value,
  });
};

// ✅ 토큰 갱신
const handleRenewToken = () => {
  renewToken.mutate();
};

// ✅ 로그아웃
const handleLogout = () => {
  logout.mutate();
};

// ✅ 비밀번호 변경 전 인증 메일 발송
const handleSendSecureEmail = () => {
  sendSecureEmail.mutate({
    macAddress: macAddress.value,
  });
};

// ✅ 이메일 인증키 검증
const handleVerifyEmailKey = () => {
  verifyEmailKey.mutate({
    macAddress: macAddress.value,
    emailAuthKey: emailAuthKey.value,
  });
};

// ✅ 이메일 인증 메일 재발송
const handleResendEmail = () => {
  resendEmail.mutate({
    macAddress: macAddress.value,
  });
};

// ✅ 비밀번호 변경
const handleChangePassword = () => {
  changePassword.mutate({
    newPassword: newPassword.value,
    macAddress: macAddress.value,
  });
};

// ✅ 로그인 후 비밀번호 변경
const handleChangeMyPassword = () => {
  changeMyPassword.mutate({
    newPassword: newPassword.value,
    macAddress: macAddress.value,
  });
};
</script>
