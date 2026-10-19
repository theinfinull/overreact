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

let currentRoot = null;
let deletions = [];

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
    if (typeof fiber.type === "function") {
        const result = fiber.type(fiber.props);
        reconcileChildren(fiber, toChildElements([result]));
    } else {
        if (!fiber.dom) fiber.dom = createDom(fiber);
        reconcileChildren(fiber, fiber.props.children);
    }
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
}

function commitWork(fiber) {
    if (!fiber) return;
    const parentDom = findDomParent(fiber);
    if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber, parentDom);
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

function findDomParent(fiber) {
    let parent = fiber.parent;
    while (!parent.dom) parent = parent.parent;
    return parent.dom;
}

function commitDeletion(fiber, parentDom) {
    if (fiber.dom) parentDom.removeChild(fiber.dom);
    else for (let child = fiber.child; child; child = child.sibling) commitDeletion(child, parentDom);
}
