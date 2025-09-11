<template>
  <div class="pdf-shell" :class="{ 'no-thumbs': !showThumbs }">
    <header class="pdf-header">
      <div class="left">
        <button class="icon-btn" @click="toggleThumbs" title="썸네일 토글">☰</button>
        <strong class="title">{{ titleToShow }}</strong>
        <span class="muted">{{ currentPage }} / {{ totalPages || "—" }}</span>
      </div>
      <div class="right">
        <button class="icon-btn" @click="zoomOut" :disabled="isMinZoom" title="축소">−</button>
        <button class="icon-btn" @click="zoomIn" :disabled="isMaxZoom" title="확대">＋</button>
        <button class="icon-btn" @click="goPrev" :disabled="currentPage <= 1" title="이전 페이지">⟨</button>
        <button class="icon-btn" @click="goNext" :disabled="!totalPages || currentPage >= totalPages" title="다음 페이지">⟩</button>
        <button class="icon-btn" @click="downloadPdf" :disabled="!src" title="다운로드">💾</button>
        <button class="icon-btn" @click="printPdf" :disabled="!src" title="인쇄">🖨️</button>
      </div>
    </header>

    <div class="pdf-body">
      <!-- 썸네일 패널 -->
      <aside class="pdf-thumbs" v-show="showThumbs" ref="thumbsRef">
        <div class="thumbs-header">
          <span>페이지 미리보기</span>
          <span class="page-count" v-if="totalPages">({{ totalPages }}페이지)</span>
        </div>
        <div class="thumbs-container">
          <!-- 썸네일 - 메인 PDF 로딩 완료 후 표시 -->
          <div v-if="!src" class="thumb-empty">
            <p>PDF를 로드하세요</p>
          </div>
          <div v-else-if="!showThumbsPdf" class="thumb-waiting">
            <div class="mini-spinner"></div>
            <p>썸네일 준비 중...</p>
          </div>
          <div v-else class="thumbs-pdf-container">
            <PDF :src="src" :pdf-width="thumbWidthPx + 'px'" :row-gap="8" :show-progress="false" :show-page-tooltip="false" :show-back-to-top-btn="false" />
          </div>
        </div>
      </aside>

      <!-- 메인 뷰어 -->
      <main class="pdf-view" ref="mainRef">
        <!-- 업로드 화면 -->
        <div v-if="!src" class="upload-screen">
          <div class="upload-content">
            <div class="upload-icon">📄</div>
            <h3>PDF 뷰어</h3>
            <p>PDF 파일을 선택하거나 샘플을 로드하세요</p>
            <div class="upload-buttons">
              <input type="file" accept=".pdf" @change="handleFileUpload" ref="fileInputRef" style="display: none" />
              <button @click="openFileDialog" class="btn btn-primary">파일 선택</button>
              <button @click="loadSample" class="btn btn-secondary">샘플 로드</button>
            </div>
          </div>
        </div>

        <!-- 메인 PDF -->
        <div v-else class="main-content">
          <PDF :src="src" :pdf-width="mainWidthPx + 'px'" :row-gap="16" :show-progress="true" :progress-color="progressColor" :show-page-tooltip="true" :show-back-to-top-btn="true" :scroll-threshold="200" />
        </div>

        <!-- 페이지 바 -->
        <div class="page-bar" v-if="src">
          <button class="mini" @click="goPrev" :disabled="currentPage <= 1" title="이전">‹</button>
          <input class="page-input" type="number" v-model.number="pageInput" :min="1" :max="totalPages || 1" @keyup.enter="jumpToPage" @blur="jumpToPage" />
          <span>/ {{ totalPages || "—" }}</span>
          <button class="mini" @click="goNext" :disabled="!totalPages || currentPage >= totalPages" title="다음">›</button>
          <div class="zoom-info">
            <span>{{ Math.round((mainWidthPx / 800) * 100) }}%</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import PDF from "pdf-vue3";

// 상태 관리
const src = ref<string>("");
const docTitle = ref<string>("");
const currentPage = ref(1);
const pageInput = ref(1);
const totalPages = ref<number>(0);
const showThumbs = ref(true);
const showThumbsPdf = ref(false);
const mainWidthPx = ref(800);
const thumbWidthPx = ref(120);
const progressColor = ref("#007bff");

// refs
const mainRef = ref<HTMLElement | null>(null);
const thumbsRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// computed
const titleToShow = computed(() => {
  if (docTitle.value) return docTitle.value;
  if (!src.value) return "PDF 뷰어";
  try {
    const url = new URL(src.value, window.location.href);
    return decodeURIComponent(url.pathname.split("/").pop() || "document.pdf");
  } catch {
    return "document.pdf";
  }
});

const isMinZoom = computed(() => mainWidthPx.value <= 400);
const isMaxZoom = computed(() => {
  const maxWidth = (mainRef.value?.clientWidth || 1000) - 50;
  return mainWidthPx.value >= maxWidth;
});

// 관찰자와 타이머
let mutationObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let pageUpdateTimer: number | null = null;
let thumbsTimer: number | null = null;

// 감시자
watch(currentPage, (newPage) => {
  pageInput.value = newPage;
});

