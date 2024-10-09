import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://slask-finder.tornberg.me/",
        changeOrigin: true,
      },
      "/cart": {
        target: "https://slask-finder.tornberg.me/",
        changeOrigin: true,
      },
      "/tracking": {
        target: "https://slask-finder.tornberg.me/",
        changeOrigin: true,
      },
      "/promotion": {
        target: "https://slask-finder.tornberg.me/",
        changeOrigin: true,
      },
      "/admin": {
        target: "https://slask-finder.tornberg.me/",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
