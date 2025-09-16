<template>
  <div class="auth-card auth-card--split-narrow auth-card--h-350 site-blocked">
    <div class="auth-card__left">
      <PcWarning color="#FFFFFF" :width="130" :height="130" :strokeWidth="1.5" />
    </div>

    <div class="auth-card__right">
      <header class="auth-header">
        <h2 class="auth-header__title">사이트 접속 차단</h2>
        <p class="auth-header__subtitle">
          {{ errorMessage || "해당 시스템은 사전에 등록된 기기만 접속 가능합니다." }}
        </p>
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
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { useNavigation } from "@/composables/useNavigation";

const { goToLogin } = useNavigation();
const route = useRoute();
const router = useRouter();

type SiteBlockedData = {
  currentMacAddress?: string;
  registeredMacAddress?: string;
  errorMessage?: string;
};

const SB_KEY = "siteBlocked";

// 세션 읽기/쓰기 유틸
function readSession(): SiteBlockedData | null {
  try {
    const raw = sessionStorage.getItem(SB_KEY);
    return raw ? (JSON.parse(raw) as SiteBlockedData) : null;
  } catch {
    return null;
  }
}
function writeSession(v: SiteBlockedData | null) {
  try {
    if (v && Object.values(v).some(Boolean)) {
      sessionStorage.setItem(SB_KEY, JSON.stringify(v));
    } else {
      sessionStorage.removeItem(SB_KEY);
    }
  } catch {
    sessionStorage.removeItem(SB_KEY);
  }
}

// 화면에서 사용할 데이터(ref)
const sb = ref<SiteBlockedData | null>(null);

// 1) 하위호환: 쿼리로 들어온 경우 → 세션에 저장하고 URL에서 제거
// 2) 평상시: 세션에서 읽어 표시
onMounted(async () => {
  const qCurrent = (route.query.currentMac as string | undefined)?.trim();
  const qRegistered = (route.query.registeredMac as string | undefined)?.trim();
  const qError = (route.query.errorMsg as string | undefined)?.trim();

  if (qCurrent || qRegistered || qError) {
    const next: SiteBlockedData = {
      currentMacAddress: qCurrent,
      registeredMacAddress: qRegistered,
      errorMessage: qError,
    };
    writeSession(next);
    sb.value = next;

    // 주소창 쿼리 제거 (깨끗한 URL)
    router.replace({
      name: route.name as string,
      params: route.params,
      query: {},
    });
  } else {
    sb.value = readSession();
  }
});

// ===== 표시용 계산 로직 =====
const currentMacAddress = computed(() => sb.value?.currentMacAddress || "알 수 없음");
const registeredMacAddress = computed(() => sb.value?.registeredMacAddress || "등록되지 않음");
const errorMessage = computed(() => sb.value?.errorMessage || "");

function formatMacAddress(mac: string): string {
  if (mac.includes(":")) return mac.replace(/:/g, " – ").toUpperCase();
  if (mac.includes("-")) return mac.toUpperCase();
  if (mac.length === 12 && /^[0-9A-Fa-f]+$/.test(mac)) {
    return (mac.match(/.{2}/g)?.join(" – ") || mac).toUpperCase();
  }
  return mac.toUpperCase();
}

const formattedCurrentMac = computed(() => formatMacAddress(currentMacAddress.value));
const formattedRegisteredMac = computed(() => formatMacAddress(registeredMacAddress.value));
</script>
