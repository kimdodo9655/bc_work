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
