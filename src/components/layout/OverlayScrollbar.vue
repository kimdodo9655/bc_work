<!-- src/components/layout/OverlayScrollbar.vue -->

<template>
  <!-- 오버레이 레일 (부모: 스크롤 타깃의 offsetParent 기준) -->
  <div ref="railEl" class="os-rail" :class="{ 'os-visible': railVisible }" :style="railStyle" aria-hidden="true">
    <div class="os-thumb" :style="thumbStyle" @pointerdown="onPointerDown" role="scrollbar" :aria-valuemin="0" :aria-valuemax="maxScroll" :aria-valuenow="currentScroll" aria-orientation="vertical" tabindex="-1" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, computed, nextTick } from "vue";

type MaybeEl = HTMLElement | null;

/**
 * props
 * - for: 스크롤 가능한 타깃 엘리먼트(예: UL) ref
 * - autoHide: 사용자 상호작용 없을 때 페이드아웃
 * - size: 레일/엄지 두께(px)
 * - offset: 오른쪽 여백(px) - 콘텐츠를 덜 가리게
 * - minThumb: 엄지 최소 높이(px)
 */
const props = withDefaults(
  defineProps<{
    for: MaybeEl;
    autoHide?: boolean;
    size?: number;
    offset?: number;
    minThumb?: number;
  }>(),
  {
    autoHide: true,
    size: 8,
    offset: 4,
    minThumb: 32,
  }
);

const railEl = ref<MaybeEl>(null);
const scroller = ref<MaybeEl>(null);
const offsetParent = ref<MaybeEl>(null);

const railVisible = ref(false);
let hideTimer: number | null = null;

const trackTop = ref(0);
const trackBottom = ref(0);
const trackHeight = computed(() => Math.max(0, containerClientH.value - trackTop.value - trackBottom.value));

const containerClientH = ref(0);
const scrollH = ref(0);
const clientH = ref(0);
const scrollTop = ref(0);

const maxScroll = computed(() => Math.max(0, scrollH.value - clientH.value));
const currentScroll = computed(() => Math.min(maxScroll.value, scrollTop.value));

const thumbH = computed(() => {
  if (scrollH.value === 0) return props.minThumb;
  const ratio = clientH.value / scrollH.value;
  return Math.max(props.minThumb, Math.floor(trackHeight.value * ratio));
});

const thumbTop = computed(() => {
  if (maxScroll.value === 0) return 0;
  const free = Math.max(0, trackHeight.value - thumbH.value);
  return Math.floor((scrollTop.value / maxScroll.value) * free);
});

const canScroll = computed(() => scrollH.value > clientH.value && trackHeight.value > 0);

const railStyle = computed(() => ({
  top: `${railsBox().top}px`,
  bottom: `${railsBox().bottom}px`,
  right: `${props.offset}px`,
  width: `${props.size}px`,
  display: canScroll.value ? "block" : "none",
}));

const thumbStyle = computed(() => ({
  height: `${thumbH.value}px`,
  transform: `translateY(${thumbTop.value}px)`,
}));

function railsBox() {
  // 레일을 스크롤러의 content box 안쪽으로 맞춤 (패딩 감안)
  // 여기서는 스크롤러의 패딩 상/하를 읽어 여유 공간으로 사용
  if (!scroller.value || !offsetParent.value) return { top: 0, bottom: 0 };
  const cs = getComputedStyle(scroller.value);
  const padTop = parseFloat(cs.paddingTop || "0");
  const padBottom = parseFloat(cs.paddingBottom || "0");

  // 레일의 수직 영역
  trackTop.value = padTop;
  trackBottom.value = padBottom;
  return { top: scrollerOffsetTop(), bottom: scrollerOffsetBottom() };
}

function scrollerOffsetTop() {
  if (!scroller.value || !offsetParent.value) return 0;
  const sRect = scroller.value.getBoundingClientRect();
  const pRect = offsetParent.value.getBoundingClientRect();
  return Math.max(0, Math.round(sRect.top - pRect.top) + trackTop.value);
}

