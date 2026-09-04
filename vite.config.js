import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    esbuild: {
        jsx: "transform",
        jsxFactory: "overreact.createElement",
    },
});
