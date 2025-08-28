<template>
  <div class="invalid-access-bg">
    <div class="invalid-access">
      <img src="@/assets/images/404.svg" alt="404 not found icon" class="invalid-access__icon" />

      <h1 class="invalid-access__title">잘못된 페이지 접근</h1>

      <p class="invalid-access__description">
        입력한 주소가 잘못되었거나, 서비스 이용 권한 및 업무 프로세스에 맞지 않는 화면에 접근한 경우
        <br />
        정상적으로 서비스를 이용하실 수 없습니다.
      </p>

      <ul class="invalid-access__actions">
        <li class="notice-block">
          <p class="notice-block__text">정상적으로 접속했음에도 불구하고 원하는 페이지로 이동하지 않을 경우, 아래 고객센터로 문의해 주시기 바랍니다.</p>

          <div class="notice-block__contact-info">
            <p>
              <span>문의전화</span>
              070-1234-1234
            </p>
            <p>
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
