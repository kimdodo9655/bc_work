import { createApp } from "vue";
import App from "./App.vue";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import "@/assets/styles/main.scss";
import router from "./router";
import { createPinia } from "pinia";
import { setupAxiosInterceptors } from "@/api/client/setupAxios";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
const queryClient = new QueryClient();

// ✅ Axios 인터셉터 적용 (개발 모드 체크는 내부에서 함)
setupAxiosInterceptors();

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");

// ✅ 앱 초기화 후 자동 로그아웃 타이머 설정
const authStore = useAuthStore();
authStore.startAutoLogout();
