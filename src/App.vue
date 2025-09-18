<template>
  <ApiTester v-if="isApiTestRoute" />
  <IconoirProvider v-else>
    <router-view />
    <AppFooter />
    <DevBanner v-if="showDevBanner" />

    <!-- UI 컴포넌트 -->
    <LoadingOverlay />
    <AlertModal />
    <ConfirmModal />
    <ToastList />

    <!-- DEV 컴포넌트 -->
    <TestForm v-if="false" />
    <TestUi v-if="false" />
    <WebSocketTestPanel v-if="false" />
    <TestPdf v-if="false" />
  </IconoirProvider>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { IconoirProvider } from "@iconoir/vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import DevBanner from "@/components/layout/DevBanner.vue";
import { env } from "@/utils/env";

// UI 컴포넌트 import
import LoadingOverlay from "@/components/ui/LoadingOverlay.vue";
import AlertModal from "@/components/ui/AlertModal.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import ToastList from "@/components/ui/ToastList.vue";

// DEV 컴포넌트 import
import TestPdf from "@/components/dev/TestPdf.vue";
import TestForm from "@/components/dev/TestForm.vue";
import TestUi from "@/components/dev/TestUi.vue";
import WebSocketTestPanel from "@/components/dev/WebSocketTestPanel.vue";
import ApiTester from "./components/dev/ApiTester.vue";

const route = useRoute();
const showDevBanner = env.isDev();

// 현재 라우트가 /apitest인지 확인
const isApiTestRoute = computed(() => {
  return route.path === "/apitest" || route.name === "ApiTester";
});
</script>
