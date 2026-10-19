// Generate independent chapter snapshots and downloadable projects from the
// same teaching source. Run before Vite so the article can import their source.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const examples = `${root}src/overreact-examples`;
const output = `${root}public/examples`;
const elements = `export function toChildElements(children) {
    return children.flat(Infinity)
        .filter(child => child != null && typeof child !== "boolean")
        .map(child => typeof child === "object" ? child : {
            type: "TEXT_ELEMENT",
            props: { nodeValue: child, children: [] },
        });
}

export function createElement(type, props, ...children) {
    return { type, props: { ...props, children: toChildElements(children) } };
}
`;

const scheduling = `
let nextUnitOfWork = null;
let wipRoot = null;
let scheduled = false;

const requestWork = typeof globalThis.requestIdleCallback === "function"
    ? callback => globalThis.requestIdleCallback(callback, { timeout: 100 })
    : callback => setTimeout(() => {
        const start = performance.now();
        callback({ timeRemaining: () => Math.max(0, 5 - (performance.now() - start)) });
    }, 0);

function scheduleWork() {
    if (!scheduled) {
        scheduled = true;
        requestWork(workLoop);
    }
}

function workLoop(deadline) {
    scheduled = false;
    // Always perform at least one unit, including callbacks forced by timeout.
    let performed = false;
    while (nextUnitOfWork && (!performed || deadline.timeRemaining() > 1)) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        performed = true;
    }
    if (!nextUnitOfWork && wipRoot) commitRoot();
    if (nextUnitOfWork) scheduleWork();
}

function nextFiber(fiber) {
    if (fiber.child) return fiber.child;
    for (let next = fiber; next; next = next.parent) {
        if (next.sibling) return next.sibling;
    }
    return null;
}
`;

const simpleDom = `
function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("") : document.createElement(fiber.type);
    Object.keys(fiber.props).filter(key => key !== "children")
        .forEach(key => { dom[key] = fiber.props[key]; });
    return dom;
}
`;

const diffDom = `
const isEvent = name => name.startsWith("on");
const isProperty = name => name !== "children" && !isEvent(name);
const eventType = name => name.slice(2).toLowerCase();

function updateDom(dom, previous, next) {
    Object.keys(previous).filter(isEvent).forEach(name => {
        if (previous[name] !== next[name]) dom.removeEventListener(eventType(name), previous[name]);
    });
    Object.keys(previous).filter(isProperty).forEach(name => {
        if (!(name in next)) dom[name] = "";
    });
    Object.keys(next).filter(isProperty).forEach(name => {
        if (previous[name] !== next[name]) dom[name] = next[name];
    });
    Object.keys(next).filter(isEvent).forEach(name => {
        if (previous[name] !== next[name]) dom.addEventListener(eventType(name), next[name]);
    });
}

function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("") : document.createElement(fiber.type);
    updateDom(dom, {}, fiber.props);
    return dom;
}
`;

