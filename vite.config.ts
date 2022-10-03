/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    root: "./",
    build: { outDir: "./dist", sourcemap: true, target: "es2020" },
    optimizeDeps: {
        esbuildOptions: { target: "es2020", supported: { bigint: true } },
    },
    plugins: [
        // https://jotai.org/docs/guides/vite
        react(),
        checker({
            typescript: true,
            overlay: { initialIsOpen: false, position: "tl" },
            eslint:
                process.env.MODE === "test"
                    ? undefined
                    : {
                          lintCommand: "eslint -c .eslintrc.js './src/**/*.{js,jsx,ts,tsx}' --cache",
                      },
        }),
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: "/src",
            },
        ],
    },
    server: {
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
        },
    },
    test: {
        include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
        // includeSource: ["src/**/*.ts"],
        snapshotFormat: { indent: 4, escapeString: false },
    },
});
