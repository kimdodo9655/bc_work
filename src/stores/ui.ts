import { defineStore } from "pinia";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  title?: string;
}

interface AlertData {
  show: boolean;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  onConfirm?: () => void;
}

interface ConfirmData {
  show: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useUIStore = defineStore("ui", {
  state: () => ({
    loading: false,
    loadingMessage: "",
    toasts: [] as Toast[],
    alert: {
      show: false,
      type: "info",
      title: "",
      message: "",
      onConfirm: undefined,
    } as AlertData,
    confirm: {
      show: false,
      title: "",
      message: "",
      onConfirm: undefined,
      onCancel: undefined,
    } as ConfirmData,
  }),

  actions: {
    // 로딩
    showLoading(message = "처리 중...") {
      this.loading = true;
      this.loadingMessage = message;
    },
    hideLoading() {
      this.loading = false;
      this.loadingMessage = "";
    },

    // 토스트
    showToast(type: Toast["type"], message: string, title?: string) {
      const id = Date.now().toString();
      this.toasts.push({ id, type, message, title });

      setTimeout(() => {
        this.removeToast(id);
      }, 5000);
    },
    removeToast(id: string) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index > -1) this.toasts.splice(index, 1);
    },

    // 알럿
    showAlert(type: AlertData["type"], title: string, message: string, onConfirm?: () => void) {
      this.alert = { show: true, type, title, message, onConfirm };
    },
    hideAlert() {
      this.alert.show = false;
    },

    // 알럿 (API 응답 기반)
    showAlertFromApi(response: { title: string; message: string; isSuccess: boolean }, onConfirm?: () => void) {
      const type = response.isSuccess ? "success" : "error";
      this.alert = {
        show: true,
        type,
        title: response.title,
        message: response.message,
        onConfirm,
      };
    },

    // 컨펌
    showConfirm(title: string, message: string, onConfirm?: () => void, onCancel?: () => void) {
      this.confirm = { show: true, title, message, onConfirm, onCancel };
    },
    hideConfirm() {
      this.confirm.show = false;
    },
  },
});
