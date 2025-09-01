<template>
  <teleport to="body">
    <div class="toast-container">
      <div v-for="toast in store.toasts" :key="toast.id" class="toast-item" :class="`toast--${toast.type}`">
        <div class="toast-content">
          <h4 v-if="toast.title">{{ toast.title }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button @click="store.removeToast(toast.id)" class="toast-close">×</button>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useUIStore } from "@/stores/ui";
const store = useUIStore();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
  max-width: 350px;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
}

.toast--success {
  background: #4caf50;
}
.toast--error {
  background: #f44336;
}
.toast--info {
  background: #5f9ea0;
}
.toast--warning {
  background: #ff9800;
}

.toast-content {
  flex: 1;
}

.toast-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.toast-content p {
  margin: 0;
  font-size: 0.875rem;
  color: white;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.toast-close:hover {
  opacity: 1;
}
</style>