function library(part) {
    if (part === 2) return elements + scheduling + simpleDom + `
export function render(element, container) {
    wipRoot = { dom: container, props: { children: [element] } };
    nextUnitOfWork = wipRoot;
    scheduleWork();
}

function performUnitOfWork(fiber) {
    if (!fiber.dom) fiber.dom = createDom(fiber);
    let previous = null;
    fiber.props.children.forEach((element, index) => {
        const child = { type: element.type, props: element.props, parent: fiber, dom: null };
        if (index === 0) fiber.child = child;
        else previous.sibling = child;
        previous = child;
    });
    return nextFiber(fiber);
}

function commitRoot() {
    commitWork(wipRoot.child);
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) return;
    fiber.parent.dom.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}
`;
    return elements + scheduling + diffDom + `
let currentRoot = null;
let deletions = [];
${part === 5 ? "let renderingFiber = null;\nlet hookIndex = 0;\n" : ""}
export function render(element, container) {
    startRender({ dom: container, props: { children: [element] }, alternate: currentRoot });
}

function startRender(root) {
    wipRoot = root;
    deletions = [];
    nextUnitOfWork = root;
    scheduleWork();
}

function performUnitOfWork(fiber) {
${part >= 4 ? `    if (typeof fiber.type === "function") {
${part === 5 ? "        renderingFiber = fiber;\n        hookIndex = 0;\n        fiber.hooks = [];\n" : ""}        const result = fiber.type(fiber.props);
${part === 5 ? "        renderingFiber = null;\n" : ""}        reconcileChildren(fiber, toChildElements([result]));
    } else {
        if (!fiber.dom) fiber.dom = createDom(fiber);
        reconcileChildren(fiber, fiber.props.children);
    }` : `    if (!fiber.dom) fiber.dom = createDom(fiber);
    reconcileChildren(fiber, fiber.props.children);`}
    return nextFiber(fiber);
}

// Positional matching: keyed list moves are intentionally outside these snapshots.
function reconcileChildren(parent, elements) {
    let oldFiber = parent.alternate?.child;
    let previousSibling = null;
    let index = 0;
    while (index < elements.length || oldFiber) {
        const element = elements[index];
        const sameType = oldFiber && element && oldFiber.type === element.type;
        let newFiber = null;
        if (sameType) {
            newFiber = { type: oldFiber.type, props: element.props, dom: oldFiber.dom,
                parent, alternate: oldFiber, effectTag: "UPDATE" };
        } else if (element) {
            newFiber = { type: element.type, props: element.props, dom: null,
                parent, alternate: null, effectTag: "PLACEMENT" };
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }
        if (newFiber) {
            if (!previousSibling) parent.child = newFiber;
            else previousSibling.sibling = newFiber;
            previousSibling = newFiber;
        }
        oldFiber = oldFiber?.sibling;
        index++;
    }
}

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    const committed = wipRoot;
    currentRoot = committed;
    wipRoot = null;
    deletions = [];
${part === 5 ? "    visitHooks(committed, \"commit\");\n" : ""}}

function commitWork(fiber) {
    if (!fiber) return;
    const parentDom = ${part >= 4 ? "findDomParent(fiber)" : "fiber.parent.dom"};
    if (fiber.effectTag === "DELETION") {
${part === 5 ? "        visitHooks(fiber, \"unmount\");\n" : ""}        ${part >= 4 ? "commitDeletion(fiber, parentDom)" : "parentDom.removeChild(fiber.dom)"};
        return;
    }
    if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
        parentDom.insertBefore(fiber.dom, nextMountedDom(fiber));
    } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

// Find an existing host node under a sibling, skipping newly placed subtrees.
function firstMountedDom(fiber) {
    if (fiber.effectTag === "PLACEMENT") return null;
    if (fiber.dom) return fiber.dom;
    for (let child = fiber.child; child; child = child.sibling) {
        const dom = firstMountedDom(child);
        if (dom) return dom;
    }
    return null;
}

function nextMountedDom(fiber) {
    for (let current = fiber; current; current = current.parent) {
        for (let sibling = current.sibling; sibling; sibling = sibling.sibling) {
            const dom = firstMountedDom(sibling);
            if (dom) return dom;
        }
        if (current.parent?.dom) break;
    }
    return null;
}
${part >= 4 ? `
function findDomParent(fiber) {
    let parent = fiber.parent;
    while (!parent.dom) parent = parent.parent;
    return parent.dom;
}

function commitDeletion(fiber, parentDom) {
    if (fiber.dom) parentDom.removeChild(fiber.dom);
    else for (let child = fiber.child; child; child = child.sibling) commitDeletion(child, parentDom);
}
` : ""}${part === 5 ? `
function scheduleUpdate() {
    if (currentRoot) startRender({ dom: currentRoot.dom, props: currentRoot.props, alternate: currentRoot });
}

export function useState(initialState) {
    if (!renderingFiber) throw new Error("useState needs a rendering component");
    const oldHook = renderingFiber.alternate?.hooks?.[hookIndex];
    const queue = oldHook?.queue ?? [];
    let state = oldHook ? oldHook.state
        : typeof initialState === "function" ? initialState() : initialState;
    const processed = queue.length;
    for (const action of queue.slice(0, processed)) {
        state = typeof action === "function" ? action(state) : action;
    }
    const setState = oldHook?.dispatch ?? (action => {
        queue.push(action);
        scheduleUpdate();
    });
    const hook = { state, queue, dispatch: setState, commit: () => queue.splice(0, processed) };
    renderingFiber.hooks.push(hook);
    hookIndex++;
    return [state, setState];
}

export function useEffect(effect, deps) {
    if (!renderingFiber) throw new Error("useEffect needs a rendering component");
    const previous = renderingFiber.alternate?.hooks?.[hookIndex];
    const changed = !previous || !deps || !previous.deps
        || deps.length !== previous.deps.length
        || deps.some((dep, i) => !Object.is(dep, previous.deps[i]));
    const hook = { deps, cleanup: previous?.cleanup };
    if (changed) hook.commit = () => {
        hook.cleanup?.();
        const cleanup = effect();
        hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
    };
    hook.unmount = () => hook.cleanup?.();
    renderingFiber.hooks.push(hook);
    hookIndex++;
}

function visitHooks(fiber, operation) {
    fiber.hooks?.forEach(hook => hook[operation]?.());
    for (let child = fiber.child; child; child = child.sibling) visitHooks(child, operation);
}
` : ""}`;
}

