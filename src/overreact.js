function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => (typeof child === "object" ? child : createTextElement(child))),
        },
    };
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
}

function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);

    updateDom(dom, {}, fiber.props);

    return dom;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isRemoved = (next) => (key) => !(key in next);

function updateDom(dom, prevProps, newProps) {
    // remove newly added or old event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter((key) => !(key in prevProps) || isNew(prevProps, newProps)(key))
        .forEach((prop) => {
            const eventType = prop.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[prop]);
        });

    // unset old props
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isRemoved(newProps))
        .forEach((prop) => (dom[prop] = ""));

    // set new props
    Object.keys(newProps)
        .filter(isProperty)
        .filter(isNew(prevProps, newProps))
        .forEach((prop) => (dom[prop] = newProps[prop]));

    // add event listeners for newly added ones
    Object.keys(newProps)
        .filter(isEvent)
        .filter(isNew(prevProps, newProps))
        .forEach((prop) => {
            const eventType = prop.toLowerCase().substring(2);
            dom.addEventListener(eventType, newProps[prop]);
        });
}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    const domParent = fiber.parent.dom;
    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    if (fiber.effectTag === "DELETION" && fiber.dom != null) {
        domParent.removeChild(fiber.dom);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    const children = fiber.props.children;
    reconcileChildren(fiber, children);

    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

function reconcileChildren(parentFiber, children) {
    let idx = 0;
    let oldFiber = parentFiber.alternate && parentFiber.alternate.child;
    let prevSibling = null;

    while (idx < children.length || oldFiber != null) {
        const child = children[idx];
        let newFiber = null;

        const sameType = oldFiber && child && child.type == oldFiber.type;

        if (sameType) {
            newFiber = {
                type: oldFiber.type,
                props: child.props,
                dom: oldFiber.dom,
                parent: parentFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            };
        }

        if (child && !sameType) {
            newFiber = {
                type: child.type,
                props: child.props,
                dom: null,
                parent: parentFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            };
        }

        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (idx === 0) {
            parentFiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        idx++;
    }
}

export { createElement, render };
