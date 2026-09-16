import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const bailoutCode = `function performUnitOfWork(fiber) {
    if (canBailout(fiber)) {
        return cloneChildFibers(fiber);
    }

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

function canBailout(fiber) {
    if (!fiber.alternate) return false;
    // Props reference equality — same object means nothing changed.
    // State equality — simplified; real React uses lanes.
    return fiber.props === fiber.alternate.props;
}

function cloneChildFibers(fiber) {
    // Copy the child subtree from the previous render unchanged.
    // Then move to the next sibling — no need to descend.
    let oldChild = fiber.alternate?.child ?? null;
    let previousSibling = null;

    while (oldChild) {
        const clone = { ...oldChild, parent: fiber, alternate: oldChild };
        if (!previousSibling) fiber.child = clone;
        else previousSibling.sibling = clone;
        previousSibling = clone;
        oldChild = oldChild.sibling;
    }

    // Skip the whole subtree — return the next sibling or climb.
    for (let current = fiber; current; current = current.parent) {
        if (current.sibling) return current.sibling;
    }
    return null;
}`;

const memoCode = `function memo(Component) {
    return function MemoizedComponent(props) {
        const fiber = currentFiber();
        const prevProps = fiber.alternate?.props ?? null;

        if (prevProps !== null) {
            const keys = Object.keys(props);
            const allEqual =
                keys.length === Object.keys(prevProps).length &&
                keys.every(k => Object.is(props[k], prevProps[k]));

            if (allEqual) {
                // Signal to performUnitOfWork that this subtree can bail out.
                // In a real implementation this sets a flag on the fiber.
                fiber.bailout = true;
            }
        }

        return Component(props);
    };
}`;

export default function Part8_5() {
    return (
        <PartSection
            id="part-8-5"
            partNumber="8.5"
            paperLabel="Method — Part 8.5"
            title="The art of doing nothing"
            subtitle="the bailout path, memo, and the compiler"
            currentPart={8}
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark2 border border-dark3 text-sm text-light3 mb-8">
                Optional — the library is complete without this part.
            </div>

            <p className="text-xl text-light2 leading-relaxed mb-8">
                Our version walks every fiber on every render. Real React skips most of them. How?
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                We now have a renderer that is correct and stupid: change one leaf and it re-walks the whole tree.
                React's real trick isn't the walking.
            </p>
            <p className="text-light font-semibold text-lg mb-8">It's the not walking.</p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">The problem, made concrete</h2>

            <p className="text-light2 leading-relaxed mb-6">
                A <code className="font-mono text-accent text-sm">setState</code> in a leaf component schedules a
                new render from the current root. Every{" "}
                <code className="font-mono text-accent text-sm">performUnitOfWork</code> call processes every fiber
                — the entire tree, every render, regardless of what changed. On a tree of fifty components, that's
                fifty function calls for a change that affected one. For five hundred, it's five hundred.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-10 mb-4">The bailout condition</h2>

            <p className="text-light2 leading-relaxed mb-4">
                At the start of <code className="font-mono text-accent text-sm">performUnitOfWork</code>, before
                calling the component: check whether this fiber's props are reference-equal to the previous render's
                props. If they are, and if no state in this fiber has changed, clone the existing child subtree and
                skip the whole descent. One check instead of N function calls.
            </p>

            <CodeBlock code={bailoutCode} language="js" filename="renderer.js" />

            <h2 className="text-2xl font-semibold text-light mt-12 mb-4">Now the familiar APIs make sense</h2>

            <p className="text-light2 leading-relaxed mb-4">
                <strong className="text-light">
                    <code className="font-mono text-accent">memo</code>
                </strong>{" "}
                wraps a component and opts it into the props-equality check. Without memo, function components
                always re-render when their parent does — even if props didn't change. With memo, new props that
                pass the equality check skip the component entirely.
            </p>

            <CodeBlock code={memoCode} language="js" filename="memo.js" />

            <p className="text-light2 leading-relaxed mt-6 mb-4">
                <strong className="text-light">
                    <code className="font-mono text-accent">useCallback(fn, deps)</code>
                </strong>{" "}
                returns a stable function reference when deps haven't changed. Its only purpose is to keep prop
                references stable so a downstream <code className="font-mono text-accent text-sm">memo</code> can
                bail out. useCallback does nothing on its own.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                <strong className="text-light">
                    <code className="font-mono text-accent">useMemo(fn, deps)</code>
                </strong>{" "}
                is the same for values. Stable value reference → stable prop → bailout fires.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                Passing <code className="font-mono text-accent text-sm">{"{}"}</code> or{" "}
                <code className="font-mono text-accent text-sm">{"() => {}"}</code> inline defeats all of it.
                A fresh object or function literal is a new reference every render. The equality check fails.
                The bailout doesn't fire. You can have memo everywhere and inline props will bypass it all.
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                <strong className="text-light">Context is the notable exception.</strong> A context update bypasses
                props equality. A component subscribed to context re-renders when context changes regardless of
                what its parent renders. This is why a{" "}
                <code className="font-mono text-accent text-sm">memo</code> wrapper doesn't stop a context-driven
                re-render.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-10 mb-4">2026 note</h2>

            <p className="text-light2 leading-relaxed mb-6">
                The React Compiler analyzes your component and inserts the{" "}
                <code className="font-mono text-accent text-sm">useMemo</code> and{" "}
                <code className="font-mono text-accent text-sm">useCallback</code> calls you were writing by hand,
                inferring correct dependencies automatically. It doesn't change the bailout mechanism — it feeds it
                better inputs. A reader who understands this part can read compiler output and recognize exactly what
                it's doing and why.
            </p>

            <Collapsible summary="Real React — bailoutOnAlreadyFinishedWork" variant="footnote">
                <p className="text-light3 leading-relaxed text-sm">
                    The real implementation is{" "}
                    <code className="font-mono text-xs">bailoutOnAlreadyFinishedWork</code> in
                    ReactFiberBeginWork.js. React uses lanes — a bitmask — to determine whether a fiber's subtree has
                    pending work. If <code className="font-mono text-xs">fiber.lanes === NoLanes</code> and{" "}
                    <code className="font-mono text-xs">fiber.childLanes === NoLanes</code>, the entire subtree can
                    be skipped in a single check. The{" "}
                    <code className="font-mono text-xs">didReceiveUpdate</code> flag tracks whether a fiber's state
                    or context changed during the current render. Props equality is checked via{" "}
                    <code className="font-mono text-xs">Object.is</code> — not deep equality, which would be more
                    expensive than re-rendering. Source:{" "}
                    <code className="font-mono text-xs">
                        packages/react-reconciler/src/ReactFiberBeginWork.js
                    </code>
                    .
                </p>
            </Collapsible>
        </PartSection>
    );
}
