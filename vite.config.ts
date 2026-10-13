import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build` → normal multi-file build in dist/ (for Vercel / Netlify / GitHub Pages)
// `npm run build:single` → one self-contained HTML file in dist-single/ (for previews)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === "single" ? [viteSingleFile()] : [])],
  base: process.env.VITE_BASE ?? "/",
  build:
    mode === "single"
      ? { outDir: "dist-single" }
      : { outDir: "dist", rollupOptions: { output: { manualChunks: { charts: ["recharts"] } } }, chunkSizeWarningLimit: 600 },
}));
