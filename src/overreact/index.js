import { createElement, render } from "./core.js";
import { useState } from "./hooks.js";

export function useOverReact() {
    globalThis.overreact = { createElement, render, useState };
}

export { createElement, render, useState };
