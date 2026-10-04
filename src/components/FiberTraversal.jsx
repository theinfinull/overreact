import { ChevronLeft, ChevronRight, Pause, Play } from "lucide";
import { useEffect } from "../overreact";
import Icon from "./Icon";

const NODE_W = 64;
const NODE_H = 30;

const NODES = {
    root: { x: 200, y: 36, label: "root" },
    div: { x: 200, y: 104, label: "<div>" },
    h1: { x: 120, y: 172, label: "<h1>" },
    h2: { x: 290, y: 172, label: "<h2>" },
    p: { x: 64, y: 240, label: "<p>" },
    a: { x: 176, y: 240, label: "<a>" },
};

const TREE_EDGES = [
    ["root", "div"],
    ["div", "h1"],
    ["div", "h2"],
    ["h1", "p"],
    ["h1", "a"],
];

const SIBLING_EDGES = [
    ["h1", "h2"],
    ["p", "a"],
];

const STEPS = [
    {
        at: "root",
        edge: null,
        move: "start",
        text: "render() hands the root fiber to the work loop.",
    },
    {
        at: "div",
        edge: "root-div",
        move: "child",
        text: "root has a child, so div is next. Child always wins.",
    },
    {
        at: "h1",
        edge: "div-h1",
        move: "child",
        text: "div's first child is h1. Keep going down.",
    },
    {
        at: "p",
        edge: "h1-p",
        move: "child",
        text: "h1's first child is p. Still down.",
    },
    {
        at: "a",
        edge: "p-a",
        move: "sibling",
        text: "p has no child, so we take its sibling, a.",
    },
    {
        at: "h1",
        edge: "h1-a",
        move: "parent",
        text: "a has no child or sibling. Climb up to h1, already done, just passing through.",
    },
    {
        at: "h2",
        edge: "h1-h2",
        move: "sibling",
        text: "h1 has a sibling, so h2 is next.",
    },
    {
        at: "div",
        edge: "div-h2",
        move: "parent",
        text: "h2 is a dead end too. Up to div, which has no sibling either.",
    },
    {
        at: "root",
        edge: "root-div",
        move: "parent",
        text: "Up to root, nothing left. The whole tree is done.",
    },
];

const TICK_MS = 1600;
const HOLD_END_MS = 3000;
const DOTTED = { fill: "none", strokeLinecap: "round", strokeDasharray: "0.1 3.5" };

const BUTTON_CLASS =
    "grid size-10 cursor-pointer touch-manipulation place-items-center rounded-full text-dark/55 transition-colors duration-150 [-webkit-tap-highlight-color:transparent] hover:bg-dark/5 hover:text-dark focus-visible:bg-dark/5 focus-visible:text-dark focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent active:bg-dark/9";

const edgeId = (from, to) => `fiber-walk-edge-${from}-${to}`;

/** right-angle connector with rounded bends: down, across, down. */
function elbowPath(x1, y1, x2, y2, radius = 8) {
    if (x1 === x2) return `M${x1} ${y1} V${y2}`;

    const midY = (y1 + y2) / 2;
    const dir = Math.sign(x2 - x1);
    const r = Math.min(radius, Math.abs(x2 - x1) / 2, (y2 - y1) / 2);

    return [
        `M${x1} ${y1}`,
        `V${midY - r}`,
        `Q${x1} ${midY} ${x1 + dir * r} ${midY}`,
        `H${x2 - dir * r}`,
        `Q${x2} ${midY} ${x2} ${midY + r}`,
        `V${y2}`,
    ].join(" ");
}

const EDGES = Object.fromEntries([
    ...TREE_EDGES.map(([from, to]) => [
        edgeId(from, to),
        {
            d: elbowPath(NODES[from].x, NODES[from].y + NODE_H / 2, NODES[to].x, NODES[to].y - NODE_H / 2),
        },
    ]),
    ...SIBLING_EDGES.map(([from, to]) => [
        edgeId(from, to),
        {
            sibling: true,
            d: `M${NODES[from].x + NODE_W / 2 + 4} ${NODES[from].y} H${NODES[to].x - NODE_W / 2 - 4}`,
        },
    ]),
]);

