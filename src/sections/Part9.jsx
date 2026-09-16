import PartSection from "../components/PartSection";

const SOURCE_MAP = [
    {
        ours: "createElement",
        theirs: "createElement / jsx()",
        file: "packages/react/src/ReactElement.js",
    },
    {
        ours: "render",
        theirs: "createRoot().render → scheduleUpdateOnFiber",
        file: "ReactFiberReconciler.js",
    },
    {
        ours: "workLoop",
        theirs: "workLoopConcurrent / workLoopSync",
        file: "ReactFiberWorkLoop.js",
    },
    {
        ours: "performUnitOfWork",
        theirs: "beginWork + completeUnitOfWork",
        file: "ReactFiberBeginWork.js / ReactFiberCompleteWork.js",
    },
    {
        ours: "reconcileChildren",
        theirs: "reconcileChildFibers",
        file: "ReactChildFiber.js",
    },
    {
        ours: "commitRoot / commitWork",
        theirs: "commitRoot / commitMutationEffects",
        file: "ReactFiberCommitWork.js",
    },
    {
        ours: "effectTag (PLACEMENT, UPDATE, DELETION)",
        theirs: "flags (Placement, Update, ChildDeletion)",
        file: "ReactFiberFlags.js",
    },
    {
        ours: "wipRoot / currentRoot",
        theirs: "workInProgress / current",
        file: "ReactFiberWorkLoop.js",
    },
    {
        ours: "fiber.parent",
        theirs: "fiber.return",
        file: "(convention throughout)",
    },
    {
        ours: "fiber.hooks (array)",
        theirs: "fiber.memoizedState (linked list)",
        file: "ReactFiberHooks.js",
    },
    {
        ours: "requestIdleCallback",
        theirs: "Scheduler package, MessageChannel + lanes",
        file: "packages/scheduler/",
    },
    {
        ours: "deletions array",
        theirs: "ChildDeletion flag + deletions on parent fiber",
        file: "ReactFiberFlags.js / ReactChildFiber.js",
    },
];

const GAP_LIST = [
    {
        name: "Priority scheduler",
        desc: "We used requestIdleCallback. React uses a Scheduler package with lanes and priority levels. startTransition marks work as interruptible. useDeferredValue defers a value to low-priority work. Without this, there's no way to say \"this render matters less than a click.\"",
    },
    {
        name: "Suspense",
        desc: "Components can throw a Promise. React catches it, renders a fallback, and retries when the Promise resolves. Our render phase has no try/catch.",
    },
    {
        name: "Server components and streaming SSR",
        desc: "Rendering that happens on the server, streamed as HTML, then hydrated on the client. Our renderer is browser-only and produces DOM nodes, not HTML strings.",
    },
    {
        name: "Synthetic event system",
        desc: "Root-level event delegation, a unified event wrapper, and the machinery that makes e.stopPropagation() work correctly across React trees. We attach listeners directly to DOM nodes.",
    },
    {
        name: "Context",
        desc: "A way to pass values down the fiber tree without prop drilling. Requires finding the nearest provider during render — a separate mechanism from anything we built.",
    },
    {
        name: "Refs and forwardRef",
        desc: "A way to hold a stable mutable reference across renders (useRef is actually implementable in five lines), and a way to pass a ref through a function component (forwardRef).",
    },
    {
        name: "Error boundaries",
        desc: "Catching render errors in a subtree and rendering a fallback. Requires try/catch in the render phase and a way to identify class components as boundary candidates.",
    },
    {
        name: "Portals",
        desc: "Rendering into a DOM node outside the current tree. Commit needs a separate path to find the intended DOM parent rather than walking up the fiber tree.",
    },
    {
        name: "Class components",
        desc: "A separate branch in beginWork that instantiates a class, calls render(), and manages componentDidMount / componentDidUpdate lifecycle methods.",
    },
    {
        name: "Memoization APIs",
        desc: "memo, useMemo, useCallback. Covered in Part 8.5 if you took it. The single largest gap if you didn't — without the bailout path, every update walks the whole tree.",
    },
    {
        name: "StrictMode",
        desc: "Double-invokes render functions in development to catch side effects. We have no development mode — which means the most common class of bugs in this codebase goes silently undetected.",
    },
    {
        name: "Fragments and keyed fragments",
        desc: "Returning multiple children without a wrapper element. Arrays give us partial support; the Fragment component adds key support across fragment siblings.",
    },
    {
        name: "Full text node handling",
        desc: "Whitespace normalization, adjacent text node merging, and hydration mismatch recovery. Our TEXT_ELEMENT wrapper allocates an object for every string child.",
    },
];

