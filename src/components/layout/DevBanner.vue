<template>
  <div class="dev-banner">
    {{ devBannerText }}
  </div>
</template>

<script setup lang="ts">
import { env } from "@/utils/env";
const devBannerText = env.getDevBannerText();
</script>
