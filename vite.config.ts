import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: { target: "es2020", sourcemap: false },
  test: { include: ["src/**/*.test.ts", "tests/**/*.test.ts"], environment: "node" },
});
