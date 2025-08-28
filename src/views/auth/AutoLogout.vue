<template>
  <div class="auth-card-position ac01">
    <div class="ac01-inner-left">
      <IconoirProvider :icon-props="{ color: '#FFFFFF', width: 180, height: 180, strokeWidth: 1.5 }">
        <LogOut />
      </IconoirProvider>
    </div>

    <div class="ac01-inner-right">
      <header>
        <h2 class="mb-4">자동 로그아웃</h2>

        <p class="subtext">
          로그인 유지 시간(30분)이 만료되어 자동으로 로그아웃 되었습니다.
          <br />
          계속 시스템을 이용하실 경우 다시 로그인을 진행하시기 바랍니다
        </p>
      </header>

      <button class="link_btn" @click="goToLogin">로그인</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { LogOut } from "@iconoir/vue";
import { useNavigation } from "@/composables/useNavigation";

const { goToLogin } = useNavigation();
</script>
