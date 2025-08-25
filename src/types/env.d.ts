interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SHOW_DEV: "true" | "false";
  readonly VITE_SHOW_DEV_TEXT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
