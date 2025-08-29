// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ command, mode }) => {
  const isBuild = command === "build";
  const isProduction = mode === "production";

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    esbuild: {
      legalComments: isBuild ? "none" : "inline",
      // 프로덕션 빌드에서만 console 제거
      drop: isProduction ? ["console", "debugger"] : [],
    },
    server: {
      port: 8101,
      open: true,
      strictPort: true,
    },
  };
});
