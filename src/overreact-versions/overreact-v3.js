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
let currentRoot = null;
let deletions = [];
let scheduled = false;

export function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
    scheduleWork();
}

// createDom
function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);
    updateDom(dom, {}, fiber.props);
    return dom;
}

// updateDom
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const eventType = (key) => key.slice(2).toLowerCase();

function updateDom(dom, previous, next) {
    // remove changed listeners before adding new ones, or both would fire
    Object.keys(previous)
        .filter(isEvent)
        .filter((key) => previous[key] !== next[key])
        .forEach((key) => dom.removeEventListener(eventType(key), previous[key]));

    // clear removed props
    Object.keys(previous)
        .filter(isProperty)
        .filter((key) => !(key in next))
        .forEach((key) => {
            dom[key] = "";
        });

    // assign changed props
    Object.keys(next)
        .filter(isProperty)
        .filter((key) => previous[key] !== next[key])
        .forEach((key) => {
            dom[key] = next[key];
        });

    // add changed listeners
    Object.keys(next)
        .filter(isEvent)
        .filter((key) => previous[key] !== next[key])
        .forEach((key) => dom.addEventListener(eventType(key), next[key]));
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
    reconcileChildren(fiber, fiber.props.children);
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

// reconcileChildren: match children by position against the previous tree
function reconcileChildren(parent, elements) {
    let oldFiber = parent.alternate?.child;
    let previousSibling = null;
    let index = 0;

    // keep going after the elements run out, so leftover old fibers get deleted
    while (index < elements.length || oldFiber) {
        const element = elements[index];
        const sameType = oldFiber && element && oldFiber.type === element.type;
        let newFiber = null;

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent,
                alternate: oldFiber,
                effectTag: "UPDATE",
            };
        } else if (element) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent,
                alternate: null,
                effectTag: "PLACEMENT",
            };
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

// commit
function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
    deletions = [];
}

function commitWork(fiber) {
    if (!fiber) return;
    const parentDom = fiber.parent.dom;

    if (fiber.effectTag === "DELETION") {
        parentDom.removeChild(fiber.dom);
        return; // don't wander into the old fiber's siblings
    }
    if (fiber.effectTag === "PLACEMENT") {
        parentDom.insertBefore(fiber.dom, nextMountedDom(fiber));
    } else if (fiber.effectTag === "UPDATE") {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

// nextMountedDom: the first later sibling already on the page, or null to append
function nextMountedDom(fiber) {
    for (let sibling = fiber.sibling; sibling; sibling = sibling.sibling) {
        if (sibling.effectTag !== "PLACEMENT") return sibling.dom;
    }
    return null;
}
