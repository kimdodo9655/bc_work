<template>
  <teleport to="body">
    <div v-if="store.loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>{{ store.loadingMessage }}</p>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useUIStore } from "@/stores/ui";
const store = useUIStore();
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff99;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #cadfdf;
  border-top: 4px solid #5f9ea0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

p {
  margin: 0;
  color: #5f9ea0;
  font-weight: 600;
}
</style>
