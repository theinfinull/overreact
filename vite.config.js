import { defineConfig } from "vite";

export default defineConfig({
    // JSX compiles to `createElement(...)`, auto-imported into .jsx files only —
    // overreact's own .js sources must stay out of it, or they'd import themselves.
    esbuild: {
        include: /\.jsx$/,
        jsxFactory: "createElement",
        jsxInject: `import { createElement } from "/src/overreact";`,
    },
});
