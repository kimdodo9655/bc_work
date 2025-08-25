<template>
  <div class="dev-banner">
    {{ devBannerText }}
  </div>
</template>

<script setup lang="ts">
import { getDevBannerText } from "@/utils/env";
const devBannerText = getDevBannerText();
</script>
