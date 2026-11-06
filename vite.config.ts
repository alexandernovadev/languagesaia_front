import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const { version } = JSON.parse(readFileSync("./package.json", "utf8"));

export default defineConfig(({ command }) => ({
  plugins: [react()],
  css: {
    modules: {
      /* The lai-* keyframes live in motion.css, outside any module. Hashing the
         name in `animation: lai-pop` would point it at keyframes that don't exist. */
      generateScopedName: (name, filename) =>
        name.startsWith("lai-") ? name : `_${name}_${createHash("sha256").update(relative(import.meta.dirname, filename)).digest("hex").slice(0, 6)}`,
    },
  },
  /* Shown in /admin/sistema. There is no build date while developing. */
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_DATE__: JSON.stringify(command === "build" ? new Date().toISOString() : null),
  },
}));
