import { createDom, updateDom } from "./dom.js";
import { toChildElements } from "./element.js";
import { DELETION, PLACEMENT, UPDATE, reconcileChildren } from "./reconcile.js";

// Rendering is spread over idle callbacks, so the work in flight has to
// outlive a single call: `currentRoot` is the tree on screen, `wipRoot` the one
// being built, and `nextUnitOfWork` the fiber to pick up next.
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

/** Re-renders the committed tree from the root. Called by hooks after a state change. */
export function scheduleUpdate() {
    if (!currentRoot) return;

    startRender({
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot,
    });
}

/** The fiber whose component function is running right now, or `null`. Used by hooks. */
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

    // Effects run during the commit may have scheduled another render. Stop
    // asking for idle time once there is nothing left to do.
    workLoopScheduled = nextUnitOfWork !== null || wipRoot !== null;
    if (workLoopScheduled) {
        requestIdleCallback(workLoop);
    }
}

/** Renders one fiber and returns the next one: child first, then sibling, then back up. */
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

    // Effects run last so they observe the committed DOM, and after the state
    // above is settled so an effect is free to schedule the next render.
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

/** Function components own no dom, so the parent node lives further up the tree. */
function findDomParent(fiber) {
    let parent = fiber.parent;
    while (!parent.dom) {
        parent = parent.parent;
    }
    return parent.dom;
}

/**
 * The node a freshly placed fiber has to be inserted in front of, so it lands
 * in tree order rather than at the end of its dom parent. Fibers that are
 * themselves being placed are skipped: they are not in the dom yet.
 * Returns `null` when nothing follows, which makes `insertBefore` append.
 */
function nextMountedDom(fiber) {
    for (let current = fiber; current; current = current.parent) {
        for (let sibling = current.sibling; sibling; sibling = sibling.sibling) {
            const dom = firstMountedDom(sibling);
            if (dom) return dom;
        }
        // Siblings of a function component share our dom parent, so keep
        // climbing until the parent owns a dom node.
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