const demos = {
    2: `import { createElement, render } from "./overreact.js";
import "./styles.css";

const items = Array.from({ length: 300 }, (_, i) => <li>Fiber {i + 1}</li>);
render(<main><h1>One tree, prepared in pieces.</h1>
    <p>Nodes are attached only after all the work is ready.</p>
    <ul>{items}</ul></main>, document.getElementById("root"));
`,
    3: `import { createElement, render } from "./overreact.js";
import "./styles.css";

const container = document.getElementById("root");
let updated = false;
function draw() {
    render(<main>
        <h1>{updated ? "Hey again!" : "Hello!"}</h1>
        <p>Type below, then update. The input node is reused.</p>
        <input placeholder="Keep my text" />
        <button onClick={() => { updated = !updated; draw(); }}>Update the tree</button>
        {updated && <p>I'm a newly placed child.</p>}
        <footer>This sibling stays after the new child.</footer>
    </main>, container);
}
draw();
`,
    4: `import { createElement, render } from "./overreact.js";
import "./styles.css";

const container = document.getElementById("root");
let show = true;
function Greeting({ name }) { return <h2>Hey, {name}!</h2>; }
function Pair() { return [<Greeting name="Byte" />, <Greeting name="you" />]; }
function App() {
    return <main><h1>Functions, all the way down.</h1>
        <button onClick={() => { show = !show; draw(); }}>Show / hide the greetings</button>
        {show && <Pair />}
        <footer>No wrapper DOM needed for Pair.</footer>
    </main>;
}
function draw() { render(<App />, container); }
draw();
`,
    5: `import { createElement, render, useState, useEffect } from "./overreact.js";
import "./styles.css";

function Byte() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState("Byte");
    useEffect(() => {
        const previousTitle = document.title;
        document.title = count + " presses — Overreact";
        return () => { document.title = previousTitle; };
    }, [count]);
    return <section>
        <label>Name <input value={name} onInput={e => setName(e.target.value)} /></label>
        <button className="creature" onClick={() => setCount(n => n + 1)}>
            <span>• ᴗ •</span>{count === 0 ? "Press me!" : count % 2 ? "Ouch!" : "Hey!"}
        </button>
        <p>{name}: {count} presses</p>
        <button onClick={() => { setCount(n => n + 1); setCount(n => n + 1); setCount(n => n + 1); }}>+3 queued</button>
        <button onClick={() => setCount(0)}>Reset count</button>
    </section>;
}
function App() {
    const [show, setShow] = useState(true);
    return <main><h1>A creature with a memory.</h1>
        <button onClick={() => setShow(s => !s)}>Mount / unmount Byte</button>
        {show && <Byte />}
        <footer>Unmounting resets Byte's state and cleans up its title effect.</footer>
    </main>;
}
render(<App />, document.getElementById("root"));
`,
};

const css = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
* { box-sizing: border-box; }
body { margin: 0; padding: 40px 20px; background: #faf8ff; color: #11110f; font-family: 'Space Grotesk', sans-serif; }
main { max-width: 640px; margin: auto; }
h1 { font-size: clamp(2rem, 6vw, 3.5rem); line-height: 1.1; }
input, button { font: inherit; border-radius: 12px; padding: 12px 16px; margin: 8px 8px 8px 0; }
input { border: 1px solid #c4b5fd; background: white; max-width: 100%; }
button { cursor: pointer; border: 0; background: #7c3aed; color: white; }
button:focus-visible, input:focus-visible { outline: 2px solid #7c3aed; outline-offset: 4px; }
section { margin: 24px 0; padding: 24px; border: 1px solid #ddd6fe; border-radius: 20px; background: #ede9fe; }
label { display: block; }
.creature { display: flex; flex-direction: column; min-width: 150px; min-height: 150px; align-items: center; justify-content: center; background: #c4b5fd; color: #11110f; border: 2px solid; box-shadow: 4px 5px #11110f; }
.creature span { display: block; font-size: 40px; }
footer { margin-top: 24px; color: #666; line-height: 1.6; }
li { padding: 8px; }
`;

await mkdir(output, { recursive: true });
for (let part = 2; part <= 5; part++) {
    const directory = `${examples}/part${part}`;
    await mkdir(`${directory}/src`, { recursive: true });
    const files = {
        "src/overreact.js": library(part),
        "src/main.jsx": demos[part],
        "src/styles.css": css,
        "package.json": JSON.stringify({ name: `overreact-chap${part}`, version: "1.0.0", private: true, type: "module",
            scripts: { dev: "vite", start: "vite", build: "vite build", preview: "vite preview" },
            devDependencies: { vite: "^7.1.5" } }, null, 2) + "\n",
        "vite.config.js": `import { defineConfig } from "vite";\nexport default defineConfig({ esbuild: { jsxFactory: "createElement" } });\n`,
        "index.html": `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Overreact — Chapter ${part}</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n`,
    };
    for (const [name, content] of Object.entries(files)) await writeFile(`${directory}/${name}`, content);
}

// Part One is the original reader-supplied project; include its assets as well.
for (let part = 1; part <= 5; part++) {
    const directory = `${examples}/part${part}`;
    const archive = `${output}/part${part}.zip`;
    // Reset existing archives so removed files cannot linger in a new download.
    await rm(archive, { force: true });
    execFileSync("zip", ["-q", "-r", archive, "src", "package.json", "vite.config.js", "index.html",
        ...(part === 1 ? ["public"] : [])], { cwd: directory });
}
console.log("Generated chapter 2–5 projects and chapter 1–5 source downloads.");
