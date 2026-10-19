import { defineConfig } from "vite";

export default defineConfig({
    esbuild: {
        include: /\.jsx$/,
        jsx: "transform",
        jsxFactory: "createElement",
    },
});
