<template>
  <div class="auth-card auth-card--split-half auth-card--h-450 email-verification">
    <!-- 좌측 이미지 영역 -->
    <div class="auth-card__left">
      <SendMail color="#FFFFFF" :width="180" :height="180" />
    </div>

    <!-- 우측 이메일 인증 폼 영역 -->
    <div class="auth-card__right">
      <!-- 헤더 -->
      <header class="auth-header">
        <h2 class="auth-header__title">이메일 인증 보안키 입력</h2>
        <p class="auth-header__subtitle">등록된 이메일로 발송한 보안키를 입력 바랍니다.</p>
      </header>

      <!-- 이메일 인증 폼 -->
      <form class="auth-form" @submit.prevent="handleSubmit">
        <!-- 보안키 입력 -->
        <div class="input-group">
          <Key class="input-group__icon" color="#dddddd" :width="30" :height="30" :stroke-width="2.5" />
          <input v-model="formData.authKey" class="input-group__field" type="text" placeholder="이메일 인증 보안키 입력" autocomplete="off" />
        </div>

        <!-- 제출 버튼 -->
        <button type="submit" class="btn btn--primary btn--large">인증하기</button>
      </form>
    </div>
  </div>

  <!-- 이메일 미수신 대응 방법 -->
  <div class="info-card">
    <div class="notice-section">
      <h3 class="info-card__title">이메일 미수신 대응 방법</h3>
      <ol class="notice-section__rules">
        <li>
          이메일 재발송 버튼을 통해 새로운 이메일 인증 보안키를 발급 받아
          <strong>10분 이내</strong>
          인증을 진행하시기 바랍니다.
        </li>
        <li>
          지속적으로 이메일을 받지 못할 경우 수신 차단이 되었는지 스팸메일함을 확인하거나,
          <br />
          법무대리인 관리자 계정으로 접속하여 해당 사용자의 등록 이메일 주소를 확인 바랍니다.
        </li>
      </ol>

      <button type="button" class="btn btn--secondary btn--medium" @click="handleResend">이메일 재발송</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SendMail, Key } from "@iconoir/vue";
import { reactive } from "vue";
import { useNavigation } from "@/composables/useNavigation";

// ==========================================
// 컴포저블
// ==========================================
const { goToPasswordSetup } = useNavigation();

// ==========================================
// 반응형 상태
// ==========================================
const formData = reactive({
  authKey: "",
});

// ==========================================
// 메서드
// ==========================================
function handleSubmit() {
  console.log("이메일 인증:", {
    authKey: formData.authKey,
  });

  // TODO: 이메일 인증키 검증 API 호출
  // 성공 시 비밀번호 설정 페이지로 이동
  goToPasswordSetup();
}

function handleResend() {
  console.log("이메일 재발송 요청");

  // TODO: 이메일 재발송 API 호출
  alert("인증 이메일이 재발송되었습니다.");
}
</script>
