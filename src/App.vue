<template>
  <IconoirProvider>
    <router-view />
    <AppFooter />
    <DevBanner v-if="showDevBanner" />

    <!-- UI 컴포넌트 -->
    <LoadingOverlay />
    <AlertModal />
    <ConfirmModal />
    <ToastList />

    <!-- DEV 컴포넌트 -->
    <!-- <ApiTest /> -->
    <!-- <TestForm /> -->
    <!-- <TestUi /> -->
    <!-- <WebSocketTestPanel /> -->
    <!-- <TestPdf /> -->
  </IconoirProvider>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import DevBanner from "@/components/layout/DevBanner.vue";
import { isDev } from "@/utils/env";

// UI 컴포넌트 import
import LoadingOverlay from "@/components/ui/LoadingOverlay.vue";
import AlertModal from "@/components/ui/AlertModal.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import ToastList from "@/components/ui/ToastList.vue";

// DEV 컴포넌트 import
// import TestPdf from "@/components/dev/TestPdf.vue";
// import ApiTest from "@/components/dev/ApiTest.vue";
// import TestForm from "@/components/dev/TestForm.vue";
// import TestUi from "@/components/dev/TestUi.vue";
// import WebSocketTestPanel from "@/components/dev/WebSocketTestPanel.vue";

const showDevBanner = isDev();
</script>
