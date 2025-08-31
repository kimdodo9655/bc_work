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

<style scoped>
.program-install-container {
  width: 100%;
  min-width: 1024px;
  min-height: calc(100vh - 80px);
  background-color: #ebf7f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 30px 20px;
}

.program-install-card {
  width: 1024px;
  margin: 0 auto;
  border-radius: 15px;
  background-color: #ffffff;
  box-shadow: 0 15px 25px #00000026, 0 5px 10px #0000000d;
  padding: 40px;
  box-sizing: border-box;
}

.program-install-header {
  text-align: center;
  margin-bottom: 35px;
}

.program-install-icon {
  width: 120px;
  height: 120px;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(95, 158, 160, 0.2);
}

.program-install-title {
  font-size: 26px;
  font-weight: bold;
  color: #5f9ea0;
  margin: 0 0 15px 0;
}

.program-install-description {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.program-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.program-item {
  position: relative;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.program-item.required {
  border-color: #ff6b6b;
  background-color: #fffbfb;
}

.program-item.optional {
  border-color: #999;
  background-color: #f8f8f8;
}

.program-badge {
  position: absolute;
  top: -1px;
  left: 15px;
  padding: 4px 12px;
  border-radius: 0 0 8px 8px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.required-badge {
  background-color: #ff6b6b;
}

.optional-badge {
  background-color: #999;
}

.program-name {
  font-size: 17px;
  font-weight: bold;
  color: #333;
  margin: 18px 0 12px 0;
}

.program-features {
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
}

.program-features li {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 4px;
}

.install-status.installed {
  color: #4caf50;
  font-weight: 600;
}

.install-status.not-installed {
  color: #f44336;
  font-weight: 600;
}

.download-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn.active {
  background-color: #5f9ea0;
  color: white;
}

.download-btn.active:hover {
  background-color: #4d9294;
}

.download-btn.inactive {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.program-install-footer {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}

.refresh-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.refresh-badge {
  width: 30px;
  height: 30px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.refresh-btn {
  padding: 15px 40px;
  background-color: #5f9ea0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background-color: #4d9294;
  transform: translateY(-2px);
}
</style>