export default function FiberTraversal() {
    useEffect(() => animateTraversal(), []);

    return (
        <figure className="group/walk mb-8" id="fiber-walk">
            <div className="overflow-hidden rounded-2xl border border-light2 bg-light">
                <svg viewBox="0 0 400 280" className="block h-auto w-full" role="img" aria-label="fiber traversal">
                    <defs>
                        {[
                            ["fiber-walk-arrow", "stroke-light3"],
                            ["fiber-walk-arrow-active", "stroke-accent"],
                        ].map(([id, strokeClass]) => (
                            <marker
                                key={id}
                                id={id}
                                viewBox="0 0 10 10"
                                refX="9"
                                refY="5"
                                markerWidth="7"
                                markerHeight="7"
                                orient="auto"
                            >
                                <path
                                    d="M2 1 L9 5 L2 9"
                                    className={strokeClass}
                                    fill="none"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </marker>
                        ))}
                    </defs>

                    {Object.entries(EDGES).map(([id, edge]) => (
                        <path
                            key={id}
                            id={id}
                            className="stroke-light3"
                            d={edge.d}
                            strokeWidth="1"
                            markerEnd={edge.sibling ? "url(#fiber-walk-arrow)" : undefined}
                            {...DOTTED}
                        />
                    ))}

                    <path id="fiber-walk-trail" className="stroke-accent" d="" strokeWidth="1.25" {...DOTTED} />

                    <rect
                        id="fiber-walk-cursor"
                        className="fill-violet-500 [transition:opacity_0.4s_ease] data-ready:[transition:transform_0.6s_cubic-bezier(0.65,0,0.35,1),opacity_0.4s_ease] data-finished:opacity-0 motion-reduce:data-ready:[transition:opacity_0.4s_ease]"
                        x={-NODE_W / 2}
                        y={-NODE_H / 2}
                        width={NODE_W}
                        height={NODE_H}
                        rx="8"
                    />

                    {Object.entries(NODES).map(([name, node]) => (
                        <g key={name} id={`fiber-walk-node-${name}`} className="group">
                            <rect
                                className="fill-gray-100 transition-[fill] duration-350 group-data-[state=done]:fill-violet-100 group-data-[state=current]:fill-transparent"
                                x={node.x - NODE_W / 2}
                                y={node.y - NODE_H / 2}
                                width={NODE_W}
                                height={NODE_H}
                                rx="8"
                            />
                            <text
                                className="fill-dark3 font-mono text-[12px] transition-[fill] duration-350 group-data-[state=done]:fill-violet-600 group-data-[state=current]:fill-light"
                                x={node.x}
                                y={node.y}
                                textAnchor="middle"
                                dominantBaseline="central"
                            >
                                {node.label}
                            </text>
                        </g>
                    ))}
                </svg>

                <div className="border-t border-light2 px-5 pt-4 pb-3">
                    <div id="fiber-walk-caption" className="mb-2 min-h-13 text-base leading-relaxed text-dark/75" />

                    <div className="flex items-center gap-4">
                        <div className="flex flex-1 items-center gap-1" aria-hidden="true">
                            {STEPS.map((_, index) => (
                                <span
                                    key={String(index)}
                                    id={`fiber-walk-tick-${index}`}
                                    className="h-0.5 max-w-6 flex-1 rounded-full bg-light2 transition-colors duration-300 data-[state=done]:bg-light3 data-[state=current]:bg-accent"
                                />
                            ))}
                        </div>
                        <div className="-me-2 flex items-center">
                            <button type="button" id="fiber-walk-prev" className={BUTTON_CLASS} aria-label="Previous step">
                                <Icon icon={ChevronLeft} size={18} />
                            </button>
                            <button type="button" id="fiber-walk-play" className={BUTTON_CLASS} aria-label="Play or pause">
                                <Icon icon={Pause} size={16} className="hidden group-data-playing/walk:block" />
                                <Icon icon={Play} size={16} className="block group-data-playing/walk:hidden" />
                            </button>
                            <button type="button" id="fiber-walk-next" className={BUTTON_CLASS} aria-label="Next step">
                                <Icon icon={ChevronRight} size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <figcaption className="mt-2 text-center text-xs text-gray-500">fig 2.2 - Walking the fiber tree</figcaption>
        </figure>
    );
}

// steps are applied straight to the DOM: a state-driven tick would re-render the whole app every frame.
function animateTraversal() {
    const root = document.getElementById("fiber-walk");
    if (!root) return undefined;

    const byId = (id) => document.getElementById(id);
    const cursor = byId("fiber-walk-cursor");
    const trail = byId("fiber-walk-trail");
    const caption = byId("fiber-walk-caption");
    const playButton = byId("fiber-walk-play");
    const prevButton = byId("fiber-walk-prev");
    const nextButton = byId("fiber-walk-next");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let step = 0;
    let playing = !reducedMotion;
    let visible = false;
    let timer = 0;

    const flow = reducedMotion
        ? null
        : trail.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -3.6 }], {
              duration: 500,
              iterations: Infinity,
          });

    const apply = () => {
        const current = STEPS[step];
        const performed = new Set(
            STEPS.slice(0, step + 1)
                .filter((s) => s.move !== "parent")
                .map((s) => s.at),
        );
        const finished = step === STEPS.length - 1;

        Object.keys(NODES).forEach((name) => {
            const node = byId(`fiber-walk-node-${name}`);
            if (!node) return;
            if (name === current.at && !finished) node.dataset.state = "current";
            else if (performed.has(name)) node.dataset.state = "done";
            else delete node.dataset.state;
        });

        STEPS.forEach((_, index) => {
            const tick = byId(`fiber-walk-tick-${index}`);
            if (!tick) return;
            if (index === step) tick.dataset.state = "current";
            else if (index < step) tick.dataset.state = "done";
            else delete tick.dataset.state;
        });

        const [a, b] = current.edge?.split("-") ?? [];
        const edge = EDGES[edgeId(a, b)] ?? EDGES[edgeId(b, a)];
        trail.setAttribute("d", edge?.d ?? "");
        if (edge?.sibling) trail.setAttribute("marker-end", "url(#fiber-walk-arrow-active)");
        else trail.removeAttribute("marker-end");
        flow?.effect.updateTiming({ direction: current.move === "parent" ? "reverse" : "normal" });

        const { x, y } = NODES[current.at];
        cursor.style.transform = `translate(${x}px, ${y}px)`;
        cursor.toggleAttribute("data-finished", finished);

        if (caption.textContent !== current.text) {
            caption.textContent = current.text;
            if (!reducedMotion) caption.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease-out" });
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
    requestAnimationFrame(() => cursor.toggleAttribute("data-ready", true));

    return () => {
        clearTimeout(timer);
        flow?.cancel();
        observer.disconnect();
        playButton.removeEventListener("click", onPlay);
        prevButton.removeEventListener("click", onPrev);
        nextButton.removeEventListener("click", onNext);
    };
}
