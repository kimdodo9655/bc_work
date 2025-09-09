import { createApp } from "vue";
import App from "./App.vue";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import "@/assets/styles/main.scss";
import router from "./router";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
const queryClient = new QueryClient();

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");

// ✅ 앱 초기화 후 자동 로그아웃 타이머 설정
const authStore = useAuthStore();
authStore.startAutoLogout();
