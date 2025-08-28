<template>
  <div class="auth-bg">
    <div class="not-found-area">
      <img src="@/assets/images/404.svg" alt="404 not found icon" />
      <h1>잘못된 페이지 접근</h1>
      <p>
        입력한 주소가 잘못되었거나, 서비스 이용 권한 및 업무 프로세스에 맞지 않는 화면에 접근한 경우
        <br />
        정상적으로 서비스를 이용하실 수 없습니다.
      </p>

      <ul>
        <li class="notice-item">
          <p class="contact-info text">
            정상적으로 접속했음에도 불구하고 원하는 페이지로 이동하지 않을 경우, 아래 고객센터로 문의해 주시기 바랍니다.
            <!-- 정상적으로 페이지 접근에도 해당 페이지로 이동한 경우 아래의 고객센터로 연락주시기 바랍니다. -->
          </p>
          <div class="contact-info-block">
            <p class="contact-info tell">
              <span>문의전화</span>
              070-1234-1234
            </p>
            <p class="contact-info time">
              <span>운영시간</span>
              월~금 09:00~18:00 (공휴일 제외)
            </p>
          </div>
        </li>
        <li>
          <button class="link_btn" @click="goToLogin">로그인 or 메인으로</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNavigation } from "@/composables/useNavigation";

const { goToLogin } = useNavigation();
</script>
<style>
.notice-item {
  margin-bottom: 20px;
  padding: 20px;
  box-sizing: border-box;
  border: 2px solid #cadfdf;
  border-radius: 5px;
}

.notice-item .contact-info.text {
  margin-bottom: 20px;
}

.notice-item .contact-info.tell {
  margin-bottom: 8px;
}

.notice-item .contact-info.tell,
.notice-item .contact-info.time {
  font-weight: 600;
}

.notice-item p {
  color: #4d9294;
}

.notice-item p span {
  font-weight: 600;
  margin-right: 20px;
  color: #5f9ea0;
}

.not-found-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 60px 0;
}

.not-found-area > img {
  height: 300px;
  margin-bottom: 20px;
}

.not-found-area > h1 {
  color: #4d9294;
  margin-bottom: 20px;
}

.not-found-area > p {
  font-size: 18px;
  color: #4d9294;
  margin-bottom: 60px;
  text-align: center;
}

.contact-info-block {
  display: flex;
  justify-content: center;
}

.contact-info-block p:first-of-type {
  margin-right: 40px;
}

.contact-info-block p {
  font-size: 18px;
}

.contact-info-block p > span {
  font-size: 16px;
  background-color: #4d9294;
  padding: 5px 10px;
  border-radius: 5px;
  color: #ffffff;
  margin-right: 10px;
}

.not-found-area ul {
  border-radius: 50px;
}

.not-found-area ul button {
  width: 400px;
  display: block;
  margin: 0 auto;
}
</style>
