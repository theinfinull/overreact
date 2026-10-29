// createElement
export function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
}

export function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children
                .flat(Infinity)
                .filter((child) => child != null && typeof child !== "boolean")
                .map((child) => (typeof child === "object" ? child : createTextElement(child))),
        },
    };
}

// render
let nextUnitOfWork = null;
let wipRoot = null;
let scheduled = false;

export function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
    };
    nextUnitOfWork = wipRoot;
    scheduleWork();
}

// createDom
function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);

    const isProperty = (key) => key !== "children";
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach((name) => {
            dom[name] = fiber.props[name];
        });

    return dom;
}

// safari has no requestIdleCallback, so fall back to setTimeout
const requestWork =
    typeof globalThis.requestIdleCallback === "function"
        ? (callback) => globalThis.requestIdleCallback(callback, { timeout: 100 })
        : (callback) =>
              setTimeout(() => {
                  const start = performance.now();
                  callback({
                      timeRemaining: () => Math.max(0, 5 - (performance.now() - start)),
                  });
              }, 0);

function scheduleWork() {
    if (!scheduled) {
        scheduled = true;
        requestWork(workLoop);
    }
}

function workLoop(deadline) {
    scheduled = false;

    // always perform at least one unit, even when the browser forces the callback via timeout
    let performed = false;
    while (nextUnitOfWork && (!performed || deadline.timeRemaining() > 1)) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        performed = true;
    }

    if (!nextUnitOfWork && wipRoot) commitRoot();
    if (nextUnitOfWork) scheduleWork();
}

// performUnitOfWork
function performUnitOfWork(fiber) {
    if (!fiber.dom) fiber.dom = createDom(fiber);

    let previous = null;
    fiber.props.children.forEach((element, index) => {
        const child = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        };
        if (index === 0) fiber.child = child;
        else previous.sibling = child;
        previous = child;
    });

    return nextFiber(fiber);
}

// nextFiber: child, then sibling, then parent's sibling
function nextFiber(fiber) {
    if (fiber.child) return fiber.child;
    for (let next = fiber; next; next = next.parent) {
        if (next.sibling) return next.sibling;
    }
    return null;
}

// commit
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
