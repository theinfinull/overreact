import PartSection from "../components/PartSection";

const TERMS = [
    {
        term: "fiber",
        def: "A JavaScript object representing one unit of work in the render tree. Each component or DOM element gets a fiber; fibers are linked by child, sibling, and parent pointers rather than stored in a nested structure.",
    },
    {
        term: "element",
        def: "The plain object returned by createElement — { type, props, key }. Elements are descriptions of what to render. They're immutable and cheap to create. Fibers are the stateful counterpart that persist between renders.",
    },
    {
        term: "host component",
        def: "A fiber whose type is a string — a real DOM element like 'div' or 'input'. Host components produce DOM nodes. Distinguished from function components, which produce no DOM of their own.",
    },
    {
        term: "function component",
        def: "A fiber whose type is a function. React calls the function with the fiber's props to get its children. The fiber itself has no DOM node — the DOM lives in its host-component descendants.",
    },
    {
        term: "work loop",
        def: "The scheduler loop that calls performUnitOfWork repeatedly, checking after each unit whether the browser needs the thread back. The loop yields by returning from the idle callback and re-scheduling itself.",
    },
    {
        term: "unit of work",
        def: "One fiber's worth of render work — creating its DOM node (if any), reconciling its children against the previous render, and returning the next fiber to process.",
    },
    {
        term: "yield",
        def: "Returning control to the browser mid-render. The work loop yields when the idle callback's time budget is exhausted. The render resumes on the next idle callback, starting from wherever nextUnitOfWork points.",
    },
    {
        term: "WIP root",
        def: "Work-in-progress root — the fiber being built during the current render. It exists in parallel with the current root and is only swapped in when the commit phase completes. If rendering is interrupted, the WIP root is discarded.",
    },
    {
        term: "alternate",
        def: "Each fiber points at its counterpart from the previous render via fiber.alternate. The current tree's alternate is the WIP tree, and vice versa after each commit. Reconciliation reads from alternate to produce the diff.",
    },
    {
        term: "double buffering",
        def: "Maintaining two trees simultaneously — the current committed tree and the work-in-progress tree — so that the in-progress render is never visible until it's complete. Named after the same technique in graphics.",
    },
    {
        term: "effect tag / flag",
        def: "A marker on a fiber indicating what DOM operation the commit phase should perform for it: PLACEMENT (insert), UPDATE (update props), or DELETION (remove). React renamed effectTag to flags and made it a bitmask to allow multiple flags per fiber.",
    },
    {
        term: "reconciliation",
        def: "The process of comparing the new element tree against the previous fiber tree to determine the minimum set of DOM changes. Produces effect tags on each fiber.",
    },
    {
        term: "commit",
        def: "The synchronous, uninterruptible phase that applies all DOM changes computed during reconciliation. Commit cannot be paused — it runs to completion in a single synchronous pass.",
    },
    {
        term: "placement",
        def: "An effect tag meaning the fiber's DOM node should be inserted into the document. Assigned to fibers that have no counterpart in the previous tree.",
    },
    {
        term: "deletion",
        def: "An effect tag meaning the fiber's DOM node should be removed from the document. Deletions are processed first in the commit phase, before placements and updates.",
    },
    {
        term: "bailout",
        def: "Skipping a fiber and its subtree during render because its props and state haven't changed. The existing subtree is cloned unchanged. memo opts a component into bailout; the React Compiler automates it.",
    },
    {
        term: "hook slot",
        def: "A position in a fiber's hooks array. Each useState or useEffect call claims the next slot in order. The slot is matched to the same slot from the previous render by index alone — no names, no keys.",
    },
    {
        term: "passive effect",
        def: "A useEffect callback — so named because it runs passively, after the browser has painted, without blocking the frame. Contrasted with layout effects, which run before paint.",
    },
    {
        term: "layout effect",
        def: "A useLayoutEffect callback. Runs synchronously after commit, before the browser has painted. Can read DOM geometry without causing a visible flash, but blocks the frame if slow.",
    },
    {
        term: "lane",
        def: "A bit in React's lanes bitmask representing a priority level. Each update is assigned a lane (e.g. SyncLane for user interactions, DefaultLane for normal updates, IdleLane for background work). The work loop selects which lanes to process based on scheduling priority.",
    },
];

export default function Glossary() {
    return (
        <PartSection
            id="glossary"
            partNumber={null}
            paperLabel="Appendix A"
            title="Glossary"
            subtitle="one definition, one place"
            currentPart={null}
        >
            <p className="text-light3 text-sm leading-relaxed mb-8">
                Each term is defined once here. The first occurrence in every part links back to this definition.
                If two parts seem to use a term differently, this is the authoritative version.
            </p>

            <div className="space-y-6">
                {TERMS.map((item) => (
                    <div key={item.term} id={`glossary-${item.term.replace(/[\s/]/g, "-")}`} className="flex gap-5 items-start border-b border-dark2/50 pb-5">
                        <code className="font-mono text-accent text-sm shrink-0 w-40 pt-0.5">{item.term}</code>
                        <p className="text-light3 text-sm leading-relaxed">{item.def}</p>
                    </div>
                ))}
            </div>
        </PartSection>
    );
}
