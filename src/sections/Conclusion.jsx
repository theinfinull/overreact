import PartSection from "../components/PartSection";

const INSIGHTS = [
    {
        topic: "Render purity",
        detail: "Why effects in render are wrong — the render phase can be discarded at any point, so any side effect it produces may run without the corresponding commit ever happening.",
        part: 5,
    },
    {
        topic: "Rules of hooks",
        detail: "Why hooks can't be conditional — hooks are matched between renders by call order. An index shift sends one hook's state into another's slot.",
        part: 8,
    },
    {
        topic: "Batching",
        detail: "Why three setStates in one handler cause one render — setState queues an action and schedules work. Three queued actions, one scheduled render, all three drain at once.",
        part: 8,
    },
    {
        topic: "Keys",
        detail: "What actually happens when you insert at the top without keys — every position mismatches, every node is rebuilt. With keys, the reconciler matches by identity instead of index.",
        part: 6,
    },
    {
        topic: "Layout vs passive effects",
        detail: "What \"after paint\" means — layout effects run synchronously after commit, before paint. Passive effects run after. One can measure the DOM without flickering; the other doesn't block the frame.",
        part: 8,
    },
    {
        topic: "Commit can't yield",
        detail: "Why a slow commit is worse than a slow render — the render phase yields mid-work; commit doesn't. Whatever the commit phase does, it holds the frame until it finishes.",
        part: 5,
    },
    {
        topic: "Component identity",
        detail: "Why defining a component inside another component remounts its subtree every render — fiber.type is compared by identity. A new function declaration is a new type, which means unmount and remount.",
        part: 7,
    },
];

const EXERCISES = [
    {
        title: "useRef",
        desc: "One slot, five lines. A hook that returns a stable object { current: initialValue } that never triggers a re-render when mutated. useRef is useState without the queue.",
    },
    {
        title: "useReducer",
        desc: "useState turns out to be a special case of useReducer where the reducer is an identity function. Implement useReducer first, then rewrite useState in terms of it.",
    },
    {
        title: "useMemo",
        desc: "Same hook slot mechanism as useState. Store a value and its deps. Recompute only when deps change. useMemo is useEffect without the commit step.",
    },
    {
        title: "memo and the bailout path",
        desc: "Wrap a component to opt it into props-equality bailout. Requires the performUnitOfWork check from Part 8.5 if you skipped it.",
    },
    {
        title: "Keyed reconciliation",
        desc: "If the keyed version wasn't part of your Part 6 implementation, add it now. Build the Map of old fibers, match by key first, fall back to position for unkeyed elements.",
    },
    {
        title: "MessageChannel scheduler",
        desc: "Swap requestIdleCallback for a MessageChannel-based scheduler with two priority levels. Make a click handler's work jump the queue ahead of a background render. This is the hard one — it's also the one that makes React 18's concurrent features make sense.",
    },
];

const READS = [
    {
        what: "beginWork's switch statement",
        where: "ReactFiberBeginWork.js",
        why: "You've implemented FunctionComponent and HostComponent. The rest of the file is the same pattern for ClassComponent, HostRoot, ContextProvider, SuspenseComponent, and more.",
    },
    {
        what: "HooksDispatcherOnMount vs HooksDispatcherOnUpdate",
        where: "ReactFiberHooks.js",
        why: "The mechanism that makes first and subsequent calls to useState behave differently without tracking call count externally.",
    },
    {
        what: "workLoopConcurrent",
        where: "ReactFiberWorkLoop.js",
        why: "Five lines. You'll recognize it immediately.",
    },
];

export default function Conclusion() {
    return (
        <PartSection
            id="conclusion"
            partNumber={null}
            paperLabel="Future work"
            title="Future work"
            subtitle="what to build next, and where to look"
            currentPart={null}
        >
            <p className="text-xl text-light2 leading-relaxed mb-4">
                The library as built: approximately 500 lines.
            </p>
            <p className="text-light2 leading-relaxed mb-10">
                React: ~30,000. You have 1.7% of the code and, if you followed along, most of the ideas.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-6">What you can now explain mechanically</h2>

            <div className="space-y-4 mb-12">
                {INSIGHTS.map((insight) => (
                    <div key={insight.topic} className="flex gap-4 items-start">
                        <a
                            href={`#part-${insight.part}`}
                            className="mt-0.5 shrink-0 inline-flex items-center justify-center size-6 rounded-full border border-accent/40 text-accent text-xs font-mono font-bold hover:bg-accent/10 transition-colors"
                        >
                            {insight.part}
                        </a>
                        <div>
                            <span className="font-semibold text-light">{insight.topic}</span>
                            <span className="text-light3 text-sm"> — </span>
                            <span className="text-light3 text-sm leading-relaxed">{insight.detail}</span>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-6">Suggested next exercises</h2>

            <div className="space-y-4 mb-12">
                {EXERCISES.map((ex, index) => (
                    <div key={ex.title} className="flex gap-4 items-start">
                        <span className="mt-0.5 shrink-0 inline-flex items-center justify-center size-6 rounded-full bg-dark2 text-light3 text-xs font-mono font-bold">
                            {index + 1}
                        </span>
                        <div>
                            <span className="font-semibold text-light font-mono text-sm">{ex.title}</span>
                            <p className="text-light3 text-sm leading-relaxed mt-0.5">{ex.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-6">
                Suggested first reads into the real source
            </h2>

            <div className="space-y-4 mb-12">
                {READS.map((read) => (
                    <div key={read.what} className="border-l-2 border-dark2 pl-5">
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 items-baseline mb-1">
                            <code className="font-mono text-accent text-sm">{read.what}</code>
                            <span className="text-light3 text-xs">{read.where}</span>
                        </div>
                        <p className="text-light3 text-sm leading-relaxed">{read.why}</p>
                    </div>
                ))}
            </div>

            <div className="p-6 rounded-lg border border-dark2 bg-dark2/20 mt-8">
                <p className="text-light3 text-sm leading-relaxed">
                    Source code at{" "}
                    <a
                        href="https://github.com/theinfinull/overreact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                    >
                        github.com/theinfinull/overreact
                    </a>
                    . Each stage is tagged — check out{" "}
                    <code className="font-mono text-xs">stage-1-createelement</code> through{" "}
                    <code className="font-mono text-xs">stage-8-hooks</code> to follow along from scratch. The
                    finished library is also available as a single annotated file in Appendix C.
                </p>
            </div>
        </PartSection>
    );
}
