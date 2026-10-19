export function toChildElements(children) {
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

function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("") : document.createElement(fiber.type);
    Object.keys(fiber.props).filter(key => key !== "children")
        .forEach(key => { dom[key] = fiber.props[key]; });
    return dom;
}

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
