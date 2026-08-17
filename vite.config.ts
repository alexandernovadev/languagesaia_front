import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "LanguagesAI",
        short_name: "LanguagesAI",
        description: "Plataforma de aprendizaje de idiomas con IA",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  json: {
    stringify: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return;

          // Radix UI primitives — stable, large, never changes
          if (id.includes("@radix-ui/")) return "vendor-radix";

          // Charts — recharts pulls in d3 tree
          if (id.includes("recharts") || id.includes("d3-") || id.includes("d3/")) return "vendor-charts";

          // Forms — react-hook-form + zod + resolvers
          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform/") ||
            id.includes("zod")
          ) return "vendor-forms";

          // Markdown editor — heaviest single dep (~280KB gzip)
          if (id.includes("@uiw/") || id.includes("@codemirror/")) return "vendor-editor";

          // Date utilities
          if (id.includes("date-fns") || id.includes("react-day-picker")) return "vendor-date";

          // Drag and drop
          if (id.includes("@dnd-kit/")) return "vendor-dnd";
        },
      },
    },
  },
});
