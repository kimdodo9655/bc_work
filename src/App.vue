<template>
  <ApiTest />
  <router-view />
  <Footer />

  <!-- 개발 환경 배너 -->
  <DevBanner v-if="showDevBanner" />
</template>
<script setup lang="ts">
import ApiTest from "@/views/ApiTest.vue";
import Footer from "@/components/layout/Footer.vue";
import DevBanner from "@/components/layout/DevBanner.vue";
import { isDev } from "@/utils/env";
const showDevBanner = isDev();
</script>
