<script setup lang="ts">
import ApiTest from "@/views/ApiTest.vue";
import Footer from "@/components/layout/Footer.vue";
import DevBanner from "@/components/layout/DevBanner.vue";

const showDevBanner = import.meta.env.VITE_SHOW_DEV === "true";
</script>

<template>
  <ApiTest />

  <router-view />

  <Footer />

  <!-- 개발 환경 배너 -->
  <DevBanner v-if="showDevBanner" />
</template>
