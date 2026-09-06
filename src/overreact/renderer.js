import { createDom, updateDom } from "./dom.js";
import { toChildElements } from "./element.js";
import { DELETION, PLACEMENT, UPDATE, reconcileChildren } from "./reconcile.js";

let currentRoot = null;
let wipRoot = null;
let nextUnitOfWork = null;
let deletions = [];
let renderingFiber = null;
let workLoopScheduled = false;

export function render(element, container) {
    startRender({
        dom: container,
        props: { children: [element] },
        alternate: currentRoot,
    });
}

/** re-renders the committed tree from the root. called by hooks after a state change. */
export function scheduleUpdate() {
    if (!currentRoot) return;

    startRender({
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot,
    });
}

/** the fiber whose component function is running right now, or `null`. used by hooks. */
export function currentFiber() {
    return renderingFiber;
}

function startRender(root) {
    wipRoot = root;
    nextUnitOfWork = root;
    deletions = [];

    if (!workLoopScheduled) {
        workLoopScheduled = true;
        requestIdleCallback(workLoop);
    }
}

function workLoop(deadline) {
    while (nextUnitOfWork && deadline.timeRemaining() > 1) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    workLoopScheduled = nextUnitOfWork !== null || wipRoot !== null;
    if (workLoopScheduled) {
        requestIdleCallback(workLoop);
    }
}

/** renders one fiber and returns the next one: child first, then sibling, then back up. */
function performUnitOfWork(fiber) {
    if (typeof fiber.type === "function") {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    if (fiber.child) return fiber.child;

    for (let current = fiber; current; current = current.parent) {
        if (current.sibling) return current.sibling;
    }
    return null;
}

function updateFunctionComponent(fiber) {
    fiber.hooks = [];
    renderingFiber = fiber;
    const rendered = fiber.type(fiber.props);
    renderingFiber = null;

    reconcileChildren(fiber, toChildElements([rendered]), deletions);
}

function updateHostComponent(fiber) {
    fiber.dom ??= createDom(fiber);
    reconcileChildren(fiber, fiber.props.children, deletions);
}

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);

    const committed = wipRoot;
    currentRoot = committed;
    wipRoot = null;
    deletions = [];

    commitHooks(committed);
}

function commitWork(fiber) {
    if (!fiber) return;

    switch (fiber.effectTag) {
        case PLACEMENT:
            if (fiber.dom) findDomParent(fiber).insertBefore(fiber.dom, nextMountedDom(fiber));
            break;
        case UPDATE:
            if (fiber.dom) updateDom(fiber.dom, fiber.alternate.props, fiber.props);
            break;
        case DELETION:
            unmountSubtree(fiber);
            removeDom(fiber, findDomParent(fiber));
            return;
    }

    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

/** function components own no dom, so the parent node lives further up the tree. */
function findDomParent(fiber) {
    let parent = fiber.parent;
    while (!parent.dom) {
        parent = parent.parent;
    }
    return parent.dom;
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

function firstMountedDom(fiber) {
    if (fiber.effectTag === PLACEMENT) return null;
    if (fiber.dom) return fiber.dom;

    for (let child = fiber.child; child; child = child.sibling) {
        const dom = firstMountedDom(child);
        if (dom) return dom;
    }
    return null;
}

function commitHooks(fiber) {
    fiber.hooks?.forEach((hook) => hook.commit?.());

    for (let child = fiber.child; child; child = child.sibling) {
        commitHooks(child);
    }
}

function unmountSubtree(fiber) {
    fiber.hooks?.forEach((hook) => hook.unmount?.());

    for (let child = fiber.child; child; child = child.sibling) {
        unmountSubtree(child);
    }
}

function removeDom(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
        return;
    }

    for (let child = fiber.child; child; child = child.sibling) {
        removeDom(child, domParent);
    }
}
