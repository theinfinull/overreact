import { currentFiber, scheduleUpdate } from "./renderer.js";

export function useState(initialState) {
    const previous = previousHook();
    const hook = {
        state: previous ? previous.state : initialState,
        queue: [],
    };

    for (const action of previous?.queue ?? []) {
        hook.state = typeof action === "function" ? action(hook.state) : action;
    }

    const setState = (action) => {
        hook.queue.push(action);
        scheduleUpdate();
    };

    pushHook(hook);
    return [hook.state, setState];
}

export function useEffect(effect, deps) {
    const previous = previousHook();
    const hook = {
        deps,
        cleanup: previous?.cleanup ?? null,
        unmount: () => runCleanup(hook),
    };

    if (depsChanged(previous?.deps, deps)) {
        hook.commit = () => {
            runCleanup(hook);
            const cleanup = effect();
            hook.cleanup = typeof cleanup === "function" ? cleanup : null;
        };
    }

    pushHook(hook);
}

function runCleanup(hook) {
    hook.cleanup?.();
    hook.cleanup = null;
}

function depsChanged(previousDeps, nextDeps) {
    // A missing deps array means "no opinion", so the effect runs every commit.
    if (!previousDeps || !nextDeps) return true;

    return previousDeps.length !== nextDeps.length || nextDeps.some((dep, index) => dep !== previousDeps[index]);
}

/** The hook recorded at this position on the previous render, if any. */
function previousHook() {
    const fiber = renderingFiber();
    return fiber.alternate?.hooks?.[fiber.hooks.length] ?? null;
}

function pushHook(hook) {
    renderingFiber().hooks.push(hook);
}

function renderingFiber() {
    const fiber = currentFiber();
    if (!fiber) {
        throw new Error("Hooks can only be called while a component is rendering.");
    }
    return fiber;
}
