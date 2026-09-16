import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const fiberShape = `// A fiber node
{
    type,        // "div" (host element) or MyComponent (function)
    key,         // string | null — used for reconciliation
    props,       // all JSX props, including children array
    dom,         // the actual DOM node, or null for function components

    parent,      // pointer up the tree (React names this "return")
    child,       // pointer to first child
    sibling,     // pointer to next sibling at same level

    alternate,   // the fiber from the previous render
    effectTag,   // PLACEMENT | UPDATE | DELETION
}`;

const performUnitCode = `function performUnitOfWork(fiber) {
    // 1. Do work for this fiber
    if (typeof fiber.type === "function") {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    // 2. Return the next unit of work
    if (fiber.child) return fiber.child;

    for (let current = fiber; current; current = current.parent) {
        if (current.sibling) return current.sibling;
    }
    return null;
}`;

const reconcileCode = `function reconcileChildren(parentFiber, elements) {
    let previousSibling = null;

    elements.forEach((element, index) => {
        const fiber = {
            type: element.type,
            key: element.key,
            props: element.props,
            dom: null,
            parent: parentFiber,
            alternate: null,
            effectTag: "PLACEMENT",
        };

        if (index === 0) {
            parentFiber.child = fiber;
        } else {
            previousSibling.sibling = fiber;
        }
        previousSibling = fiber;
    });
}`;

