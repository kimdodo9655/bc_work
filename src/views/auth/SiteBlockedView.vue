<template>
  <div class="auth-card auth-card--split-narrow auth-card--h-350 site-blocked">
    <div class="auth-card__left">
      <IconoirProvider :icon-props="iconProps">
        <PcWarning />
      </IconoirProvider>
    </div>

    <div class="auth-card__right">
      <header class="auth-header">
        <h2 class="auth-header__title">사이트 접속 차단</h2>
        <p class="auth-header__subtitle">해당 시스템은 사전에 등록된 기기만 접속 가능합니다.</p>
      </header>

      <div class="mac-info">
        <div class="mac-info__item">
          <h5 class="mac-info__item-title">접속 기기 Mac Address 정보</h5>
          <p class="mac-info__item-value mac-info__item-value--error">A1 – B1 – C1 – D1 – E1 – F2</p>
        </div>
        <div class="mac-info__item">
          <h5 class="mac-info__item-title">Mac Address 등록 정보</h5>
          <p class="mac-info__item-value">A1 – B1 – C1 – D1 – E1 – F1</p>
        </div>
      </div>
    </div>
  </div>

  <div class="info-card">
    <div class="notice-section">
      <h3 class="info-card__title">Mac Address 등록 정보 변경 방법</h3>
      <ol class="notice-section__rules">
        <li>법무대리인 관리자 계정으로 접속하여 해당 사용자의 "접속 기기 Mac Address 정보" 값을 변경하시면 됩니다.</li>
        <li>법무대리인 관리자 계정으로 접속이 어려운 경우 아래의 고객센터로 연락주시기 바랍니다</li>
      </ol>

      <div class="notice-section__contact">
        <p>
          <span>문의전화</span>
          070-1234-1234
        </p>
        <p>
          <span>운영시간</span>
          월~금 09:00~18:00 (공휴일 제외)
        </p>
      </div>

      <button class="btn btn--primary btn--wide-40" @click="goToLogin">로그인</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { PcWarning } from "@iconoir/vue";
import { useNavigation } from "@/composables/useNavigation";

const { goToLogin } = useNavigation();

// 아이콘 속성
const iconProps = {
  color: "#FFFFFF",
  width: 130,
  height: 130,
  strokeWidth: 1.5,
};
</script>