watch(src, (newSrc) => {
  if (newSrc) {
    resetState();
    startPageDetection();
    // 3초 후 썸네일 표시
    thumbsTimer = setTimeout(() => {
      showThumbsPdf.value = true;
    }, 3000);
  } else {
    resetState();
  }
});

// 메서드
function resetState() {
  currentPage.value = 1;
  pageInput.value = 1;
  totalPages.value = 0;
  showThumbsPdf.value = false;

  if (thumbsTimer) {
    clearTimeout(thumbsTimer);
    thumbsTimer = null;
  }
}

function startPageDetection() {
  if (!mainRef.value) return;

  // DOM 변화 감지하여 페이지 수 업데이트
  mutationObserver = new MutationObserver(() => {
    updatePageInfo();
  });

  mutationObserver.observe(mainRef.value, {
    childList: true,
    subtree: true,
  });

  // 스크롤 이벤트로 현재 페이지 감지
  mainRef.value.addEventListener("scroll", handleScroll, { passive: true });

  // 초기 페이지 정보 업데이트
  setTimeout(updatePageInfo, 1000);
}

function updatePageInfo() {
  if (!mainRef.value) return;

  const canvases = mainRef.value.querySelectorAll("canvas");
  if (canvases.length > 0 && canvases.length !== totalPages.value) {
    totalPages.value = canvases.length;
    console.log("총 페이지 수 업데이트:", canvases.length);
  }
}

function handleScroll() {
  if (pageUpdateTimer) {
    clearTimeout(pageUpdateTimer);
  }

  pageUpdateTimer = setTimeout(() => {
    updateCurrentPageFromScroll();
  }, 100);
}

function updateCurrentPageFromScroll() {
  if (!mainRef.value) return;

  const canvases = Array.from(mainRef.value.querySelectorAll("canvas"));
  if (canvases.length === 0) return;

  const viewHeight = mainRef.value.clientHeight;

  let bestPage = 1;
  let bestDistance = Infinity;

  canvases.forEach((canvas, index) => {
    const rect = canvas.getBoundingClientRect();
    const mainRect = mainRef.value!.getBoundingClientRect();
    const relativeTop = rect.top - mainRect.top;
    const centerDistance = Math.abs(relativeTop + rect.height / 2 - viewHeight / 2);

    if (centerDistance < bestDistance) {
      bestDistance = centerDistance;
      bestPage = index + 1;
    }
  });

  if (bestPage !== currentPage.value && bestPage >= 1 && bestPage <= totalPages.value) {
    currentPage.value = bestPage;
  }
}

function scrollToPage(pageNum: number) {
  if (!mainRef.value) return;

  const canvases = mainRef.value.querySelectorAll("canvas");
  const targetCanvas = canvases[pageNum - 1] as HTMLCanvasElement;

  if (targetCanvas) {
    targetCanvas.scrollIntoView({ behavior: "smooth", block: "start" });
    currentPage.value = pageNum;
  }
}

function goPrev() {
  if (currentPage.value > 1) {
    scrollToPage(currentPage.value - 1);
  }
}

function goNext() {
  if (totalPages.value && currentPage.value < totalPages.value) {
    scrollToPage(currentPage.value + 1);
  }
}

function jumpToPage() {
  const targetPage = Math.max(1, Math.min(totalPages.value || 1, pageInput.value));
  pageInput.value = targetPage;
  scrollToPage(targetPage);
}

function zoomIn() {
  if (!isMaxZoom.value) {
    mainWidthPx.value += 100;
  }
}

function zoomOut() {
  if (!isMinZoom.value) {
    mainWidthPx.value -= 100;
  }
}

async function toggleThumbs() {
  showThumbs.value = !showThumbs.value;
  await nextTick();

  // 썸네일 토글 시 메인 뷰어 크기 재조정
  if (mainRef.value && typeof ResizeObserver !== "undefined") {
    const maxWidth = mainRef.value.clientWidth - 50;
    if (mainWidthPx.value > maxWidth) {
      mainWidthPx.value = Math.max(400, maxWidth);
    }
  }
}

// 파일 처리
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type === "application/pdf") {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result instanceof ArrayBuffer) {
        const blob = new Blob([new Uint8Array(result)], { type: "application/pdf" });
        src.value = URL.createObjectURL(blob);
        docTitle.value = file.name.replace(/\.[^/.]+$/, "");
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("PDF 파일만 선택할 수 있습니다.");
  }
}

function openFileDialog() {
  fileInputRef.value?.click();
}

function loadSample() {
  src.value = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
  docTitle.value = "TraceMoneky 샘플 문서";
}

