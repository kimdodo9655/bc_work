<template>
  <div v-if="timeLeft > 0">⏳ 남은 시간: {{ minutes }}분 {{ seconds }}초</div>
  <div v-else>🔒 세션이 만료되었습니다.</div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted, onUnmounted, computed } from "vue";

const authStore = useAuthStore();
const timeLeft = ref(0);
let timer: ReturnType<typeof setInterval>;

// ⏱ 실시간 남은 시간 계산
const updateTime = () => {
  if (!authStore.accessTokenExpiry) {
    timeLeft.value = 0;
    return;
  }

  const now = Date.now();
  timeLeft.value = Math.max(authStore.accessTokenExpiry - now, 0);
};

// ✅ 분, 초 계산
const minutes = computed(() => Math.floor(timeLeft.value / 1000 / 60));
const seconds = computed(() => Math.floor((timeLeft.value / 1000) % 60));

// 🔁 타이머 동작
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>
