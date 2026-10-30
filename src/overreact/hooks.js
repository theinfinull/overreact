import { currentFiber, scheduleUpdate } from "./renderer.js";

export function useState(initialState) {
    const previous = previousHook();
    const queue = previous?.queue ?? [];
    // snapshot: actions queued after this point stay queued for the next render
    const pending = queue.slice();
    let state = previous ? previous.state : typeof initialState === "function" ? initialState() : initialState;
    for (const action of pending) {
        state =
            typeof action === "function"
                ? action(state) // when passed a function i.e. setState((curr) => curr + 1);
                : action; // when passed a value i.e. setState(curr + 1);
    }
    const dispatch = previous?.dispatch ?? ((action) => {
        queue.push(action);
        scheduleUpdate();
    });
    const hook = {
        state,
        queue,
        dispatch,
        // only drop the applied actions once committed, so a restarted render can replay them
        commit: () => queue.splice(0, pending.length),
    };

    pushHook(hook);
    return [hook.state, hook.dispatch];
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
    // a missing deps array means "no opinion", so the effect runs every commit.
    if (!previousDeps || !nextDeps) return true;

    return previousDeps.length !== nextDeps.length || nextDeps.some((dep, index) => !Object.is(dep, previousDeps[index]));
}

/** hook recorded at this position on the previous render, if any. */
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
        throw new Error("hooks can only be called while a component is rendering.");
    }
    return fiber;
}
