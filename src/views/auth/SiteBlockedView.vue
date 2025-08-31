<template>
  <div class="auth-card-position ac02 site-blocked-card">
    <div class="ac02-inner-left">
      <IconoirProvider
        :icon-props="{
          color: '#FFFFFF',
          width: 130,
          height: 130,
          strokeWidth: 1.5,
        }"
      >
        <PcWarning />
      </IconoirProvider>
    </div>

    <div class="ac02-inner-right">
      <header>
        <h2 class="mb-4">사이트 접속 차단</h2>

        <p class="subtext">
          해당 시스템은 사전에 등록된 기기만 접속 가능합니다.
        </p>
      </header>

      <ul class="site-blocked-mac">
        <li>
          <h5 class="mb-4">접속 기기 Mac Address 정보</h5>
          <p class="user">A1 – B1 – C1 – D1 – E1 – F2</p>
        </li>
        <li>
          <h5 class="mb-4">Mac Address 등록 정보</h5>
          <p>A1 – B1 – C1 – D1 – E1 – F1</p>
        </li>
      </ul>
    </div>
  </div>
  <div class="auth-card-position site-blocked-notice">
    <h3 class="mb-4">Mac Address 등록 정보 변경 방법</h3>
    <p class="mb-1">
      1. 법무대리인 관리자 계정으로 접속하여 해당 사용자의 “접속 기기 Mac
      Address 정보” 값을 변경하시면 됩니다.
    </p>
    <p class="mb-8">
      2. 법무대리인 관리자 계정으로 접속이 어려운 경우 아래의 고객센터로
      연락주시기 바랍니다
    </p>
    <div class="notice-block__contact-info mb-12">
      <p>
        <span>문의전화</span>
        070-1234-1234
      </p>
      <p>
        <span>운영시간</span>
        월~금 09:00~18:00 (공휴일 제외)
      </p>
    </div>
    <button class="link_btn" @click="goToLogin">로그인</button>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from '@iconoir/vue';
import { PcWarning } from '@iconoir/vue';
import { useNavigation } from '@/composables/useNavigation';

const { goToLogin } = useNavigation();
</script>
