import { state } from "./core.js";

export function useState(initial) {
    const oldHook =
        state.wipFiber.alternate && state.wipFiber.alternate.hooks && state.wipFiber.alternate.hooks[state.hookIndex];
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [],
    };

    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
        hook.state = action(hook.state);
    });

    const setState = (action) => {
        hook.queue.push(action);
        state.wipRoot = {
            dom: state.currentRoot.dom,
            props: state.currentRoot.props,
            alternate: state.currentRoot,
        };
        state.nextUnitOfWork = state.wipRoot;
        state.deletions = [];
    };

    state.wipFiber.hooks.push(hook);
    state.hookIndex++;
    return [hook.state, setState];
}

function depsChanged(prev, next) {
    if (!prev || !next) return true;
    if (prev.length !== next.length) return true;
    return prev.some((dep, i) => dep !== next[i]);
}

export function useEffect(effect, deps) {
    const oldHook =
        state.wipFiber.alternate && state.wipFiber.alternate.hooks && state.wipFiber.alternate.hooks[state.hookIndex];

    const hook = {
        tag: "effect",
        effect,
        deps,
        cleanup: oldHook ? oldHook.cleanup : undefined,
        changed: depsChanged(oldHook && oldHook.deps, deps),
    };

    state.wipFiber.hooks.push(hook);
    state.hookIndex++;
}
