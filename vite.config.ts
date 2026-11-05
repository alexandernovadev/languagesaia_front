import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const { version } = JSON.parse(readFileSync("./package.json", "utf8"));

export default defineConfig(({ command }) => ({
  plugins: [react()],
  /* Shown in /admin/sistema. There is no build date while developing. */
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_DATE__: JSON.stringify(command === "build" ? new Date().toISOString() : null),
  },
}));
