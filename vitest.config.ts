import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: [
      "./src/__tests__/vitest.env.ts",
      "./src/__tests__/vitest.setup.ts",
    ],
    globalSetup: "./src/__tests__/vitest.global.ts",
    environment: "node",
    include: ["src/__tests__/**/*.test.{ts,tsx,js,jsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
