<template>
  <div class="test-box">
    <div class="card-expansion" :class="{ click: isExpanded }">
      <ul ref="listRef" class="card-expansion-list" role="listbox" aria-label="카드 선택">
        <li
          v-for="n in total"
          :key="n"
          class="card"
          :class="{
            selected: n === selected,
            hidden: shouldHide(n), // ← 부드러운 숨김 처리
            'slide-in': isSlideIn(n), // ← 새로 나타나는 카드
            'slide-out': isSlideOut(n), // ← 사라지는 카드
          }"
          :aria-selected="n === selected"
          :aria-hidden="shouldHide(n) ? 'true' : 'false'"
          tabindex="0"
          @click="selectCard(n)"
          @keydown.enter.prevent="selectCard(n)"
          @keydown.space.prevent="selectCard(n)"
        >
          {{ n }}
        </li>
      </ul>

      <OverlayScrollbar v-if="isExpanded" :for="listRef" :size="8" :offset="6" :minThumb="28" />

      <button class="expansion-btn" @click="toggleExpand">
        {{ isExpanded ? "접기" : "전체보기" }}
      </button>
    </div>

    <div v-if="isExpanded" class="card-expansion-placeholder"></div>

    <div class="test-area">TEST</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import OverlayScrollbar from "@/components/layout/OverlayScrollbar.vue";

const isExpanded = ref(false);
const wasRecentlyExpanded = ref(false); // 최근에 접었는지 추적

const toggleExpand = () => {
  if (isExpanded.value) {
    // 접을 때
    wasRecentlyExpanded.value = true;
    isExpanded.value = false;

    // 잠시 후 플래그 해제 (접기 애니메이션 완료 후)
    setTimeout(() => {
      wasRecentlyExpanded.value = false;
    }, 50);
  } else {
    // 펼칠 때
    isExpanded.value = true;
    wasRecentlyExpanded.value = false;
  }
};

// 총 카드 개수(동적으로 바뀔 수 있으면 prop/상태로 치환)
const total = 20;

// 스크롤 타깃 ref
const listRef = ref<HTMLElement | null>(null);

// 선택 상태: 기본 1번
const selected = ref<number>(1);
const prevSelected = ref<number>(1); // 이전 선택값 추적

const selectCard = (n: number) => {
  if (isExpanded.value) {
    selected.value = n;
    return;
  }

  // 접힌 상태에서만 이전 선택값 추적 (접기 직후가 아닐 때)
  if (!wasRecentlyExpanded.value) {
    prevSelected.value = selected.value;
  }
  selected.value = n;
};

/**
 * 접힘 상태에서 보여줄 인덱스 3개를 계산
 */
const visibleSet = computed<Set<number>>(() => {
  if (isExpanded.value) {
    return new Set(Array.from({ length: total }, (_, i) => i + 1));
  }

  const s = selected.value;
  const start = Math.max(1, Math.min(s - 1, total - 2));
  return new Set([start, start + 1, start + 2]);
});

// 이전 상태의 visibleSet
const prevVisibleSet = computed<Set<number>>(() => {
  if (isExpanded.value) {
    return new Set();
  }

  const s = prevSelected.value;
  const start = Math.max(1, Math.min(s - 1, total - 2));
  return new Set([start, start + 1, start + 2]);
});

// 카드 숨김 여부
const shouldHide = (n: number) => !visibleSet.value.has(n);

// 슬라이드 인 애니메이션 (새로 나타나는 카드) - 접힌 상태에서만
const isSlideIn = (n: number) => {
  return (
    !isExpanded.value &&
    !wasRecentlyExpanded.value && // 최근에 접지 않았을 때만
    visibleSet.value.has(n) &&
    !prevVisibleSet.value.has(n)
  );
};

// 슬라이드 아웃 애니메이션 (사라지는 카드) - 접힌 상태에서만
const isSlideOut = (n: number) => {
  return (
    !isExpanded.value &&
    !wasRecentlyExpanded.value && // 최근에 접지 않았을 때만
    !visibleSet.value.has(n) &&
    prevVisibleSet.value.has(n)
  );
};

