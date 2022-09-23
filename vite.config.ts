import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    root: "./",
    build: { outDir: "./dist", sourcemap: true },
    plugins: [
        // https://jotai.org/docs/guides/vite
        react(),
        checker({ typescript: true, overlay: { initialIsOpen: false, position: "tl" } }),
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
});
