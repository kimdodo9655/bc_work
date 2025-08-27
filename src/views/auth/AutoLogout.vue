<template>
  <div class="auth-card-position auto-logout-card">
    <div class="auth-inner-left login-card__visual">
      <IconoirProvider :icon-props="{ color: '#FFFFFF', width: 150, height: 150, strokeWidth: 1.5 }">
        <LogOut />
      </IconoirProvider>
    </div>

    <div class="auth-inner-right auto-logout-card__body">
      <header class="auto-logout-card__header">
        <h2 class="auto-logout-card__title mb-4">자동 로그아웃</h2>

        <p class="subtext">
          로그인 유지 시간(30분)이 만료되어 자동으로 로그아웃 되었습니다.
          <br />
          계속 시스템을 이용하실 경우 다시 로그인을 진행하시기 바랍니다
        </p>
      </header>

      <a class="link_btn" href="/auth/login">로그인</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { LogOut } from "@iconoir/vue";
</script>
