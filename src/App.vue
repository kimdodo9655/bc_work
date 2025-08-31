<template>
  <router-view />
  <AppFooter />

  <!-- 개발 환경 배너 -->
  <DevBanner v-if="showDevBanner" />
</template>
<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue';
import DevBanner from '@/components/layout/DevBanner.vue';
import { isDev } from '@/utils/env';
const showDevBanner = isDev();
</script>
