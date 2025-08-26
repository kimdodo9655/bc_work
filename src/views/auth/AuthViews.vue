<template>
  <div class="auth-bg">
    <!-- <div class="input-wrapper">
      <Search class="icon" />
      <input type="text" placeholder="검색..." />
    </div> -->

    <div class="auth-card">
      <div class="auth-inner-left">
        <IconoirProvider :icon-props="{ color: '#FFFFFF', width: 150, height: 150, strokeWidth: 1.5 }">
          <LogIn />
        </IconoirProvider>
      </div>
      <div class="auth-inner-right">
        <header>
          <h3 class="mb-4">법무대리인 등기지원시스템</h3>
          <h1>로그인</h1>
        </header>

        <form class="login-form" @submit.prevent="submit">
          <input type="text" v-model="user" placeholder="아이디" />
          <input type="password" v-model="pw" placeholder="비밀번호" />
          <ul>
            <li>
              <label>
                <input type="checkbox" />
                아이디 기억하기
              </label>
            </li>
            <li>
              <a href="#">비밀번호 변경</a>
            </li>
          </ul>
          <button type="submit">로그인</button>
        </form>
      </div>
    </div>

    <!-- <router-view /> -->
  </div>
</template>

<script setup lang="ts">
import { IconoirProvider } from "@iconoir/vue";
import { LogIn } from "@iconoir/vue";

import { ref } from "vue";

const user = ref("");
const pw = ref("");

function submit() {
  console.log(user.value);
  console.log(pw.value);
}
</script>

<style scoped>
.input-wrapper {
  position: relative;
  display: inline-block;
}

.input-wrapper input {
  padding-left: 36px; /* 아이콘 자리 확보 */
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.input-wrapper .icon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  stroke: #666;
}
</style>
