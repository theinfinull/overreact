import { ChevronLeft, ChevronRight, Pause, Play } from "lucide";
import { useEffect } from "../overreact";
import Icon from "./Icon";

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

const TICK_MS = 2200;
const HOLD_END_MS = 3200;

const BUTTON_CLASS =
    "grid size-10 cursor-pointer touch-manipulation place-items-center rounded-full text-dark/55 transition-colors duration-150 [-webkit-tap-highlight-color:transparent] hover:bg-dark/5 hover:text-dark focus-visible:bg-dark/5 focus-visible:text-dark focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent active:bg-dark/9";

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

                <div className="border-t border-light2 px-5 pt-4 pb-3">
                    <div id="reconcile-demo-caption" className="mb-2 min-h-13 text-base leading-relaxed text-dark/75" />

                    <div className="flex items-center gap-4">
                        <div className="flex flex-1 items-center gap-1" aria-hidden="true">
                            {STEPS.map((_, index) => (
                                <span
                                    key={String(index)}
                                    id={domId("tick", index)}
                                    className="h-0.5 max-w-6 flex-1 rounded-full bg-light2 transition-colors duration-300 data-[state=done]:bg-light3 data-[state=current]:bg-accent"
                                />
                            ))}
                        </div>
                        <div className="-me-2 flex items-center">
                            <button
                                type="button"
                                id="reconcile-demo-prev"
                                className={BUTTON_CLASS}
                                aria-label="Previous step"
                            >
                                <Icon icon={ChevronLeft} size={18} />
                            </button>
                            <button
                                type="button"
                                id="reconcile-demo-play"
                                className={BUTTON_CLASS}
                                aria-label="Play or pause"
                            >
                                <Icon icon={Pause} size={16} className="hidden group-data-playing/walk:block" />
                                <Icon icon={Play} size={16} className="block group-data-playing/walk:hidden" />
                            </button>
                            <button
                                type="button"
                                id="reconcile-demo-next"
                                className={BUTTON_CLASS}
                                aria-label="Next step"
                            >
                                <Icon icon={ChevronRight} size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <figcaption className="mt-2 text-center text-xs text-gray-500">
                fig 3.1 - Reconciling children, position by position
            </figcaption>
        </figure>
    );
}

// steps are applied straight to the DOM: a state-driven tick would re-render the whole app every frame.
function animateReconcile() {
    const root = document.getElementById("reconcile-demo");
    if (!root) return undefined;

    const byId = (id) => document.getElementById(id);
    const caption = byId("reconcile-demo-caption");
    const playButton = byId("reconcile-demo-play");
    const prevButton = byId("reconcile-demo-prev");
    const nextButton = byId("reconcile-demo-next");

    let step = 0;
    let playing = true;
    let visible = false;
    let timer = 0;

    const setState = (el, state) => {
        if (!el) return;
        if (state) el.dataset.state = state;
        else delete el.dataset.state;
    };

    const apply = () => {
        const current = STEPS[step];
        const decided = new Set(STEPS.slice(0, step + 1).flatMap((s) => s.decided));

        ROWS.forEach((row, i) => {
            const state = current.rows.includes(i) ? "current" : decided.has(i) ? "done" : undefined;
            setState(byId(domId("old", i)), row.old == null ? undefined : state);
            setState(byId(domId("next", i)), row.next == null ? undefined : state);
        });

        STEPS.forEach((_, index) => {
            setState(byId(domId("tick", index)), index === step ? "current" : index < step ? "done" : undefined);
        });

        if (caption.textContent !== current.text) {
            caption.textContent = current.text;
            caption.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 350,
                easing: "ease-out",
            });
        }
        root.toggleAttribute("data-playing", playing);
    };

    const schedule = () => {
        clearTimeout(timer);
        if (!playing || !visible) return;
        const delay = step === STEPS.length - 1 ? HOLD_END_MS : TICK_MS;
        timer = setTimeout(() => {
            step = (step + 1) % STEPS.length;
            apply();
            schedule();
        }, delay);
    };

    const goTo = (next) => {
        step = (next + STEPS.length) % STEPS.length;
        playing = false;
        apply();
        schedule();
    };

    const onPlay = () => {
        playing = !playing;
        if (playing && step === STEPS.length - 1) step = 0;
        apply();
        schedule();
    };
    const onPrev = () => goTo(step - 1);
    const onNext = () => goTo(step + 1);

    playButton.addEventListener("click", onPlay);
    prevButton.addEventListener("click", onPrev);
    nextButton.addEventListener("click", onNext);

    const observer = new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting;
            schedule();
        },
        { threshold: 0.4 },
    );
    observer.observe(root);

    apply();

    return () => {
        clearTimeout(timer);
        observer.disconnect();
        playButton.removeEventListener("click", onPlay);
        prevButton.removeEventListener("click", onPrev);
        nextButton.removeEventListener("click", onNext);
    };
}