function scrollerOffsetBottom() {
  if (!scroller.value || !offsetParent.value) return 0;
  const sRect = scroller.value.getBoundingClientRect();
  const pRect = offsetParent.value.getBoundingClientRect();
  return Math.max(0, Math.round(pRect.bottom - sRect.bottom) + trackBottom.value);
}

function showRailTemporarily() {
  railVisible.value = true;
  if (!props.autoHide) return;
  if (hideTimer) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    railVisible.value = false;
  }, 700);
}

function readSizes() {
  if (!scroller.value) return;
  clientH.value = scroller.value.clientHeight;
  containerClientH.value = scroller.value.clientHeight;
  scrollH.value = scroller.value.scrollHeight;
  scrollTop.value = scroller.value.scrollTop;
}

function onScroll() {
  if (!scroller.value) return;
  scrollTop.value = scroller.value.scrollTop;
  showRailTemporarily();
}

let ro: ResizeObserver | null = null;
let io: ResizeObserver | null = null;

function attach(target: HTMLElement) {
  scroller.value = target;
  offsetParent.value = (target.offsetParent as HTMLElement) ?? target.parentElement;

  // 1) 네이티브 스크롤바 숨김 (폭 0)
  target.classList.add("os-hide-native");

  // 2) 이벤트/관찰자
  target.addEventListener("scroll", onScroll, { passive: true });
  ro = new ResizeObserver(() => {
    readSizes();
    nextTick(() => {
      /* 위치 재계산 */
      if (railEl.value) {
        // 강제 스타일 업데이트
        railEl.value.style.top = `${scrollerOffsetTop()}px`;
        railEl.value.style.bottom = `${scrollerOffsetBottom()}px`;
      }
    });
  });
  ro.observe(target);

  // 내부 콘텐츠 변동 감지용: 스크롤 높이가 바뀌면 업데이트
  io = new ResizeObserver(readSizes);
  io.observe(target);

  // 초기화
  readSizes();
  showRailTemporarily();

  // 휠/마우스 진입 시 표시
  target.addEventListener("mouseenter", showRailTemporarily);
  target.addEventListener("wheel", showRailTemporarily, { passive: true });
  window.addEventListener("resize", () => {
    readSizes();
    showRailTemporarily();
  });
}

function detach() {
  if (!scroller.value) return;
  scroller.value.removeEventListener("scroll", onScroll);
  scroller.value.removeEventListener("mouseenter", showRailTemporarily);
  scroller.value.removeEventListener("wheel", showRailTemporarily as any);
  scroller.value.classList.remove("os-hide-native");
  ro?.disconnect();
  ro = null;
  io?.disconnect();
  io = null;
}

onMounted(() => {
  if (props.for) attach(props.for);
});

onBeforeUnmount(() => {
  detach();
});

watch(
  () => props.for,
  (el, old) => {
    if (old) detach();
    if (el) attach(el);
  }
);

// 드래그(thumb → scrollTop 변환)
let dragging = false;
let startY = 0;
let startThumbTop = 0;

function onPointerDown(e: PointerEvent) {
  if (!canScroll.value) return;
  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  dragging = true;
  startY = e.clientY;
  startThumbTop = thumbTop.value;
  railVisible.value = true;

  const onMove = (me: PointerEvent) => {
    if (!dragging || !scroller.value) return;
    const dy = me.clientY - startY;
    const free = Math.max(0, trackHeight.value - thumbH.value);
    const nextThumb = Math.max(0, Math.min(free, startThumbTop + dy));
    // 역변환: thumb 위치 → scrollTop
    const nextScroll = (nextThumb / Math.max(1, free)) * maxScroll.value;
    scroller.value.scrollTop = nextScroll;
  };

  const onUp = (_ue: PointerEvent) => {
    dragging = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    showRailTemporarily();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", onUp, { once: true });
}
</script>
