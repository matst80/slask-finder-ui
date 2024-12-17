import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://slask-finder.knatofs.se/",
        changeOrigin: true,
      },
      "/tracking": {
        target: "https://slask-finder.knatofs.se",
        changeOrigin: true,
      },
      "/track": {
        target: "https://slask-finder.knatofs.se",
        changeOrigin: true,
      },
      "/admin": {
        target: "https://slask-finder.knatofs.se",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
