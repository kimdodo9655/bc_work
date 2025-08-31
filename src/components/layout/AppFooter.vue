<template>
  <footer class="main-footer">
    <div class="footer-inner">
      <ul class="left">
        <img src="@/assets/images/logos/bankclear.png" alt="logo" />
        <li><button @click="goToTerms">서비스 이용약관</button></li>
        <li><button @click="goToPrivacy">개인정보처리방침</button></li>
      </ul>

      <p class="right">COPYRIGHT ⓒ 2025 BANKCLEAR Inc. ALL RIGHTS RESERVED.</p>
    </div>

    <!-- 개발용 임시 네비게이션 바로가기 -->
    <div class="dev-navigation" v-if="isDev()">
      <h4>개발용 페이지 바로가기</h4>

      <div class="nav-section">
        <h5>인증 페이지</h5>
        <button @click="goToLogin">로그인</button>
        <button @click="goToAutoLogout">자동 로그아웃</button>
        <button @click="goToProgramInstall">프로그램 설치</button>
        <button @click="goToSiteBlocked">사이트 접속 차단</button>
        <button @click="goToEmailVerificationKey">이메일 인증키 입력</button>
        <button @click="goToPasswordSetup">비밀번호 설정</button>
      </div>

      <div class="nav-section">
        <h5>대시보드</h5>
        <button @click="goToHome">홈</button>
        <button @click="goToEstimateList">등기 견적 목록</button>
        <button @click="goToEstimateCreateSubmit">견적서 작성/제출</button>
        <button @click="goToEstimateReviewWithdraw">견적서 확인/철회</button>
      </div>

      <div class="nav-section">
        <h5>온보딩</h5>
        <button @click="goToInstitutionSelect">금융기관 선택</button>
      </div>

      <div class="nav-section">
        <h5>공통</h5>
        <button @click="goToInvalidAccess">잘못된 접근 (404)</button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useNavigation } from "@/composables/useNavigation";
import { isDev } from "@/utils/env";

const {
  // Auth
  goToLogin,
  goToAutoLogout,
  goToProgramInstall,
  goToSiteBlocked,
  goToEmailVerificationKey,
  goToPasswordSetup,

  // Dashboard
  goToHome,
  goToEstimateList,
  goToEstimateCreateSubmit,
  goToEstimateReviewWithdraw,

  // Onboarding
  goToInstitutionSelect,

  // Common
  goToTerms,
  goToPrivacy,
  goToInvalidAccess,
} = useNavigation();
</script>

<style scoped>
/* 개발용 네비게이션 스타일 */
.dev-navigation {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-top: 2px solid #ddd;
}

.dev-navigation h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.nav-section {
  margin-bottom: 15px;
  display: inline-block;
  vertical-align: top;
  margin-right: 30px;
}

.nav-section h5 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.nav-section button {
  display: block;
  margin-bottom: 5px;
  padding: 5px 10px;
  background: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.nav-section button:hover {
  background-color: #e0e0e0;
}

.left button {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-decoration: none;
}

.left button:hover {
  text-decoration: underline;
}
</style>
