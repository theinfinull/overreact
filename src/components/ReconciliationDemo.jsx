import { useEffect } from "../overreact";
import { playSteps, setDataState } from "../util/stepPlayer";
import StepControls from "./StepControls";

// aligned rows: old child, new child at the same position, and what reconcileChildren decides
const ROWS = [
    { old: "<div>", next: "<div>", verdict: "update" },
    { old: "  <h1>Title</h1>", next: "  <h1>Title</h1>", verdict: "update" },
    { old: "  <p>Hello</p>", next: "  <p>Hello there</p>", verdict: "update" },
    { old: "  <input />", next: "  <span>Saved</span>", verdict: "replace" },
    { old: null, next: "  <button>Undo</button>", verdict: "placement" },
    { old: "</div>", next: "</div>", verdict: "update" },
];

const STEPS = [
    {
        rows: [],
        decided: [],
        text: "A state change triggers a render. React compares the old children with the new ones, one position at a time.",
    },
    {
        rows: [0],
        decided: [0, 5],
        text: "Both roots are a <div>. Same type, so React keeps the DOM node and marks it UPDATE.",
    },
    {
        rows: [1],
        decided: [1],
        text: "First position: <h1> and <h1>. Same type, so this one is an UPDATE too.",
    },
    {
        rows: [2],
        decided: [2],
        text: "Second position: <p> and <p>. The text changed, but only the type matters here, so it is still an UPDATE.",
    },
    {
        rows: [3],
        decided: [3],
        text: "Third position: <input> and <span>. The types differ, so the <input> is marked DELETION and the <span> PLACEMENT.",
    },
    {
        rows: [4],
        decided: [4],
        text: "The fourth position only exists in the new tree, so the <button> gets a new fiber marked PLACEMENT.",
    },
    {
        rows: [],
        decided: [],
        text: "In the commit phase, React updates the props of the three matching nodes, removes the <input>, and adds the <span> and the <button>.",
    },
];

const LINE_CLASS =
    "min-w-0 overflow-hidden rounded-md bg-gray-100 px-2.5 py-1 font-mono text-[12px] whitespace-pre text-dark3 transition-colors duration-350 " +
    "data-[state=current]:bg-violet-500 data-[state=current]:text-light " +
    "data-[state=done]:data-[verdict=update]:bg-yellow-50 data-[state=done]:data-[verdict=update]:text-yellow-600 " +
    "data-[state=done]:data-[verdict=placement]:bg-green-50 data-[state=done]:data-[verdict=placement]:text-green-600 " +
    "data-[state=done]:data-[verdict=deletion]:bg-red-50 data-[state=done]:data-[verdict=deletion]:text-red-500 " +
    "data-empty:border data-empty:border-dashed data-empty:border-light2 data-empty:bg-transparent";

// a type mismatch is two effects: the old fiber is deleted, the new one placed
const oldVerdict = (row) => (row.verdict === "replace" ? "deletion" : row.verdict);
const nextVerdict = (row) => (row.verdict === "replace" ? "placement" : row.verdict);

const domId = (part, index) => `reconcile-demo-${part}-${index}`;

export default function ReconciliationDemo() {
    useEffect(() => animateReconcile(), []);

    return (
        <figure className="group/walk mb-8" id="reconcile-demo">
            <div className="overflow-hidden rounded-2xl border border-light2 bg-light">
                <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 p-5">
                    <div className="px-2.5 pb-1 text-xs text-gray-500">current</div>
                    <div className="px-2.5 pb-1 text-xs text-gray-500">work in progress</div>

                    {ROWS.flatMap((row, i) => [
                        <div
                            key={`old-${i}`}
                            id={domId("old", i)}
                            className={LINE_CLASS}
                            data-verdict={oldVerdict(row)}
                            data-empty={row.old == null || undefined}
                        >
                            {row.old ?? " "}
                        </div>,
                        <div
                            key={`next-${i}`}
                            id={domId("next", i)}
                            className={LINE_CLASS}
                            data-verdict={nextVerdict(row)}
                            data-empty={row.next == null || undefined}
                        >
                            {row.next ?? " "}
                        </div>,
                    ])}
                </div>

                <StepControls prefix="reconcile-demo" count={STEPS.length} />
            </div>
            <figcaption className="mt-2 text-center text-xs text-gray-500">
                fig 3.1 - Reconciling children, position by position
            </figcaption>
        </figure>
    );
}

function animateReconcile() {
    return playSteps({
        prefix: "reconcile-demo",
        steps: STEPS,
        onStep: (current, step) => {
            const decided = new Set(STEPS.slice(0, step + 1).flatMap((s) => s.decided));

            ROWS.forEach((row, i) => {
                const state = current.rows.includes(i) ? "current" : decided.has(i) ? "done" : undefined;
                setDataState(document.getElementById(domId("old", i)), row.old == null ? undefined : state);
                setDataState(document.getElementById(domId("next", i)), row.next == null ? undefined : state);
            });
        },
    });
}
