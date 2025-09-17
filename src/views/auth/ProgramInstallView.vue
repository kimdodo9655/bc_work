<template>
  <div class="program-install-container">
    <!-- 메인 카드 -->
    <div class="program-install-card">
      <!-- 헤더 -->
      <div class="program-install-header">
        <h1 class="program-install-title">프로그램 설치</h1>
        <p class="program-install-description">
          안전한 시스템 이용을 위해 아래의 프로그램 설치가 필요하며,
          <br />
          프로그램 설치 완료 후에는 반드시 새로고침 또는 재접속하여 확인하시기 바랍니다.
        </p>
      </div>

      <!-- 프로그램 그리드 -->
      <div class="program-grid">
        <div class="program-item required">
          <div class="program-badge required-badge">필수</div>
          <h3 class="program-name">기기 접속 보안</h3>
          <ul class="program-features">
            <li>• Bankle Access Security</li>
            <li>• 비인가된 키거리 접근 차단 프로그램</li>
            <li>
              • 설치 여부 :
              <span class="install-status installed">설치</span>
            </li>
          </ul>
          <button class="download-btn active">다운로드</button>
        </div>

        <div class="program-item required">
          <div class="program-badge required-badge">필수</div>
          <h3 class="program-name">등기 업무 자동화</h3>
          <ul class="program-features">
            <li>• Bankle RPA</li>
            <li>• 반복적인 등기 업무를 자동으로 처리하는 프로그램</li>
            <li>
              • 설치 여부 :
              <span class="install-status installed">설치</span>
            </li>
          </ul>
          <button class="download-btn active">다운로드</button>
        </div>

        <div class="program-item required">
          <div class="program-badge required-badge">필수</div>
          <h3 class="program-name">키보드 보안</h3>
          <ul class="program-features">
            <li>• 프로그램 정보 필요</li>
            <li>• 키보드 입력간 악성화 및 위 변조 방지 프로그램</li>
            <li>
              • 설치 여부 :
              <span class="install-status installed">설치</span>
            </li>
          </ul>
          <button class="download-btn active">다운로드</button>
        </div>

        <div class="program-item required">
          <div class="program-badge required-badge">필수</div>
          <h3 class="program-name">개인 PC 방화벽</h3>
          <ul class="program-features">
            <li>• 프로그램 정보 필요</li>
            <li>• 실시간 해킹차단 및 바이러스 검색/치료 프로그램</li>
            <li>
              • 설치 여부 :
              <span class="install-status installed">설치</span>
            </li>
          </ul>
          <button class="download-btn active">다운로드</button>
        </div>

        <!-- 선택 프로그램들 -->
        <div class="program-item optional">
          <div class="program-badge optional-badge">선택</div>
          <h3 class="program-name">전자서명 검증</h3>
          <ul class="program-features">
            <li>• AnySign for PC</li>
            <li>• 전자서명 파일의 상세 정보를 확인하는 프로그램</li>
            <li>
              • 설치 여부 :
              <span class="install-status not-installed">미설치</span>
            </li>
          </ul>
          <button class="download-btn inactive">다운로드</button>
        </div>

        <div class="program-item optional">
          <div class="program-badge optional-badge">선택</div>
          <h3 class="program-name">원격지원</h3>
          <ul class="program-features">
            <li>• 프로그램 정보 필요</li>
            <li>• 시스템 오류 해결을 위한 원격지원 프로그램</li>
            <li>
              • 설치 여부 :
              <span class="install-status not-installed">미설치</span>
            </li>
          </ul>
          <button class="download-btn inactive">다운로드</button>
        </div>
      </div>

      <!-- 새로고침 버튼 -->
      <div class="program-install-footer">
        <div class="refresh-section">
          <button class="refresh-btn" @click="handleRefresh">새로고침</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
function handleRefresh() {
  console.log("새로고침 클릭");
  window.location.reload();
}
</script>
