// types/pdf-vue3.d.ts
// 프로젝트 루트의 types 폴더에 이 파일을 생성하세요

declare module "pdf-vue3" {
  import { DefineComponent } from "vue";

  interface PDFProps {
    src: string | Uint8Array;
    page?: number;
    pdfWidth?: string;
    rowGap?: number;
    showProgress?: boolean;
    progressColor?: string;
    showPageTooltip?: boolean;
    showBackToTopBtn?: boolean;
    scrollThreshold?: number;
    password?: string;
    useSystemFonts?: boolean;
    stopAtErrors?: boolean;
    disableFontFace?: boolean;
    disableRange?: boolean;
    disableStream?: boolean;
    disableAutoFetch?: boolean;
    httpHeaders?: Record<string, string>;
    withCredentials?: boolean;
    cMapUrl?: string;
  }

  interface PDFEvents {
    onPdfInit?: (pdf: any) => void;
    onComplete?: () => void;
    onProgress?: (progress: number) => void;
    onPageChange?: (page: number) => void;
    onScroll?: (scrollOffset: number) => void;
    onError?: (error: any) => void;
  }

  const PDF: DefineComponent<PDFProps & PDFEvents>;
  export default PDF;
}

// 전역 타입 보강
declare global {
  interface Window {
    // 필요한 경우 추가 타입 정의
  }
}

export {};
