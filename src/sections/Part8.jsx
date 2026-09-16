import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const useStateCode = `let renderingFiber = null;

export function useState(initialState) {
    const previous = renderingFiber.alternate?.hooks?.[renderingFiber.hooks.length] ?? null;

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

    renderingFiber.hooks.push(hook);
    return [hook.state, setState];
}`;

const useEffectCode = `export function useEffect(effect, deps) {
    const previous = renderingFiber.alternate?.hooks?.[renderingFiber.hooks.length] ?? null;
    const hook = {
        deps,
        cleanup: previous?.cleanup ?? null,
    };

    const depsChanged =
        !previous?.deps ||
        deps?.some((dep, i) => dep !== previous.deps[i]) ??
        true;

    if (depsChanged) {
        hook.commit = () => {
            hook.cleanup?.();
            const cleanup = effect();
            hook.cleanup = typeof cleanup === "function" ? cleanup : null;
        };
    }

    renderingFiber.hooks.push(hook);
}`;

export default function Part8() {
    return (
        <PartSection
            id="part-8"
            partNumber={8}
            paperLabel="Method — Part 8"
            title="Your state lives in an array, sorted by arrival"
            subtitle="useState, useEffect, and why the rules exist"
            currentPart={8}
        >
            <p className="text-xl text-light2 leading-relaxed mb-8">
                A function that returns and forgets everything — how does it remember a counter?
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                Every local variable in your component is destroyed the moment it returns. So the counter is not in
                your component. The counter is in an array on a fiber, at the index your{" "}
                <code className="font-mono text-accent text-sm">useState</code> call happened to be at.
            </p>

            <p className="text-light font-semibold text-lg mb-8">
                That sentence is the entire rules of hooks.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">useState</h2>

            <p className="text-light2 leading-relaxed mb-4">
                State can't live in the function, so it lives on the fiber. Each fiber gets a{" "}
                <code className="font-mono text-accent text-sm">hooks</code> array. Every time a hook is called
                during a component's render, it reads from its counterpart in the previous render by looking at the
                array at the same index, and then pushes a new entry.
            </p>

            <CodeBlock code={useStateCode} language="js" filename="hooks.js" />

            <h2 className="text-2xl font-semibold text-light mt-12 mb-4">The rules, derived</h2>

            <p className="text-light2 leading-relaxed mb-4">
                Hooks are matched between renders by call order and nothing else. There is no name, no key, no
                identity — just position in an array.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                Call a hook inside a condition and on the next render, the condition might not match. The first
                hook runs. The second hook doesn't. Now index 1 in the new array corresponds to what was index 2 in
                the old array. One piece of state silently reads another's value.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                Hooks in loops have the same problem. Changing the number of loop iterations shifts every index
                after the change.
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                This isn't fundamental — you could identify hooks by names or symbols. React chose order for
                ergonomics: the compact{" "}
                <code className="font-mono text-accent text-sm">const [x, setX] = useState()</code> syntax requires
                no additional ceremony. The rules of hooks are the price of that convenience.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-10 mb-4">Batching</h2>

            <p className="text-light2 leading-relaxed mb-4">
                <code className="font-mono text-accent text-sm">setState</code> doesn't render. It pushes an action
                onto the hook's queue and schedules work. Three{" "}
                <code className="font-mono text-accent text-sm">setState</code> calls in one event handler push three
                actions and schedule one render. The render drains all three queued actions in order.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                The functional updater form{" "}
                <code className="font-mono text-accent text-sm">setState(curr ={">"} curr + 1)</code> composes
                correctly: each action runs against the output of the previous one. The direct form{" "}
                <code className="font-mono text-accent text-sm">setState(curr + 1)</code> captures{" "}
                <code className="font-mono text-accent text-sm">curr</code> from the closure — three calls in the
                same event all compute the same next state.
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                React 18 extended batching to async contexts — setTimeout, fetch callbacks, and promises. Before
                that, each <code className="font-mono text-accent text-sm">setState</code> in an async callback
                triggered a synchronous render of its own.
            </p>

            <div className="border-l-2 border-dark3 pl-6 my-6">
                <p className="text-light3 text-sm leading-relaxed">
                    <strong className="text-light2">Stale closures.</strong>{" "}
                    <code className="font-mono text-xs text-accent">state</code> inside an effect or callback is the
                    value from that specific render. It won't update when state changes. That's closures working as
                    designed. The fix is the functional updater form, or a ref.
                </p>
            </div>

            <h2 className="text-2xl font-semibold text-light mt-10 mb-4">useEffect</h2>

            <CodeBlock code={useEffectCode} language="js" filename="hooks.js" />

            <p className="text-light2 leading-relaxed mt-6 mb-4">
                <strong className="text-light">Why effects run after commit.</strong> The render phase can be
                discarded. An effect that fires during a discarded render would subscribe to something and never
                clean up. Effects are queued during render and invoked only after a successful commit — when the
                render is guaranteed to have produced real DOM changes.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                <strong className="text-light">Cleanup.</strong> The effect's return value is the cleanup function.
                Before re-running an effect, run the previous cleanup. On unmount, run cleanup once more. The order
                matters: the previous cleanup fires before the new effect runs. Skipping cleanup on unmount is how
                you get dangling subscriptions.
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                <strong className="text-light">Timing.</strong> The implementation above runs effects synchronously
                after commit — which is{" "}
                <code className="font-mono text-accent text-sm">useLayoutEffect</code> behavior. Real React defers
                passive effects until after the browser paints. That's why{" "}
                <code className="font-mono text-accent text-sm">useLayoutEffect</code> can measure DOM geometry
                without flickering (it runs before paint), and why it blocks paint if it's slow (it runs before
                paint).
            </p>

            <div className="mt-10 p-6 rounded-lg border border-dark2 bg-dark2/30">
                <h3 className="text-lg font-semibold text-light mb-2">Where this breaks</h3>
                <p className="text-light2 leading-relaxed">
                    Call <code className="font-mono text-accent text-sm">useState</code> conditionally — put it in
                    an <code className="font-mono text-accent text-sm">if</code> block. On the first render, the
                    hooks array has two entries. On the second render, one. Index 1 reads index 0's value. The wrong
                    state renders. React's error message is good. Ours will be mysterious.
                </p>
            </div>

            <Collapsible summary="Real React — fiber.memoizedState" variant="footnote">
                <p className="text-light3 leading-relaxed text-sm">
                    React doesn't use an array. It uses a linked list — each hook is a node with a{" "}
                    <code className="font-mono text-xs">next</code> pointer. The current hook during render is
                    tracked via a dispatcher object that swaps between mount and update implementations
                    (HooksDispatcherOnMount vs HooksDispatcherOnUpdate). This is how React can distinguish a first
                    call from a subsequent call without tracking call count externally.{" "}
                    <code className="font-mono text-xs">useRef</code> is a hook whose state is a fixed object{" "}
                    <code className="font-mono text-xs">{"{ current: initialValue }"}</code> — never replaced, just
                    returned. <code className="font-mono text-xs">useMemo</code> and{" "}
                    <code className="font-mono text-xs">useCallback</code> store the value and deps on the same linked
                    list. Source:{" "}
                    <code className="font-mono text-xs">packages/react-reconciler/src/ReactFiberHooks.js</code>.
                </p>
            </Collapsible>

            <Collapsible summary="If you're coding along" variant="warning">
                <p className="text-light3 leading-relaxed text-sm mb-3">
                    Three bugs that are almost guaranteed. First: forgetting to reset{" "}
                    <code className="font-mono text-xs">renderingFiber</code> (or whichever mechanism you use to
                    track the current fiber) between components. If component A calls two hooks and B renders next,
                    B's hooks start reading from A's alternate. The symptom: the first component is fine; all others
                    have wrong state.
                </p>
                <p className="text-light3 leading-relaxed text-sm mb-3">
                    Second: not clearing the pending queue after draining it. If you drain the queue but leave the
                    items in it, the next render re-applies the same updates. Counter increments twice per click.
                </p>
                <p className="text-light3 leading-relaxed text-sm">
                    Third: <code className="font-mono text-xs">useEffect</code> cleanup not running on deletion. The
                    cleanup must fire in <code className="font-mono text-xs">unmountSubtree</code>, which you have
                    to call when processing DELETION commits — easy to miss if you return early from
                    <code className="font-mono text-xs">commitWork</code> on deletions.
                </p>
            </Collapsible>
        </PartSection>
    );
}
