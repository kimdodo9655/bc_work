// src/types/components.ts
export interface BaseComponentProps {
  id?: string;
  class?: string | string[] | Record<string, boolean>;
  style?: string | Record<string, any>;
}

export interface OverlayScrollbarProps extends BaseComponentProps {
  for: HTMLElement | null;
  autoHide?: boolean;
  size?: number;
  offset?: number;
  minThumb?: number;
}

export interface ModalProps extends BaseComponentProps {
  show: boolean;
  title?: string;
  persistent?: boolean;
  maxWidth?: string;
}

export interface ToastProps extends BaseComponentProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  title?: string;
  duration?: number;
  closable?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
}

export interface InputProps extends BaseComponentProps {
  modelValue?: string | number;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string | boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

// 이벤트 타입 정의
export interface ComponentEmits {
  "update:modelValue": [value: any];
  change: [value: any];
  click: [event: MouseEvent];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}

// 슬롯 타입 정의
export interface ComponentSlots {
  default?: () => any;
  header?: () => any;
  footer?: () => any;
  prepend?: () => any;
  append?: () => any;
}