// 선택된 카드로 스무스하게 스크롤하는 함수
// const scrollToSelected = () => {
//   if (!isExpanded.value) return;

//   const listElement = listRef.value;
//   if (!listElement) return;

//   const selectedCard = listElement.querySelector(`li:nth-child(${selected.value})`);
//   if (selectedCard) {
//     selectedCard.scrollIntoView({
//       behavior: "smooth",
//       block: "nearest",
//     });
//   }
// };

// watchEffect(() => {
//   if (isExpanded.value) {
//     nextTick(() => scrollToSelected());
//   }
// });

// 애니메이션 완료 후 클래스 정리 (접기 직후가 아닐 때만)
watch([selected], () => {
  if (!wasRecentlyExpanded.value) {
    setTimeout(() => {
      prevSelected.value = selected.value;
    }, 300); // 애니메이션 시간과 맞춤
  }
});
</script>

<style scoped>
.test-box {
  width: 1000px;
  height: 1000px;
  background-color: #dddddd;
  box-sizing: border-box;
  padding: 40px;
  position: relative;
}

.test-area {
  width: 100%;
  height: 100px;
  background-color: cadetblue;
  text-align: center;
  line-height: 100px;
  font-size: 40px;
  color: #ffffff;
  margin-top: 20px;
}

/* 기본 카드 박스: 접힌 높이 유지 */
.card-expansion {
  position: relative;
  width: 100%;
  height: 230px;
}

/* 리스트 기본(접힘) - 컨테이너 설정 */
.card-expansion > .card-expansion-list {
  width: 100%;
  height: 190px;
  overflow: hidden;

  display: flex;
  flex-wrap: nowrap;

  box-sizing: border-box;
  padding: 20px;
  background-color: #999999;

  transition: height 0.3s ease-out;
}

/* 확장 상태: 오버레이로 띄우기 */
.card-expansion.click {
  position: absolute;
  width: calc(100% - 80px);
  z-index: 10;
}

/* 확장 시 스크롤 컨테이너 */
.card-expansion.click > .card-expansion-list {
  height: 530px;
  overflow-y: auto;
  padding: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

/* placeholder */
.card-expansion-placeholder {
  height: 230px;
}

/* 카드 아이템 - 기본 상태 */
.card-expansion .card {
  width: calc((100% - 40px) / 3);
  height: 150px;
  background-color: aqua;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;

  margin-right: 20px;

  /* 기본적으로는 애니메이션 없음 */
  transition: none;
  transform: translateX(0);
  opacity: 1;
}

/* 마지막 카드는 margin 제거 */
.card-expansion .card:last-child {
  margin-right: 0;
}

/* 확장 상태에서의 카드 너비 조정 */
.card-expansion.click .card {
  width: calc((100% - 40px) / 3);
  margin-right: 0;
  transition: none; /* 확장 상태에서는 애니메이션 제거 */
}

/* 숨김 상태 - 즉시 숨김 */
.card-expansion .card.hidden {
  width: 0;
  min-width: 0;
  padding: 0;
  margin: 0;
  opacity: 0;
  transform: translateX(0); /* 움직임 없음 */
  transition: none !important; /* 강제로 애니메이션 제거 */
}

/* 슬라이드 인 애니메이션 */
.card-expansion .card.slide-in {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* 슬라이드 아웃 애니메이션 */
.card-expansion .card.slide-out {
  animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* 키프레임 애니메이션 정의 */
@keyframes slideIn {
  from {
    width: 0;
    margin: 0;
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    width: calc((100% - 40px) / 3);
    margin-right: 20px;
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    width: calc((100% - 40px) / 3);
    margin-right: 20px;
    opacity: 1;
    transform: translateX(0);
  }
  to {
    width: 0;
    margin: 0;
    opacity: 0;
    transform: translateX(-20px);
  }
}

/* 선택 상태 - 빨간색 */
.card-expansion .card.selected {
  background-color: #e02424;
  color: #fff;
}

/* 버튼 */
.expansion-btn {
  cursor: pointer;
  width: 100%;
  height: 40px;
  background-color: #333;
  color: #fff;
  border: 0;
}
</style>