// 다운로드/인쇄
async function downloadPdf() {
  if (!src.value) return;

  try {
    const response = await fetch(src.value);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = titleToShow.value.endsWith(".pdf") ? titleToShow.value : `${titleToShow.value}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("다운로드 실패:", error);
    alert("다운로드에 실패했습니다.");
  }
}

async function printPdf() {
  if (!src.value) return;

  try {
    // 새 창에서 PDF 열기
    const printWindow = window.open(src.value, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 1000);
      };
    }
  } catch (error) {
    console.error("인쇄 실패:", error);
    alert("인쇄에 실패했습니다.");
  }
}

// 썸네일 클릭 이벤트
function handleThumbsClick(event: Event) {
  if (!thumbsRef.value) return;

  const canvas = (event.target as HTMLElement).closest("canvas");
  if (canvas) {
    const canvases = Array.from(thumbsRef.value.querySelectorAll("canvas"));
    const index = canvases.indexOf(canvas);
    if (index >= 0) {
      scrollToPage(index + 1);
    }
  }
}

// 라이프사이클
onMounted(() => {
  if (thumbsRef.value) {
    thumbsRef.value.addEventListener("click", handleThumbsClick);
  }

  if (typeof ResizeObserver !== "undefined" && mainRef.value) {
    resizeObserver = new ResizeObserver(() => {
      const maxWidth = mainRef.value!.clientWidth - 50;
      if (mainWidthPx.value > maxWidth) {
        mainWidthPx.value = Math.max(400, maxWidth);
      }
    });
    resizeObserver.observe(mainRef.value);
  }
});

onBeforeUnmount(() => {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (pageUpdateTimer) {
    clearTimeout(pageUpdateTimer);
  }
  if (thumbsTimer) {
    clearTimeout(thumbsTimer);
  }
  if (thumbsRef.value) {
    thumbsRef.value.removeEventListener("click", handleThumbsClick);
  }
  if (mainRef.value) {
    mainRef.value.removeEventListener("scroll", handleScroll);
  }
});
</script>

<style scoped>
.pdf-shell {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-rows: 50px 1fr;
  grid-template-columns: 220px 1fr;
  background: #1a1d21;
  color: #e8eaed;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  border: 1px solid #2d3748;
}

.pdf-shell.no-thumbs {
  grid-template-columns: 0 1fr;
}

.pdf-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
}

.pdf-header .left,
.pdf-header .right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: #f7fafc;
}

.muted {
  color: #a0aec0;
  font-size: 14px;
}

.icon-btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f7fafc;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.icon-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pdf-body {
  grid-column: 1 / -1;
  display: contents;
}

.pdf-thumbs {
  grid-row: 2;
  grid-column: 1;
  background: #2a2f3a;
  border-right: 1px solid #4a5568;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.thumbs-header {
  padding: 12px 16px;
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-count {
  color: #a0aec0;
  font-weight: normal;
}

.thumbs-container {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.thumb-empty,
.thumb-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #718096;
  font-size: 13px;
  text-align: center;
}

.mini-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #4a5568;
  border-top: 2px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.thumbs-pdf-container :deep(canvas) {
  display: block;
  width: 100% !important;
  height: auto !important;
  margin: 0 auto 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s;
}

.thumbs-pdf-container :deep(canvas:hover) {
  transform: scale(1.03);
}

.pdf-view {
  grid-row: 2;
  grid-column: 2;
  background: #1a1d21;
  overflow: auto;
  position: relative;
}

.upload-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.upload-content {
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

.upload-icon {
  font-size: 72px;
  margin-bottom: 24px;
}

.upload-content h3 {
  font-size: 28px;
  margin: 0 0 12px 0;
  color: #f7fafc;
}

.upload-content p {
  font-size: 16px;
  color: #a0aec0;
  margin: 0 0 32px 0;
}

.upload-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
  transform: translateY(-1px);
}

.main-content {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.main-content :deep(canvas) {
  display: block;
  margin: 0 auto 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  max-width: 100%;
  height: auto;
}

.page-bar {
  position: sticky;
  bottom: 20px;
  left: 0;
  right: 0;
  width: fit-content;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(45, 55, 72, 0.95);
  border: 1px solid #4a5568;
  border-radius: 25px;
  padding: 10px 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.page-input {
  width: 70px;
  padding: 6px 10px;
  border: 1px solid #4a5568;
  border-radius: 6px;
  background: #2d3748;
  color: #f7fafc;
  text-align: center;
  font-size: 14px;
}

.page-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.mini {
  padding: 6px 12px;
  background: #4a5568;
  border: 1px solid #718096;
  color: #f7fafc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.mini:hover:not(:disabled) {
  background: #718096;
}

.mini:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-info {
  color: #a0aec0;
  font-size: 12px;
  margin-left: 8px;
  padding-left: 12px;
  border-left: 1px solid #4a5568;
}

/* 스크롤바 스타일 */
.pdf-view::-webkit-scrollbar,
.thumbs-container::-webkit-scrollbar {
  width: 8px;
}

.pdf-view::-webkit-scrollbar-track,
.thumbs-container::-webkit-scrollbar-track {
  background: #2d3748;
}

.pdf-view::-webkit-scrollbar-thumb,
.thumbs-container::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.pdf-view::-webkit-scrollbar-thumb:hover,
.thumbs-container::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

/* 반응형 */
@media (max-width: 768px) {
  .pdf-shell {
    grid-template-columns: 0 1fr;
  }

  .upload-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 250px;
  }

  .page-bar {
    padding: 8px 16px;
    gap: 8px;
  }

  .page-input {
    width: 60px;
  }
}
</style>
