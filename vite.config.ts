// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // css: {
    //   preprocessorOptions: {
    //     scss: {
    //       additionalData: `
    //         @use "@/assets/styles/base/variables" as *;
    //         @use "@/assets/styles/mixins/media" as *;
    //         @use "@/assets/styles/mixins/utils" as *;
    //       `,
    //     },
    //   },
    // },
    esbuild: {
      legalComments: isBuild ? "none" : "inline",
      drop: isBuild ? ["console", "debugger"] : [],
    },
    server: {
      port: 8101,
      open: true,
      strictPort: true,
      // host: true, // 외부 기기 접속 필요하면 활성화
    },
  };
});
