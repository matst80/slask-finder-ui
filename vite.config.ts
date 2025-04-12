import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = "https://slask-finder.knatofs.se/";
const localTarget = "http://localhost:8080/";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target,
        changeOrigin: true,
      },
      "/tracking": {
        target,
        changeOrigin: true,
      },
      "/track": {
        target,
        changeOrigin: true,
      },
      "/admin": {
        target,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
