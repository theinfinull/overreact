import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss()],
    esbuild: {
        include: /\.jsx$/,
        jsxFactory: "createElement",
        jsxFragment: "Fragment",
        jsxInject: `import { createElement, Fragment } from "/src/overreact";`,
    },
});
