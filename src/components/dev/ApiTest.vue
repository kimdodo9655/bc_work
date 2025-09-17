<template>
  <TokenCountdown v-if="true" />
  <ul v-if="true">
    <!-- 로그인 -->
    <li>
      <h4>로그인</h4>
      <form @submit.prevent="onSubmit">
        <input v-model="userId" placeholder="아이디" />
        <input v-model="password" type="password" placeholder="비밀번호" />
        <button :disabled="isLoggingIn">로그인</button>
        <p v-if="loginError">에러: {{ loginError?.message }}</p>
      </form>
    </li>

    <!-- 토큰 갱신 -->
    <li>
      <h4>토큰 갱신</h4>
      <button @click="handleRenewToken" :disabled="isRenewing">갱신</button>
    </li>

    <!-- 로그아웃 -->
    <li>
      <h4>로그아웃</h4>
      <button @click="handleLogout" :disabled="isLoggingOut">로그아웃</button>
    </li>

    <!-- 비밀번호 변경 전 인증 이메일 발송 -->
    <li>
      <h4>비밀번호 변경 / mac address, 이메일 검증 및 메일 발송 API</h4>
      <button @click="handleSendSecureEmail">비밀번호 변경 인증 메일 발송</button>
    </li>

    <!-- 이메일 인증키 검증 -->
    <li>
      <h4>이메일 인증키 검증 API</h4>
      <input v-model="emailAuthKey" placeholder="이메일 인증키 입력" />
      <button @click="handleVerifyEmailKey">이메일 인증키 검증</button>
    </li>

    <!-- 인증 메일 재발송 -->
    <li>
      <h4>이메일 재발송 / 공통</h4>
      <button @click="handleResendEmail">인증 메일 재발송</button>
    </li>

    <!-- 비밀번호 변경 -->
    <li>
      <h4>비밀번호 변경 API</h4>
      <input v-model="newPassword" placeholder="새 비밀번호" />
      <button @click="handleChangePassword">비밀번호 변경</button>
    </li>

    <!-- 로그인 후 비밀번호 변경 -->
    <li>
      <h4>비밀번호 변경 API (로그인 이후)</h4>
      <input v-model="newPassword" placeholder="새 비밀번호" />
      <button @click="handleChangeMyPassword">로그인 후 비밀번호 변경</button>
    </li>

    <!-- ===================== 신규: Estimate 영역 ===================== -->
    <!-- 견적서 조회(기존) -->
    <li style="margin-top: 80px">
      <h4>등기 견적 관리 리스트 조회 /register/search-register</h4>
      <button @click="handleSearchRegister">조회</button>
    </li>

    <li>
      <h4>견적서 철회 /estimate/withdraw-estimate</h4>
      <input v-model.number="estimateId" type="number" placeholder="estimateId" />
      <button @click="handleWithdrawEstimate">철회</button>
    </li>

    <li>
      <h4>견적서 작성정보 조회 (단건) /estimate/get-estimate-info</h4>
      <input v-model.number="registerId" placeholder="registerId" />
      <button @click="handleGetEstimateInfo">조회</button>
    </li>

    <li>
      <h4>견적서 기본 정보 조회 /estimate/get-default-info</h4>
      <input v-model.number="registerId" placeholder="registerId" />
      <input v-model="registerType" placeholder='registerType (예: "transfer")' />
      <button @click="handleGetEstimateDefaultInfo">조회</button>
    </li>

    <pre>
소유권이전 -> transfer
지상권설정 -> surface
경정 -> correct
설정 -> right
말소 -> delete
    </pre>

    <li style="margin-bottom: 80px">
      <h4>견적서 제출 /estimate/ins-estimate-info</h4>
      <textarea v-model="insPayloadText" rows="12" style="width: 100%" placeholder="ins-estimate-info JSON payload"></textarea>
      <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap">
        <button @click="fillSampleInsPayload">샘플 값 채우기</button>
        <button @click="handleInsEstimateInfo">견적서 제출</button>
      </div>
      <p style="opacity: 0.7; margin-top: 6px">※ JSON 형식 오류 시 등록이 실패합니다.</p>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import TokenCountdown from "@/components/TokenCountdown.vue";
import { useAuth } from "@/composables/useAuth";
import type { AxiosError } from "axios";

// 기본 사용자 입력
const userId = ref("test1");
const password = ref("happyTEst2025@@#");
const macAddress = ref("00:00:00:00:00:00");
const emailAuthKey = ref("");
const newPassword = ref("NewPassword123!");

