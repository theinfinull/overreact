import { useState } from "/src/overreact";

const DEFINITIONS = new Map([
    ["fiber", "A plain JavaScript object representing one unit of work. It holds the element's type, props, DOM reference, and three pointers: child, sibling, and parent. The fiber tree can be paused mid-walk because the traversal state lives in a single pointer, not a call stack."],
    ["element", "The plain object returned by createElement. Describes what the UI should look like — type, props, and children — but has no DOM node and no side effects. Immutable, created on every render."],
    ["host component", "A fiber whose type is a string: 'div', 'span', 'svg', etc. Host components own a real DOM node."],
    ["function component", "A fiber whose type is a function. It has no DOM node of its own; React calls the function to get the elements it should render."],
    ["work loop", "The scheduler loop that calls performUnitOfWork repeatedly, one fiber at a time, checking after each unit whether the browser needs the thread back."],
    ["unit of work", "One fiber processed by performUnitOfWork: create its DOM node if needed, reconcile its children, return the next fiber to process."],
    ["yield", "Handing the main thread back to the browser so it can paint and handle input. The work loop yields after each unit of work when the deadline is exhausted."],
    ["WIP root", "The root fiber of the in-progress render. Nothing in it has been committed to the DOM yet. When the work loop finishes, wipRoot is committed then cleared."],
    ["alternate", "The fiber's counterpart in the other tree. current.alternate is workInProgress; workInProgress.alternate is current. Used to diff props and state between renders."],
    ["double buffering", "Keeping two trees: one committed (visible), one in progress (invisible). The in-progress tree can be discarded without affecting the screen. When complete, the trees swap."],
    ["effect tag", "A flag on a fiber indicating what commit work is needed: PLACEMENT (new node), UPDATE (changed props), or DELETION (removed node). Real React calls these 'flags'."],
    ["reconciliation", "Comparing the previous fiber tree to the new element tree to produce the minimum set of DOM operations. The output is a set of fibers tagged with effect flags."],
    ["commit", "The synchronous, uninterruptible pass that reads effect tags and applies DOM mutations. Cannot be paused. A slow commit blocks the browser; a slow render only delays it."],
    ["placement", "An effect tag meaning this fiber's DOM node should be inserted. Triggered when a new element appears with no matching fiber in the previous tree."],
    ["deletion", "An effect tag meaning this fiber's DOM node should be removed. Stored in a separate deletions array because the fiber isn't in the new tree."],
    ["bailout", "Skipping reconciliation for a subtree whose props and state haven't changed. The existing fiber subtree is cloned instead of re-rendered. memo opts a component into bailout checks."],
    ["hook slot", "One entry in the fiber's hooks array. Each useState or useEffect call occupies one slot, identified by call order. The slot persists across renders; the call order must not change."],
    ["passive effect", "A useEffect callback that runs after paint, scheduled by React's scheduler. Contrasts with layout effects, which run synchronously after DOM mutation but before paint."],
    ["layout effect", "A useLayoutEffect callback that runs synchronously after the commit phase but before the browser paints. Used when you need to read layout and synchronously re-render."],
    ["lane", "A bit in React's priority model. Different update sources (user input, transitions, background data) get different lanes, allowing high-priority work to jump ahead of low-priority work."],
]);

export default function GlossaryTerm({ term, children }) {
    const [open, setOpen] = useState(false);
    const definition = DEFINITIONS.get(term.toLowerCase());

    return (
        <span className="relative inline-block">
            <button
                className="underline decoration-dotted underline-offset-3 text-light2 hover:text-accent transition-colors cursor-help"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                aria-describedby={`glossary-${term}`}
            >
                {children ?? term}
            </button>
            {open && definition && (
                <span
                    id={`glossary-${term}`}
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 max-w-xs rounded-lg bg-dark2 border border-dark3 px-3 py-2 text-xs text-light2 leading-relaxed shadow-xl pointer-events-none"
                >
                    <span className="block font-mono text-accent mb-1">{term}</span>
                    {definition}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark3" aria-hidden="true" />
                </span>
            )}
        </span>
    );
}
