<template>
  <div class="pdf-shell" :class="{ 'no-thumbs': !showThumbs }">
    <header class="pdf-header">
      <div class="left">
        <button class="icon-btn" @click="toggleThumbs">☰</button>
        <strong class="title">{{ titleToShow }}</strong>
        <span class="muted">{{ page }} / {{ totalPages || "—" }}</span>
      </div>
      <div class="right">
        <button class="icon-btn" @click="zoomOut">−</button>
        <button class="icon-btn" @click="zoomIn">＋</button>
        <button class="icon-btn" @click="goPrev" :disabled="page <= 1">⟨</button>
        <button class="icon-btn" @click="goNext" :disabled="totalPages ? page >= totalPages : false">⟩</button>
        <button class="icon-btn" @click="downloadPdf">💾</button>
        <button class="icon-btn" @click="printPdf">🖨️</button>
      </div>
    </header>

    <div class="pdf-body">
      <aside class="pdf-thumbs" v-show="showThumbs" ref="thumbsRef">
        <PDF class="thumbs-pdf" :src="src" :pdf-width="thumbWidthPx + 'px'" :row-gap="8" :show-progress="false" :show-page-tooltip="false" :show-back-to-top-btn="false" />
      </aside>

      <main class="pdf-view" ref="mainRef">
        <PDF class="main-pdf" :src="src" :pdf-width="mainWidthPx + 'px'" :row-gap="16" :show-progress="true" :progress-color="progressColor" :show-page-tooltip="true" :show-back-to-top-btn="true" :scroll-threshold="200" />
        <div class="page-bar">
          <button class="mini" @click="goPrev" :disabled="page <= 1">‹</button>
          <input class="page-input" type="number" v-model.number="page" :min="1" :max="totalPages || 1" @change="jumpToInputPage" />
          <span>/ {{ totalPages || "—" }}</span>
          <button class="mini" @click="goNext" :disabled="totalPages ? page >= totalPages : false">›</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import PDF from "pdf-vue3";

const src = ref("/public/pdf/pdf.pdf");
const docTitle = ref<string | null>(null);

const page = ref(1);
const totalPages = ref<number | null>(null);
const showThumbs = ref(true);
const mainWidthPx = ref(820);
const thumbWidthPx = ref(120);
const progressColor = ref("#9aa7b1");

const mainRef = ref<HTMLElement | null>(null);
const thumbsRef = ref<HTMLElement | null>(null);

const titleToShow = computed(() => {
  if (docTitle.value) return docTitle.value;
  try {
    const u = new URL(src.value, window.location.href);
    return decodeURIComponent(u.pathname.split("/").pop() || "document.pdf");
  } catch {
    return "document.pdf";
  }
});

let mainMo: MutationObserver | null = null;
let thumbsMo: MutationObserver | null = null;
let resizeObs: ResizeObserver | null = null;
let pendingScrollTo: number | null = null;

function updateTotalPages() {
  const mainCount = mainRef.value ? mainRef.value.querySelectorAll("canvas").length : 0;
  const thumbsCount = thumbsRef.value ? thumbsRef.value.querySelectorAll("canvas").length : 0;
  const max = Math.max(mainCount, thumbsCount);
  totalPages.value = max > 0 ? max : totalPages.value;
}

function currentPageFromScroll() {
  const host = mainRef.value;
  if (!host) return;
  const list = Array.from(host.querySelectorAll("canvas")) as HTMLCanvasElement[];
  if (list.length === 0) return;
  const top = host.scrollTop;
  const vh = host.clientHeight;
  let best = 1;
  let bestDist = Infinity;
  list.forEach((cv, idx) => {
    const rectTop = cv.offsetTop - top;
    const centerDist = Math.abs(rectTop + cv.offsetHeight / 2 - vh / 2);
    if (centerDist < bestDist) {
      bestDist = centerDist;
      best = idx + 1;
    }
  });
  page.value = best;
}

function scrollToMainPage(n: number) {
  const host = mainRef.value;
  if (!host) return;
  const cv = host.querySelectorAll("canvas")[n - 1] as HTMLCanvasElement | undefined;
  if (cv) {
    cv.scrollIntoView({ behavior: "smooth", block: "start" });
    page.value = n;
    pendingScrollTo = null;
    return;
  }
  pendingScrollTo = n;
}

function onThumbsClick(ev: Event) {
  const host = thumbsRef.value;
  const mainHost = mainRef.value;
  if (!host || !mainHost) return;
  const canvas = (ev.target as HTMLElement)?.closest?.("canvas");
  if (!canvas) return;
  const list = Array.from(host.querySelectorAll("canvas"));
  const idx = list.indexOf(canvas as HTMLCanvasElement);
  if (idx >= 0) scrollToMainPage(idx + 1);
}

function goPrev() {
  const target = Math.max(1, page.value - 1);
  scrollToMainPage(target);
}
function goNext() {
  const max = totalPages.value || page.value + 1;
  const target = Math.min(max, page.value + 1);
  scrollToMainPage(target);
}
function jumpToInputPage() {
  const max = totalPages.value || page.value;
  const n = Math.max(1, Math.min(max, page.value));
  scrollToMainPage(n);
}