export default function Part9() {
    return (
        <PartSection
            id="part-9"
            partNumber={9}
            paperLabel="Limitations"
            title="Limitations and future work"
            subtitle="the 29,500 lines we skipped, and where to read them"
            currentPart={null}
        >
            <p className="text-xl text-light2 leading-relaxed mb-8">
                500 lines in, here's everything we lied about.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-6">A. The honest gap list</h2>

            <div className="space-y-5 mb-12">
                {GAP_LIST.map((item) => (
                    <div key={item.name} className="border-l-2 border-dark2 pl-5">
                        <h3 className="font-semibold text-light text-base mb-1">{item.name}</h3>
                        <p className="text-light3 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            <h2 id="source-map" className="text-2xl font-semibold text-light mt-12 mb-2">
                B. The source map
            </h2>
            <p className="text-light3 text-sm mb-6">
                You now know the vocabulary. Here's the door. Linked to React 19 source — line numbers move, file
                names don't.
            </p>

            <div className="overflow-x-auto rounded-lg border border-dark2 mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-dark2 bg-dark2/50">
                            <th className="text-left px-4 py-3 font-semibold text-light3 w-1/3">Overreact</th>
                            <th className="text-left px-4 py-3 font-semibold text-light3 w-1/3">Real React</th>
                            <th className="text-left px-4 py-3 font-semibold text-light3">File</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SOURCE_MAP.map((row, index) => (
                            <tr
                                key={row.ours}
                                className={`border-b border-dark2/50 ${index % 2 === 0 ? "" : "bg-dark2/20"}`}
                            >
                                <td className="px-4 py-3 font-mono text-accent text-xs">{row.ours}</td>
                                <td className="px-4 py-3 font-mono text-light2 text-xs">{row.theirs}</td>
                                <td className="px-4 py-3 font-mono text-light3 text-xs">{row.file}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="text-light3 text-sm mb-12">
                Suggested first read:{" "}
                <code className="font-mono text-xs text-accent">beginWork</code>'s switch statement in
                ReactFiberBeginWork.js. You've implemented two of its branches. The rest of the file is the same
                pattern repeated for class components, host roots, portals, context, Suspense, and more.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">C. How much slower is it</h2>

            <p className="text-light2 leading-relaxed mb-12">
                We haven't run formal benchmarks. Based on the known gaps: no bailout without Part 8.5, no lanes
                or priority, a TEXT_ELEMENT object allocated for every string child, no object pooling, a full tree
                walk per update, and attribute writes without the fast paths React uses for known DOM properties.
                Most of React's 30,000 lines are the optimizations. The ideas fit in 500.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">D. A short history</h2>

            <div className="p-5 rounded-lg bg-dark2/40 border border-dark2 text-light3 text-sm leading-relaxed mb-6">
                React's original reconciler was recursive and synchronous — the "stack reconciler", essentially
                Part 2's version with more features. Fiber was a ground-up rewrite shipped in React 16 (2017)
                specifically to make rendering interruptible. The concurrent features in React 18 (2022) are what
                that rewrite was always for. It took five years between building the mechanism and shipping the
                user-facing features that needed it. Didact's own history mirrors this: the original 2017 series
                was written against the stack architecture and rewritten in 2019 for fiber and hooks — which is
                also why it remains the best starting point for this topic.
            </div>
        </PartSection>
    );
}
