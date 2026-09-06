import { defineConfig } from "vite";

export default defineConfig({
    // auto import overreact's createElement in .jsx files (overreact's .js are excluded)
    // point jsxFactory to use overreact's createElement for JSX parsing
    esbuild: {
        include: /\.jsx$/,
        jsxFactory: "createElement",
        jsxInject: `import { createElement } from "/src/overreact";`,
    },
});
