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
    <div class="dev-navigation" v-if="env.isDev()">
      <h4>개발용 페이지 바로가기</h4>

      <div class="nav-section">
        <h5>인증 페이지</h5>
        <button @click="goToLogin">로그인</button>
        <button @click="goToAutoLogout">자동 로그아웃</button>
        <button @click="goToProgramInstall">프로그램 설치</button>
        <!-- 방법 1: 매개변수 없이 호출 -->
        <button @click="goToSiteBlocked()">사이트 접속 차단</button>
        <!-- 방법 2: 이벤트 객체를 무시하고 매개변수 전달 -->
        <button @click="() => goToSiteBlockedWithData()">사이트 접속 차단 (데이터 포함)</button>
        <!-- 방법 3: 이벤트를 받되 매개변수는 따로 전달 -->
        <button @click="handleSiteBlockedClick">사이트 접속 차단 (핸들러)</button>
        <button @click="goToEmailVerificationKey()">이메일 인증키 입력</button>
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

      <div class="nav-section">
        <button @click="showSuccess">성공 토스트</button>
        <button @click="showError">에러 토스트</button>
        <button @click="doSomething">로딩 테스트</button>
        <button @click="showAlert">알럿 보기</button>
        <button @click="showConfirm">컨펌 보기</button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useNavigation } from "@/composables/useNavigation";
import { env } from "@/utils/env";
import { useUI } from "@/composables/useUI";

const ui = useUI();

// 토스트 사용
const showSuccess = () => {
  ui.success("성공했습니다!");
};

const showError = () => {
  ui.error("오류가 발생했습니다.");
};

// 로딩 사용
const doSomething = async () => {
  ui.showLoading("처리 중...");

  // API 호출 등
  await new Promise((resolve) => setTimeout(resolve, 2000));

  ui.hideLoading();
  ui.success("완료되었습니다!");
};

// 알럿 사용
const showAlert = () => {
  ui.alert("알림 제목입니다. 제목이 길어지면 말이죠..", "이것은 중요한 메시지입니다. 짜잔- 텍스트가 길어지면 어떻게 나오나요?", () => {
    console.log("확인 버튼 클릭됨");
  });
};

// 컨펌 사용
const showConfirm = () => {
  ui.confirm(
    "삭제 확인",
    "정말 삭제하시겠습니까?",
    () => {
      // 확인 버튼 클릭시
      ui.success("삭제되었습니다.");
    },
    () => {
      // 취소 버튼 클릭시
      ui.info("취소되었습니다.");
    }
  );
};

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

// 개발용 핸들러들
const goToSiteBlockedWithData = () => {
  // 예시 데이터와 함께 호출
  const mockMacErrorData = {
    currentMacAddress: "AA:BB:CC:DD:EE:FF",
    registeredMacAddress: "11:22:33:44:55:66",
    errorMessage: "MAC 주소가 일치하지 않습니다.",
  };
  goToSiteBlocked(mockMacErrorData);
};

const handleSiteBlockedClick = (event: MouseEvent) => {
  // 이벤트를 받되, 필요한 데이터는 별도로 준비
  console.log("Button clicked:", event);
  goToSiteBlocked(); // 매개변수 없이 호출하거나 필요시 데이터 전달
};
</script>
