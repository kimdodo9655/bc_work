import { useUIStore } from "@/stores/ui";

export function useUI() {
  const store = useUIStore();

  return {
    // 로딩
    showLoading: (message?: string) => store.showLoading(message),
    hideLoading: () => store.hideLoading(),

    // 토스트 (간단한 메소드들)
    success: (message: string, title?: string) => store.showToast("success", message, title),
    error: (message: string, title?: string) => store.showToast("error", message, title),
    info: (message: string, title?: string) => store.showToast("info", message, title),
    warning: (message: string, title?: string) => store.showToast("warning", message, title),

    // 알럿
    alert: (title: string, message: string, onConfirm?: () => void) => {
      store.showAlert("info", title, message, onConfirm);
    },

    // 컨펌
    confirm: (title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
      store.showConfirm(title, message, onConfirm, onCancel);
    },
  };
}
