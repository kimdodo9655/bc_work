<template>
  <form @submit.prevent="onSubmit">
    <input v-model="userId" placeholder="아이디" />
    <input v-model="password" type="password" placeholder="비밀번호" />
    <button :disabled="isPending">로그인</button>
    <p v-if="error">에러: {{ error.message }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLogin } from "@/composables/useLogin";

const userId = ref("test1");
const password = ref("happyTEst2025@@#");
const macAddress = ref("42:00:40:f2:b8:43");

const { mutate, isPending, error } = useLogin();

const onSubmit = () => {
  mutate({
    userId: userId.value,
    password: password.value,
    macAddress: macAddress.value,
  });
};
</script>
