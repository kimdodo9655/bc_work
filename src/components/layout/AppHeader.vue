<template>
  <header class="main-header">
    <nav>
      <img class="logo" src="@/assets/images/logos/image.png" alt="logo" />

      <ul class="menu">
        <li class="active">등기 견적 관리</li>
        <li>등기 진행 현황</li>
        <li>등기 일정 관리</li>
        <li>비용 통계 관리</li>
      </ul>

      <ul class="user">
        <li>
          <Bell color="#999999" :width="28" :height="28" :stroke-width="2.0" />
        </li>
        <li>
          <ProfileCircle color="#999999" :width="30" :height="30" :stroke-width="2.0" />
        </li>
        <li class="login-time">
          <TimerSolid color="#ffffff" :width="20" :height="20" :stroke-width="2.0" />
          <p>00:00</p>
          <button>연장</button>
        </li>
      </ul>
    </nav>
  </header>

  <ul ref="bcRef" class="main-breadcrumbs">
    <li>HOME</li>
    <li><NavArrowRight color="#9999999" /></li>
    <li>등기 견적 관리</li>
    <li><NavArrowRight color="#999999" /></li>
    <li class="now">등기 견적 관리 상세</li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { NavArrowRight, Bell, ProfileCircle, TimerSolid } from "@iconoir/vue";

const bcRef = ref<HTMLElement | null>(null);

function applyScrollState(scrolled: boolean) {
  // 1) breadcrumbs에 .scroll 토글
  if (bcRef.value) {
    bcRef.value.classList.toggle("scroll", scrolled);
  }

  // 2) dashboard-bg margin-top 토글
  const dash = document.querySelector<HTMLElement>(".dashboard-bg");
  if (dash) {
    dash.style.marginTop = scrolled ? "-80px" : "-130px";
    dash.style.paddingTop = scrolled ? "180px" : "230px";
  }
}

function onScroll() {
  // 최상단에서 내려왔는지 여부(1px 이상이면 true)
  const scrolled = window.scrollY > 0;
  applyScrollState(scrolled);
}

onMounted(() => {
  // 초기 상태 동기화
  onScroll();

  // 스크롤 이벤트 등록
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>
