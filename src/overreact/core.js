export const state = {
    nextUnitOfWork: null,
    wipRoot: null,
    currentRoot: null,
    deletions: null,
    wipFiber: null,
    hookIndex: null,
};

function createTextElement(text) {
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
            children: children.map((child) => (typeof child === "object" ? child : createTextElement(child))),
        },
    };
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isRemoved = (next) => (key) => !(key in next);

function updateDom(dom, prevProps, newProps) {
    Object.keys(prevProps)
        .filter(isEvent)
        .filter((key) => !(key in newProps) || isNew(prevProps, newProps)(key))
        .forEach((prop) => {
            const eventType = prop.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[prop]);
        });

    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isRemoved(newProps))
        .forEach((prop) => (dom[prop] = ""));

    Object.keys(newProps)
        .filter(isProperty)
        .filter(isNew(prevProps, newProps))
        .forEach((prop) => (dom[prop] = newProps[prop]));

    Object.keys(newProps)
        .filter(isEvent)
        .filter(isNew(prevProps, newProps))
        .forEach((prop) => {
            const eventType = prop.toLowerCase().substring(2);
            dom.addEventListener(eventType, newProps[prop]);
        });
}

function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);
    updateDom(dom, {}, fiber.props);
    return dom;
}

export function render(element, container) {
    state.wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: state.currentRoot,
    };
    state.deletions = [];
    state.nextUnitOfWork = state.wipRoot;
}

function commitRoot() {
    state.deletions.forEach(commitWork);
    commitWork(state.wipRoot.child);
    state.currentRoot = state.wipRoot;
    state.wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }

    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber, domParent);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}

function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

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

function updateFunctionComponent(fiber) {
    state.wipFiber = fiber;
    state.hookIndex = 0;
    state.wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    reconcileChildren(fiber, fiber.props.children);
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
            state.deletions.push(oldFiber);
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

function workLoop(deadline) {
    let shouldYield = false;
    while (state.nextUnitOfWork && !shouldYield) {
        state.nextUnitOfWork = performUnitOfWork(state.nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!state.nextUnitOfWork && state.wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
