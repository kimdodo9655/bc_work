<template>
  <div class="dev-banner">
    {{ devBannerText }}
  </div>
</template>

<script setup lang="ts">
const devBannerText = import.meta.env.VITE_SHOW_DEV_TEXT || "";
</script>
