import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

/**
 * @fileoverview Vite configuration for CodeUniverse frontend.
 * Provides:
 * - React plugin integration
 * - Monaco editor support
 * - Dev server settings (host, port, HMR, proxy)
 * - Dependency optimization
 * - Build options
 *
 * @module vite.config
 */

export default defineConfig(({ mode }) => {
  return {
    // 🔹 Plugins
    plugins: [
      react(),
      monacoEditorPlugin.default({
        languageWorkers: ["editorWorkerService", "typescript", "json"], 
        globalAPI: true,
      }), 
    ],

    // 🔹 Base path 
    base: "/", 

    // 🔹 Development server
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: ["localhost", "app.local"],
      hmr: {
        protocol: "ws",
        host: "localhost",
        clientPort: 5173,
      },
      proxy:
        mode === "development"
          ? {
              "/api": {
                target: process.env.VITE_EXPRESS_URL,
                changeOrigin: true,
                secure: false,
              },
              "/socket.io": {
                target: process.env.VITE_SOCKET_URL,
                ws: true,
                changeOrigin: true,
              },
            }
          : undefined,
    },

    // 🔹 Dependency optimization
    optimizeDeps: {
      exclude: ["monaco-editor", "eslint4b"],
    },

    // 🔹 Build configuration
    build: {
      outDir: "dist", 
      rollupOptions: {
        output: {
          manualChunks: {
            monaco: ["monaco-editor"],
          },
        },
      },
    },
  };
});
