import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
//import { analyzer } from "vite-bundle-analyzer";
const target = "https://slask-finder.tornberg.me/";
//const cartTarget = "https://slask-finder.knatofs.se/";
// const localTarget = "http://localhost:8080/";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  server: {
    proxy: {
      "/api": {
        target,
        changeOrigin: true,
      },
      "/cart": {
        target,
        changeOrigin: true,
      },
      "/checkout": {
        target,
        changeOrigin: true,
      },
      "/confirmation": {
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
  plugins: [react()], //, analyzer()
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Split vendor libraries
          }
          if (id.includes("src/components/")) {
            return "components"; // Split components into their own chunk
          }
        },
      },
    },
  },
});