export default function Part4() {
    return (
        <PartSection
            id="part-4"
            partNumber={4}
            paperLabel="Method — Part 4"
            title="A stack you can put down"
            subtitle="the fiber data structure"
            currentPart={4}
        >
            {/* The question */}
            <p className="font-mono text-sm text-dark3 italic">
                How do you pause a tree walk and resume it later, from anywhere?
            </p>

            {/* Opening */}
            <p className="mt-6 text-light2 leading-relaxed">
                A call stack is a tree walk you can't pause. So we'll build the stack out of objects instead, and
                then the question of where we are becomes one variable.
            </p>

            {/* The insight */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The insight</h3>
                <p className="text-light2 leading-relaxed">
                    A call stack tracks the current position by pushing frames. When JavaScript yields (returns), the
                    frames are gone. That's why the recursive render from Part 2 can't be paused — the stack{" "}
                    <em>is</em> the state.
                </p>
                <p className="mt-3 text-light2 leading-relaxed">
                    Swap the stack for data on the heap. Build a linked list of nodes, where each node knows its parent,
                    its first child, and its next sibling. "Where are we" becomes a pointer to a node. Pause any time by
                    saving the pointer. Resume by reading it back.
                </p>
                <p className="mt-3 text-light">
                    The pointer <em>is</em> the state of the traversal. That's why it can pause.
                </p>
            </div>

            {/* Fiber node shape */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The fiber node</h3>
                <CodeBlock code={fiberShape} language="js" />
                <p className="mt-4 text-sm text-light3 leading-relaxed">
                    Only one <code className="text-accent text-xs">child</code> pointer, not an array. Siblings chain
                    to each other. This gives every node a fixed shape and a single traversal rule that needs no indexes.
                </p>
            </div>

            {/* The traversal rule */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The traversal rule</h3>
                <p className="text-light2 leading-relaxed mb-4">
                    State it once, precisely. Every node is visited exactly once by this rule:
                </p>
                <ol className="space-y-3">
                    {[
                        "If the current fiber has a child, go to the child.",
                        "Otherwise, if it has a sibling, go to the sibling.",
                        "Otherwise, climb to the parent and repeat from step 2 — take the parent's sibling.",
                        "Stop when you've climbed back to the root.",
                    ].map((step, i) => (
                        <li key={i} className="flex gap-4 items-start">
                            <span className="shrink-0 mt-0.5 size-6 rounded-full border border-accent/30 flex items-center justify-center text-xs font-mono text-accent">
                                {i + 1}
                            </span>
                            <span className="text-light2 leading-relaxed">{step}</span>
                        </li>
                    ))}
                </ol>
                <p className="mt-4 text-light2 leading-relaxed">
                    At any moment, the complete state of the traversal is one pointer. That's the whole thing.
                </p>
            </div>

            {/* The code */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The code — stage 4</h3>
                <div className="space-y-4">
                    <CodeBlock code={performUnitCode} language="js" filename="src/overreact/renderer.js" />
                    <CodeBlock code={reconcileCode} language="js" filename="src/overreact/reconcile.js" />
                </div>
            </div>

            {/* Connection to React source */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The same shape in real React</h3>
                <p className="text-light2 leading-relaxed">
                    This is the shape of React's <code className="text-accent text-sm">beginWork</code> (going down) and{" "}
                    <code className="text-accent text-sm">completeUnitOfWork</code> (coming back up). The "climb up" pass
                    is where React does layout effects ordering and bubbles error boundaries.
                </p>
                <p className="mt-3 text-light2 leading-relaxed">
                    The <code className="text-accent text-sm">parent</code> pointer is named{" "}
                    <code className="text-accent text-sm">return</code> in React's source. It's called that because it's
                    the fiber to "return to" after completing the current one — the call-stack analogy made explicit in
                    the data structure.
                </p>
            </div>

            {/* Two trees */}
            <div className="mt-8 rounded-xl border border-dark2 bg-dark2/30 p-5">
                <h3 className="font-semibold text-light mb-3">Two trees, different lifetimes</h3>
                <p className="text-sm text-light2 leading-relaxed">
                    The <strong className="text-light">element tree</strong> is created fresh every render from JSX.
                    It's disposable.
                </p>
                <p className="mt-2 text-sm text-light2 leading-relaxed">
                    The <strong className="text-light">fiber tree</strong> persists across renders. It's the mutable
                    state of the UI. Each fiber holds a reference to its DOM node and to its alternate from the previous
                    render — the thing it will be diffed against next time.
                </p>
            </div>

            {/* Break it */}
            <div className="mt-10 rounded-xl border border-dark2/80 bg-dark/60 p-5">
                <p className="text-xs font-mono tracking-widest text-dark3 uppercase mb-2">Break it</p>
                <p className="text-light2">
                    Step through a render slowly with the DOM panel visible. Because each unit appends its node
                    immediately, the user sees the UI assemble in pieces.
                </p>
                <p className="mt-2 text-light2">
                    If the browser yields mid-render, it paints a half-built interface.
                </p>
            </div>

            {/* Collapsibles */}
            <div className="mt-6 space-y-3">
                <Collapsible summary="Real React — ReactFiber.js" variant="footnote">
                    <p className="text-sm text-light2 leading-relaxed">
                        A real React fiber is substantially more complex:{" "}
                        <code className="text-accent text-xs">lanes</code> (a bitmask of pending update priorities),{" "}
                        <code className="text-accent text-xs">memoizedState</code> (a linked list of hook states, not an array),{" "}
                        <code className="text-accent text-xs">flags</code> instead of effectTag,{" "}
                        <code className="text-accent text-xs">subtreeFlags</code> for bubbling effects up the tree. The{" "}
                        <code className="text-accent text-xs">alternate</code> pointer exists on both current and
                        work-in-progress fibers — they point to each other, forming a two-fiber pair per node.
                        Source: <code className="text-accent text-xs">packages/react-reconciler/src/ReactFiber.js</code>.
                    </p>
                </Collapsible>

                <Collapsible summary="If you're coding along" variant="warning">
                    <p className="text-sm text-light2 leading-relaxed">
                        Two common bugs. First: the traversal loop that climbs through parents looking for a sibling
                        needs to stop at the root. Forget to stop and it climbs past the root into{" "}
                        <code className="text-accent text-xs">undefined</code> and throws.
                    </p>
                    <p className="mt-3 text-sm text-light2 leading-relaxed">
                        Second: forgetting to reset <code className="text-accent text-xs">fiber.child</code> to null when
                        a fiber has no children. Old child pointers from the alternate fiber leak into the new tree,
                        causing ghost nodes to appear and potentially infinite loops.
                    </p>
                </Collapsible>
            </div>
        </PartSection>
    );
}