function zoomIn() {
  mainWidthPx.value = Math.min(mainWidthPx.value + 100, (mainRef.value?.clientWidth || 900) - 24);
}
function zoomOut() {
  mainWidthPx.value = Math.max(200, mainWidthPx.value - 100);
}
async function toggleThumbs() {
  showThumbs.value = !showThumbs.value;
  await nextTick();
  recalcMainWidth();
}

function recalcMainWidth() {
  const host = mainRef.value;
  if (!host) return;
  const max = Math.max(200, host.clientWidth - 24);
  if (mainWidthPx.value > max) mainWidthPx.value = max;
}

async function fetchPdfBlob(): Promise<Blob> {
  const res = await fetch(src.value);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.blob();
}
async function downloadPdf() {
  const blob = await fetchPdfBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = titleToShow.value.endsWith(".pdf") ? titleToShow.value : `${titleToShow.value}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
async function printPdf() {
  const blob = await fetchPdfBlob();
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", width: "0", height: "0", border: "0", right: "0", bottom: "0" });
  iframe.src = url;
  document.body.appendChild(iframe);
  const cleanup = () => {
    URL.revokeObjectURL(url);
    iframe.remove();
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  iframe.onload = () =>
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(cleanup, 4000);
    }, 150);
}

onMounted(() => {
  if (thumbsRef.value) {
    thumbsRef.value.addEventListener("click", onThumbsClick);
    thumbsMo = new MutationObserver(() => updateTotalPages());
    thumbsMo.observe(thumbsRef.value, { childList: true, subtree: true });
  }
  if (mainRef.value) {
    mainRef.value.addEventListener("scroll", currentPageFromScroll, { passive: true });
    mainMo = new MutationObserver(() => {
      updateTotalPages();
      if (pendingScrollTo != null) scrollToMainPage(pendingScrollTo);
    });
    mainMo.observe(mainRef.value, { childList: true, subtree: true });
  }
  resizeObs = new ResizeObserver(recalcMainWidth);
  mainRef.value && resizeObs.observe(mainRef.value);
  nextTick(updateTotalPages);
});

onBeforeUnmount(() => {
  thumbsRef.value && thumbsRef.value.removeEventListener("click", onThumbsClick);
  mainRef.value && mainRef.value.removeEventListener("scroll", currentPageFromScroll);
  thumbsMo?.disconnect();
  thumbsMo = null;
  mainMo?.disconnect();
  mainMo = null;
  resizeObs?.disconnect();
  resizeObs = null;
});
</script>

<style scoped>
.pdf-shell {
  width: 1400px;
  height: 1000px;
  display: grid;
  grid-template-rows: 44px 1fr;
  grid-template-columns: 180px 1fr;
  background: #1f2326;
  color: #e6e8ea;
  border: 1px solid #333a40;
  box-sizing: border-box;
}
.pdf-shell.no-thumbs {
  grid-template-columns: 0 1fr;
}
.pdf-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  background: #5f666d;
  color: #fff;
  font-size: 13px;
}
.pdf-header .left,
.pdf-header .right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.title {
  max-width: 420px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.muted {
  opacity: 0.85;
}
.icon-btn {
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  padding: 5px 9px;
  border-radius: 8px;
  cursor: pointer;
}
.icon-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.pdf-body {
  grid-column: 1 / -1;
  display: contents;
}
.pdf-thumbs {
  grid-row: 2;
  grid-column: 1;
  overflow: auto;
  padding: 8px;
  background: #2a2f34;
  border-right: 1px solid #3a4147;
}
.pdf-thumbs canvas {
  display: block;
  width: 100% !important;
  height: auto !important;
  margin: 0 auto 8px;
  background: #fff;
  box-shadow: 0 0 0 1px #3a4147, 0 2px 6px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
.pdf-view {
  grid-row: 2;
  grid-column: 2;
  overflow: hidden;
  background: #1f2326;
}
.main-pdf {
  display: block;
  margin: 0 auto;
}
.pdf-view canvas {
  display: block;
  margin: 0 auto 16px;
  background: #fff;
  box-shadow: 0 0 0 1px #3a4147, 0 8px 20px rgba(0, 0, 0, 0.35);
  max-width: 100%;
  height: auto;
}
.page-bar {
  position: sticky;
  bottom: 8px;
  left: 0;
  right: 0;
  width: fit-content;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid #3a4147;
  border-radius: 12px;
  padding: 6px 10px;
  backdrop-filter: blur(6px);
}
.page-input {
  width: 64px;
  padding: 4px 6px;
  border-radius: 8px;
  border: 1px solid #3a4147;
  background: #23282d;
  color: #e6e8ea;
  text-align: center;
}
.mini {
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid #3a4147;
  background: #2b3036;
  color: #e6e8ea;
}
.mini:disabled {
  opacity: 0.5;
}
</style>
