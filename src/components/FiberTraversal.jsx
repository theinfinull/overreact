import { useEffect } from "../overreact";
import { playSteps, setDataState } from "../util/stepPlayer";
import StepControls from "./StepControls";

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

const DOTTED = { fill: "none", strokeLinecap: "round", strokeDasharray: "0.1 3.5" };

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

                    {Object.entries(NODES).map(([name, node]) => (
                        <g key={name} id={`fiber-walk-node-${name}`} className="group">
                            <rect
                                className="fill-gray-100 transition-[fill] duration-350 group-data-[state=done]:fill-violet-100 group-data-[state=current]:fill-violet-500"
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

                <StepControls prefix="fiber-walk" count={STEPS.length} />
            </div>
            <figcaption className="mt-2 text-center text-xs text-gray-500">fig 2.3 - Walking the fiber tree</figcaption>
        </figure>
    );
}

function animateTraversal() {
    const byId = (id) => document.getElementById(id);
    const trail = byId("fiber-walk-trail");
    if (!trail) return undefined;

    const flow = trail.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -3.6 }], {
        duration: 500,
        iterations: Infinity,
    });

    const stop = playSteps({
        prefix: "fiber-walk",
        steps: STEPS,
        tickMs: 1600,
        holdMs: 3000,
        onStep: (current, step) => {
            const performed = new Set(
                STEPS.slice(0, step + 1)
                    .filter((s) => s.move !== "parent")
                    .map((s) => s.at),
            );
            const finished = step === STEPS.length - 1;

            Object.keys(NODES).forEach((name) => {
                const state =
                    name === current.at && !finished ? "current" : performed.has(name) ? "done" : undefined;
                setDataState(byId(`fiber-walk-node-${name}`), state);
            });

            const [a, b] = current.edge?.split("-") ?? [];
            const edge = EDGES[edgeId(a, b)] ?? EDGES[edgeId(b, a)];
            trail.setAttribute("d", edge?.d ?? "");
            if (edge?.sibling) trail.setAttribute("marker-end", "url(#fiber-walk-arrow-active)");
            else trail.removeAttribute("marker-end");
            flow.effect.updateTiming({ direction: current.move === "parent" ? "reverse" : "normal" });
        },
    });

    return () => {
        flow.cancel();
        stop?.();
    };
}
