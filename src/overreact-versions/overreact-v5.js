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

// flatten arrays, skip empty children, wrap text
function toChildElements(children) {
    return children
        .flat(Infinity)
        .filter((child) => child != null && typeof child !== "boolean")
        .map((child) => (typeof child === "object" ? child : createTextElement(child)));
}

export function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: toChildElements(children),
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
    startRender({
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    });
}

// scheduleUpdate: called by setState, re-renders the committed tree from the root
function scheduleUpdate() {
    if (!currentRoot) return;
    startRender({
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot,
    });
}

// startRender: a fresh work-in-progress root, replacing any unfinished one
function startRender(root) {
    wipRoot = root;
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

// performUnitOfWork: function components get called, host elements get a dom node
function performUnitOfWork(fiber) {
    if (typeof fiber.type === "function") {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    return nextFiber(fiber);
}

let renderingFiber = null;
let hookIndex = 0;

function updateFunctionComponent(fiber) {
    renderingFiber = fiber;
    hookIndex = 0;
    fiber.hooks = [];
    const result = fiber.type(fiber.props);
    renderingFiber = null;
    reconcileChildren(fiber, toChildElements([result]));
}

function updateHostComponent(fiber) {
    if (!fiber.dom) fiber.dom = createDom(fiber);
    reconcileChildren(fiber, fiber.props.children);
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
    const committed = wipRoot;
    currentRoot = committed;
    wipRoot = null;
    deletions = [];

    // after wipRoot is cleared, so an effect calling setState can start a new render
    visitHooks(committed, "commit");
}

function commitWork(fiber) {
    if (!fiber) return;
    const parentDom = findDomParent(fiber);

    if (fiber.effectTag === "DELETION") {
        visitHooks(fiber, "unmount");
        commitDeletion(fiber, parentDom);
        return; // don't wander into the old fiber's siblings
    }
    // only insert/update fibers that actually have a dom node
    if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
        parentDom.insertBefore(fiber.dom, nextMountedDom(fiber));
    } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

// findDomParent: function components have no dom, so walk up until one does
function findDomParent(fiber) {
    let parent = fiber.parent;
    while (!parent.dom) parent = parent.parent;
    return parent.dom;
}

// commitDeletion: walk down to the dom nodes, a component may own several
function commitDeletion(fiber, parentDom) {
    if (fiber.dom) {
        parentDom.removeChild(fiber.dom);
        return;
    }
    for (let child = fiber.child; child; child = child.sibling) {
        commitDeletion(child, parentDom);
    }
}

// nextMountedDom: the first dom node after this fiber that's already on the page, or null to append.
// looks inside dom-less siblings, and past a dom-less parent to its siblings
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

// firstMountedDom: the first dom node under a fiber, skipping subtrees that are still being placed
function firstMountedDom(fiber) {
    if (fiber.effectTag === "PLACEMENT") return null;
    if (fiber.dom) return fiber.dom;
    for (let child = fiber.child; child; child = child.sibling) {
        const dom = firstMountedDom(child);
        if (dom) return dom;
    }
    return null;
}

// visitHooks: run a hook callback ("commit" or "unmount") for every hook in a subtree
function visitHooks(fiber, callback) {
    fiber.hooks?.forEach((hook) => hook[callback]?.());
    for (let child = fiber.child; child; child = child.sibling) {
        visitHooks(child, callback);
    }
}

// useState
export function useState(initialState) {
    if (!renderingFiber) throw new Error("useState needs a rendering component");
    const oldHook = renderingFiber.alternate?.hooks?.[hookIndex];
    const queue = oldHook?.queue ?? [];
    let state = oldHook ? oldHook.state : typeof initialState === "function" ? initialState() : initialState;
    const processed = queue.length;

    for (const action of queue.slice(0, processed)) {
        state = typeof action === "function" ? action(state) : action;
    }

    const setState =
        oldHook?.dispatch ??
        ((action) => {
            queue.push(action);
            scheduleUpdate();
        });
    const hook = {
        state,
        queue,
        dispatch: setState,
        // only drop the processed actions once committed, so a restarted render can replay them
        commit: () => queue.splice(0, processed),
    };
    renderingFiber.hooks.push(hook);
    hookIndex++;
    return [state, setState];
}

// useEffect
export function useEffect(effect, deps) {
    if (!renderingFiber) throw new Error("useEffect needs a rendering component");
    const oldHook = renderingFiber.alternate?.hooks?.[hookIndex];
    const hook = { deps, cleanup: oldHook?.cleanup };

    if (depsChanged(oldHook?.deps, deps)) {
        hook.commit = () => {
            runCleanup(hook);
            const cleanup = effect();
            hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
        };
    }
    hook.unmount = () => runCleanup(hook);

    renderingFiber.hooks.push(hook);
    hookIndex++;
}

function runCleanup(hook) {
    hook.cleanup?.();
    hook.cleanup = undefined;
}

// no deps array (or no previous render) means run every commit
function depsChanged(oldDeps, deps) {
    if (!oldDeps || !deps) return true;
    return oldDeps.length !== deps.length || deps.some((dep, i) => !Object.is(dep, oldDeps[i]));
}
