<template>
  <div class="auth-card auth-card--split-narrow auth-card--h-350 site-blocked">
    <div class="auth-card__left">
      <PcWarning color="#FFFFFF" :width="130" :height="130" :strokeWidth="1.5" />
    </div>

    <div class="auth-card__right">
      <header class="auth-header">
        <h2 class="auth-header__title">사이트 접속 차단</h2>
        <p class="auth-header__subtitle">{{ errorMessage || "해당 시스템은 사전에 등록된 기기만 접속 가능합니다." }}</p>
      </header>

      <div class="mac-info">
        <div class="mac-info__item">
          <h5 class="mac-info__item-title">접속 기기 Mac Address 정보</h5>
          <p class="mac-info__item-value mac-info__item-value--error">{{ formattedCurrentMac }}</p>
        </div>
        <div class="mac-info__item">
          <h5 class="mac-info__item-title">Mac Address 등록 정보</h5>
          <p class="mac-info__item-value">{{ formattedRegisteredMac }}</p>
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
import { PcWarning } from "@iconoir/vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useNavigation } from "@/composables/useNavigation";

const { goToLogin } = useNavigation();
const route = useRoute();

// ==========================================
// 쿼리 파라미터에서 데이터 추출
// ==========================================
const currentMacAddress = computed(() => (route.query.currentMac as string) || "알 수 없음");
const registeredMacAddress = computed(() => (route.query.registeredMac as string) || "등록되지 않음");
const errorMessage = computed(() => route.query.errorMsg as string);

// ==========================================
// MAC 주소 포맷팅 함수
// ==========================================
function formatMacAddress(mac: string): string {
  // 기본 포맷이 이미 XX:XX:XX:XX:XX:XX 형태라면 ':'를 ' – '로 변경
  if (mac.includes(":")) {
    return mac.replace(/:/g, " – ").toUpperCase();
  }

  // 하이픈이나 다른 구분자가 있다면 그대로 사용
  if (mac.includes("-")) {
    return mac.toUpperCase();
  }

  // 구분자가 없는 12자리 문자열이라면 2자리씩 나누어 포맷팅
  if (mac.length === 12 && /^[0-9A-Fa-f]+$/.test(mac)) {
    return mac.match(/.{2}/g)?.join(" – ").toUpperCase() || mac;
  }

  // 그 외의 경우 그대로 반환
  return mac.toUpperCase();
}

// ==========================================
// 계산된 속성
// ==========================================
const formattedCurrentMac = computed(() => formatMacAddress(currentMacAddress.value));
const formattedRegisteredMac = computed(() => formatMacAddress(registeredMacAddress.value));
</script>
