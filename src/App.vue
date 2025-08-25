<script setup lang="ts">
import api from "@/api/axios";

import ApiTest from "@/views/ApiTest.vue";
import Footer from "@/components/layout/Footer.vue";
import DevBanner from "@/components/layout/DevBanner.vue";

const showDevBanner = import.meta.env.VITE_SHOW_DEV === "true";

// 페이지 접속 시 Authorization 상태 확인
const authHeader = api.defaults.headers.common["Authorization"] || localStorage.getItem("accessToken");

console.log("Header : ", authHeader);

if (authHeader) {
  console.log("현재 상태: 로그인");
} else {
  console.log("현재 상태: 로그아웃");
}
</script>

<template>
  <ApiTest />

  <router-view />

  <Footer />

  <!-- 개발 환경 배너 -->
  <DevBanner v-if="showDevBanner" />
</template>
