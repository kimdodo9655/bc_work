<template>
  <!-- 로그인 -->
  <div class="auth-bg">
    <div class="auth-card">
      <div class="auth-inner-left">
        <IconoirProvider :icon-props="{ color: '#FFFFFF', width: 150, height: 150, strokeWidth: 1.5 }">
          <LogIn />
        </IconoirProvider>
      </div>
      <div class="auth-inner-right">
        <header>
          <h3 class="mb-4">법무대리인 등기지원시스템</h3>
          <h1>로그인</h1>
        </header>

        <form class="login-form" @submit.prevent="onSubmit">
          <input v-model="userId" placeholder="아이디" />
          <input v-model="password" type="password" placeholder="비밀번호" />
          <ul>
            <li>
              <label>
                <input type="checkbox" />
                아이디 기억하기
              </label>
            </li>
            <li>
              <a href="#">비밀번호 변경</a>
            </li>
          </ul>
          <button :disabled="isLoginPending">로그인</button>
        </form>
      </div>
    </div>
  </div>

  <TokenCountdown v-if="false" />
  <ul v-if="false">
    <!-- 로그인 -->
    <li>
      <h4>로그인</h4>
      <form @submit.prevent="onSubmit">
        <input v-model="userId" placeholder="아이디" />
        <input v-model="password" type="password" placeholder="비밀번호" />
        <button :disabled="isLoginPending">로그인</button>
        <p v-if="error">에러: {{ error?.message }}</p>
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
      <button @click="handleLogout" :disabled="isLogoutPending">로그아웃</button>
    </li>

    <!-- 비밀번호 변경 전 인증 이메일 발송 -->
    <li>
      <h4>비밀번호 변경 / mac address, 이메일 검증 및 메일 발송 API</h4>
      <button @click="sendAuthEmailBeforeChgPwd">비밀번호 변경 인증 메일 발송</button>
    </li>

    <!-- 이메일 인증키 검증 -->
    <li>
      <h4>이메일 인증키 검증 API</h4>
      <input v-model="emailAuthKey" placeholder="이메일 인증키 입력" />
      <button @click="verifyEmailKey">이메일 인증키 검증</button>
    </li>

    <!-- 인증 메일 재발송 -->
    <li>
      <h4>이메일 재발송 / 공통</h4>
      <button @click="sendAuthEmail">인증 메일 재발송</button>
    </li>

    <!-- 비밀번호 변경 -->
    <li>
      <h4>비밀번호 변경 API</h4>
      <input v-model="newPassword" placeholder="새 비밀번호" />
      <button @click="changePwd">비밀번호 변경</button>
    </li>

    <!-- 로그인 후 비밀번호 변경 -->
    <li>
      <h4>비밀번호 변경 API (로그인 이후)</h4>
      <input v-model="newPassword" placeholder="새 비밀번호" />
      <button @click="changeMyPwd">로그인 후 비밀번호 변경</button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { LogIn } from "@iconoir/vue";
import { ref } from "vue";
// import { useRouter } from "vue-router";

import TokenCountdown from "@/components/TokenCountdown.vue";

// 🔐 Auth 관련 훅
import { useLogin } from "@/composables/auth/useLogin";
import { useLogout } from "@/composables/auth/useLogout";
import { useGetToken } from "@/composables/auth/useGetToken";

// 🔒 사용자 보안 관련 훅
import { useSendAuthEmailBeforeChgPwd } from "@/composables/userSecurity/useSendAuthEmailBeforeChgPwd";
import { useSendAuthEmail } from "@/composables/userSecurity/useSendAuthEmail";
import { useVerifyEmailAuthKey } from "@/composables/userSecurity/useVerifyEmailAuthKey";
import { useChangePassword } from "@/composables/userSecurity/useChangePassword";
import { useChangeMyPassword } from "@/composables/userSecurity/useChangeMyPassword";

// 🧾 기본 사용자 입력
const userId = ref("test1");
const password = ref("happyTEst2025@@#");
const macAddress = ref("42:00:40:f2:b8:43");
const emailAuthKey = ref("");
const newPassword = ref("NewPassword123!");

// ✅ 로그인
const { mutate: login, isPending: isLoginPending, error } = useLogin();
const onSubmit = () => {
  login({
    userId: userId.value,
    password: password.value,
    macAddress: macAddress.value,
  });
};

// ✅ 토큰 갱신
const { mutate: renewToken, isPending: isRenewing } = useGetToken();
const handleRenewToken = () => {
  renewToken();
};

// ✅ 로그아웃
const { mutate: logout, isPending: isLogoutPending } = useLogout();
const handleLogout = () => {
  logout();
};

// ✅ 비밀번호 변경 전 인증 메일 발송
const { mutate: sendSecureEmail } = useSendAuthEmailBeforeChgPwd();
const sendAuthEmailBeforeChgPwd = () => {
  sendSecureEmail({
    macAddress: macAddress.value,
  });
};

// ✅ 이메일 인증키 검증
const { mutate: verifyKey } = useVerifyEmailAuthKey();
const verifyEmailKey = () => {
  verifyKey({
    macAddress: macAddress.value,
    emailAuthKey: emailAuthKey.value,
  });
};

// ✅ 이메일 인증 메일 재발송
const { mutate: resendEmail } = useSendAuthEmail();
const sendAuthEmail = () => {
  resendEmail({
    macAddress: macAddress.value,
  });
};

// ✅ 비밀번호 변경
const { mutate: changePassword } = useChangePassword();
const changePwd = () => {
  changePassword({
    newPassword: newPassword.value,
    macAddress: macAddress.value,
  });
};

// ✅ 로그인 후 비밀번호 변경
const { mutate: changePasswordAfterLogin } = useChangeMyPassword();
const changeMyPwd = () => {
  changePasswordAfterLogin({
    newPassword: newPassword.value,
    macAddress: macAddress.value,
  });
};
</script>
