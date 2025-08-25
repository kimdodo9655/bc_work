<template>
  <TokenCountdown />
  <ul>
    <li>
      <h4>로그인</h4>
      <form @submit.prevent="onSubmit">
        <input v-model="userId" placeholder="아이디" />
        <input v-model="password" type="password" placeholder="비밀번호" />
        <button :disabled="isLoginPending">로그인</button>
        <p v-if="error">에러: {{ error.message }}</p>
      </form>
    </li>

    <li>
      <h4>토큰 갱신</h4>
      <button @click="handleRenewToken" :disabled="isRenewing">갱신</button>
    </li>

    <li>
      <h4>로그아웃</h4>
      <button @click="handleLogout" :disabled="isLogoutPending">로그아웃</button>
    </li>

    <li>
      <h4>비밀번호 변경 / mac address, 이메일 검증 및 메일 발송 API</h4>
    </li>

    <li>
      <h4>이메일 재발송 / 공통</h4>
    </li>

    <li>
      <h4>이메일 인증키 검증 API</h4>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLogin } from "@/composables/useLogin";
import { useLogout } from "@/composables/useLogout";
import { useGetToken } from "@/composables/useGetToken";
import TokenCountdown from "@/components/TokenCountdown.vue";

const userId = ref("test1");
const password = ref("happyTEst2025@@#");
const macAddress = ref("42:00:40:f2:b8:43");

// 로그인 훅
const { mutate: login, isPending: isLoginPending, error } = useLogin();

const onSubmit = () => {
  login({
    userId: userId.value,
    password: password.value,
    macAddress: macAddress.value,
  });
};

// 로그아웃 훅
const { mutate: logout, isPending: isLogoutPending } = useLogout();

const handleLogout = () => {
  logout();
};

const { mutate: renewToken, isPending: isRenewing } = useGetToken();

const handleRenewToken = () => {
  renewToken();
};
</script>
