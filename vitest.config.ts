import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
    setupFiles: ["./vitest.setup.ts"]
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  define: {
    "import.meta.env.VITE_AMBIENT_API_KEY": JSON.stringify("test-api-key"),
    "import.meta.env.VITE_AMBIENT_APPLICATION_KEY": JSON.stringify("test-application-key"),
    "import.meta.env.VITE_ROUTER_HISTORY": JSON.stringify("hash"),
    "import.meta.env.VITE_PORT": JSON.stringify("8848"),
    "import.meta.env.VITE_PUBLIC_PATH": JSON.stringify("/")
  }
});