// Estimate 신규 필드
const estimateId = ref<number>(10);
const registerId = ref<number>(7);
const insPayloadText = ref("");

// 통합 useAuth
const {
  login,
  logout,
  renewToken,
  sendSecureEmail,
  verifyEmailKey,
  resendEmail,
  changePassword,
  changeMyPassword,
  searchRegister,

  // 신규(Estimate)
  withdrawEstimate,
  getEstimateInfo,
  getEstimateDefaultInfo,
  insEstimateInfo,
} = useAuth();

const isLoggingIn = computed(() => ("isPending" in login ? login.isPending : (login as any).isLoading) as boolean);
const isLoggingOut = computed(() => ("isPending" in logout ? logout.isPending : (logout as any).isLoading) as boolean);
const isRenewing = computed(() => ("isPending" in renewToken ? renewToken.isPending : (renewToken as any).isLoading) as boolean);

// AxiosError라면 message 접근용
const loginError = computed<AxiosError | null>(() => ((login as any).isError ? ((login as any).error as AxiosError) ?? null : null));

// 로그인
const onSubmit = () => {
  login.mutate({ userId: userId.value, password: password.value });
};

// 토큰 갱신
const handleRenewToken = () => renewToken.mutate();

// 로그아웃
const handleLogout = () => logout.mutate();

// 비밀번호 변경 전 인증 메일 발송
const handleSendSecureEmail = () => sendSecureEmail.mutate({ macAddress: macAddress.value });

// 이메일 인증키 검증
const handleVerifyEmailKey = () =>
  verifyEmailKey.mutate({
    macAddress: macAddress.value,
    emailAuthKey: emailAuthKey.value,
  });

// 인증 메일 재발송
const handleResendEmail = () => resendEmail.mutate({ macAddress: macAddress.value });

// 비밀번호 변경
const handleChangePassword = () =>
  changePassword.mutate({
    newPassword: newPassword.value,
    macAddress: macAddress.value,
  });

// 로그인 후 비밀번호 변경
const handleChangeMyPassword = () =>
  changeMyPassword.mutate({
    newPassword: newPassword.value,
    macAddress: macAddress.value,
  });

// 견적서 조회(기존)
const handleSearchRegister = () => {
  searchRegister.mutate({
    page: 1,
    size: 10,
    registerType: "소유권이전",
    lot: null,
    requestedStartDate: "2025-09-01",
    requestedEndDate: "2025-10-25",
    receivedStartDate: "2025-09-01",
    receivedEndDate: "2025-10-25",
    integratedText: null,
    estimateStatusIdCode: null,
    estimateWrittenCode: null,
    estimateSelectionCode: null,
  });
};

/* ===================== 신규: Estimate 핸들러 ===================== */

// 견적 철회
const handleWithdrawEstimate = () => {
  withdrawEstimate.mutate({ estimateId: estimateId.value });
};

// 견적 기본정보 조회
const handleGetEstimateInfo = () => {
  getEstimateInfo.mutate({ registerId: registerId.value });
};

// 견적 마스터 기본값 조회
const registerType = ref("transfer");

// 핸들러 수정
const handleGetEstimateDefaultInfo = () => {
  getEstimateDefaultInfo.mutate({
    registerId: registerId.value,
    registerType: registerType.value,
  });
};

// 샘플 ins payload 채우기
const fillSampleInsPayload = () => {
  insPayloadText.value = JSON.stringify(
    {
      registerApplicationNumber: "RGST2025091100002",
      registerProgressName: "전자등기",
      registerTypeId: 1,
      isTermsAgreed: true,
      maintenanceFee: {
        baseFee: 100000,
        additionalFee: 100000,
        causeCertFee: 100000,
        publicChargeFee: 100000,
        bondSaleFee: 100000,
        realEstateReportFee: 100000,
        reimbursementFee: 100000,
        certificationFee: 100000,
        confirmationFee: 100000,
        otherCosts: 100000,
        vat: 100000,
        totalFee: 1100000,
      },
      utilityBills: {
        acquisitionTax: 100000,
        registerLicenseTax: 100000,
        educationTax: 100000,
        ruralSpecialTax: 100000,
        stampTax: 100000,
        applicationFee: 100000,
        totalPublicCharges: 100000,
      },
    },
    null,
    2
  );
};

// 견적 등록
const handleInsEstimateInfo = () => {
  try {
    const payload = JSON.parse(insPayloadText.value || "{}");
    insEstimateInfo.mutate(payload);
  } catch (e) {
    alert("JSON 파싱 오류: payload 형식을 확인해 주세요.");
  }
};
</script>
