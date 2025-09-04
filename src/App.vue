<template>
  <TestForm />
  <router-view />
  <AppFooter />
  <DevBanner v-if="showDevBanner" />

  <!-- UI 컴포넌트들 추가 -->
  <LoadingOverlay />
  <AlertModal />
  <ConfirmModal />
  <ToastList />

  <!-- ✅ 웹소켓 테스트 패널 -->
  <WebSocketTestPanel />
</template>

<script setup lang="ts">
import AppFooter from "@/components/layout/AppFooter.vue";
import DevBanner from "@/components/layout/DevBanner.vue";
import { isDev } from "@/utils/env";

// UI 컴포넌트들 import
import LoadingOverlay from "@/components/ui/LoadingOverlay.vue";
import AlertModal from "@/components/ui/AlertModal.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import ToastList from "@/components/ui/ToastList.vue";

import TestForm from "@/views/TestForm.vue";
import WebSocketTestPanel from "@/components/dev/WebSocketTestPanel.vue";

const showDevBanner = isDev();
</script>
