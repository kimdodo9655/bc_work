<template>
  <div>
    <div class="login-cont">
      <h1 class="service-title">법무대리인 등기지원시스템</h1>

      <div class="login-box">
        <input class="login-input" type="text" placeholder="아이디" v-model="userId" />
        <input class="login-input" type="password" placeholder="비밀번호" v-model="password" />
        <div>
          <label>
            <input type="checkbox" />
            아이디 기억하기
          </label>
          <a href="#">비밀번호 변경</a>
        </div>
        <button @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? "로딩 중..." : "로그인" }}
        </button>
      </div>

      <div v-if="error">
        에러 발생:
        {{ (error as any)?.response?.data?.message || (error as Error)?.message || "알 수 없는 에러" }}
      </div>

      <div v-else-if="todo">액세스 토큰: {{ todo.accessToken }}</div>
    </div>

    <button @click="logoutTest">로그아웃</button>

    <footer>
      <a href="#">서비스 이용약관</a>
      <a href="#">개인정보처리방침</a>
      <p></p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "@/api/axios";
// import { useRouter } from "vue-router";

interface Todo {
  accessToken: string;
}
type LoginResponseA = { data: { accessToken: string } | null };
type LoginResponseB = { accessToken: string }; // 서버가 바로 토큰만 주는 경우 대비

const userId = ref("test1");
const password = ref("happyTEst2025@@#");
const macAddress = ref("42:00:40:f2:b8:43");

const todo = ref<Todo | null>(null);
const isLoading = ref(false);
const error = ref<any>(null);

const extractToken = (raw: unknown): string | null => {
  const a = raw as LoginResponseA | undefined;
  if (a && typeof a === "object" && "data" in a) {
    const inner = (a as LoginResponseA).data;
    if (inner && typeof inner === "object" && "accessToken" in inner) {
      const t = (inner as any).accessToken;
      return typeof t === "string" ? t : null;
    }
  }
  const b = raw as LoginResponseB | undefined;
  if (b && typeof b === "object" && "accessToken" in b) {
    const t = (b as any).accessToken;
    return typeof t === "string" ? t : null;
  }
  return null;
};

const handleLogin = async () => {
  isLoading.value = true;
  error.value = null;
  todo.value = null;

  try {
    const res = await api.post<LoginResponseA | LoginResponseB>("/user/login", {
      userId: userId.value,
      password: password.value,
      macAddress: macAddress.value,
    });

    // 실제 응답 확인용 (개발 중)
    console.log("login response:", res.data);

    const token = extractToken(res.data);
    if (!token) {
      throw new Error("로그인 응답에 accessToken이 없습니다.");
    }

    todo.value = { accessToken: token };
    localStorage.setItem("accessToken", token);

    // 인터셉터 없다면 임시로 기본 헤더에 주입
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Authorization after login:", api.defaults.headers.common["Authorization"]);

    // const router = useRouter();
    // await router.push("/");
  } catch (err: any) {
    error.value = err;
  } finally {
    isLoading.value = false;
  }
};

const logoutTest = () => {
  localStorage.removeItem("accessToken");
  delete api.defaults.headers.common["Authorization"];
  console.log("Authorization after logout:", api.defaults.headers.common["Authorization"]);
};
</script>
