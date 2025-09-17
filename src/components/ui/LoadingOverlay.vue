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
