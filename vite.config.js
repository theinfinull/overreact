import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss()],
    esbuild: {
        include: /\.jsx$/,
        jsxFactory: "createElement",
        jsxInject: `import { createElement } from "/src/overreact";`,
    },
});
