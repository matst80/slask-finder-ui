import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
//import { analyzer } from "vite-bundle-analyzer";
const target = "https://s10n-no.tornberg.me/";
//const cartTarget = "https://slask-finder.knatofs.se/";
const localTarget = "http://localhost:8080/";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  server: {
    proxy: {
      "/api": {
        target, //: localTarget,
        changeOrigin: true,
      },
      "/location": {
        target, //: localTarget,
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
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Slask Finder",
        short_name: "SlaskFinder",
        description: "Find and compare products easily with Slask Finder",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/icons/app-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,txt}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/slask-finder\.tornberg\.me\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ], //, analyzer()
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
