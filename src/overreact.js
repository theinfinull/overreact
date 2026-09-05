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

    const isProperty = (key) => key !== "children";
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach((prop) => dom[prop] = fiber.props[prop]);

    return dom;
}

let nextUnitOfWork = null;
let wipRoot = null;

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
    };
    nextUnitOfWork = wipRoot;
}

function commitRoot() {
    commitWork(wipRoot.child);
    wipRoot = null;
}

function commitWork(processedFiber) {
    if (!processedFiber) {
        return;
    }
    processedFiber.parent.dom.appendChild(processedFiber.dom);
    commitWork(processedFiber.child);
    commitWork(processedFiber.sibling);
}

function workLoop(deadline) {
    // deadline is param passed by requestIdleCallback
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        // it runs for first time, then checks time remaining for upcoming iterations
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
    // 1. create dom
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    // 2. each children handle linking
    const children = fiber.props.children;
    reconcileChildren(fiber, children);

    // 3. return next task
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

function reconcileChildren(fiber, children) {
    let idx = 0;
    let prevSibling = null;
    while (idx < children.length) {
        const child = children[idx];
        const childFiber = {
            type: child.type,
            props: child.props,
            parent: fiber,
            dom: null,
        };

        if (idx === 0) {
            fiber.child = childFiber;
        } else {
            prevSibling.sibling = childFiber;
        }

        prevSibling = childFiber;
        idx++;
    }
}

export { createElement, render };
