import { useState } from "../overreact";

const START = ["h1", "p", "input"];
const MAX_SLOTS = 5;
const TAG_COLOR = {
    update: "text-violet-600",
    replace: "text-orange-600",
    placement: "text-green-600",
};

// the same position-by-position comparison reconcileChildren makes
const tagFor = (before, after) => (!before ? "placement" : before === after ? "update" : "replace");

function Live({ type }) {
    if (type === "h1") return <h1 className="text-lg font-semibold text-dark">Heading</h1>;
    if (type === "p") return <p className="m-0! text-sm! text-dark/60">A paragraph of text.</p>;
    return (
        <input
            className="w-full max-w-64 rounded-lg border border-light2 bg-white px-3 py-1.5 text-sm outline-none focus:border-violet-400"
            placeholder="Type something…"
        />
    );
}

const action =
    "cursor-pointer rounded-full border border-light2 px-3 py-1.5 text-sm text-dark/70 transition-colors " +
    "hover:border-violet-300 hover:text-violet-700 disabled:cursor-default disabled:opacity-40 disabled:hover:border-light2 disabled:hover:text-dark/70";

export default function ReconciliationDemo() {
    const [children, setChildren] = useState(START);
    const [previous, setPrevious] = useState(null);
    const [version, setVersion] = useState(0);

    const apply = (next) => {
        setPrevious(children);
        setChildren(next);
        setVersion((v) => v + 1);
    };
    const reset = () => {
        setPrevious(null);
        setChildren(START);
        setVersion((v) => v + 1);
    };

    const removed = previous?.slice(children.length) ?? [];
    const lostInput = previous?.some((type, slot) => type === "input" && children[slot] !== "input");

    return (
        <figure className="mb-8">
            <div className="rounded-2xl border border-light2 bg-light">
                <div className="divide-y divide-light2 px-5">
                    {children.map((type, slot) => {
                        const tag = previous ? tagFor(previous[slot], type) : "";
                        return (
                            <div key={String(slot)} className="flex min-h-14 items-center gap-4 py-3">
                                <span className="w-3 font-mono text-xs text-dark/30">{slot}</span>
                                <div className="min-w-0 flex-1">
                                    <Live type={type} />
                                </div>
                                <span
                                    className={`font-mono text-xs ${TAG_COLOR[tag] ?? ""} ${version % 2 ? "animate-pop" : "animate-pop-again"}`}
                                >
                                    {tag}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {removed.length > 0 && (
                    <div className="flex flex-wrap gap-3 px-5 pb-3 font-mono text-xs text-dark/35">
                        {removed.map((type, index) => (
                            <span key={String(index)} className="line-through">{`<${type}>`} deleted</span>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-light2 px-5 py-4">
                    <button type="button" className={action} disabled={children.length >= MAX_SLOTS} onClick={() => apply(["h1", ...children])}>
                        Insert at top
                    </button>
                    <button type="button" className={action} disabled={children.length >= MAX_SLOTS} onClick={() => apply([...children, "p"])}>
                        Add to end
                    </button>
                    <button type="button" className={action} disabled={children.length === 0} onClick={() => apply(children.slice(1))}>
                        Remove first
                    </button>
                    <button type="button" className="ml-auto cursor-pointer text-sm text-dark/40 hover:text-dark" onClick={reset}>
                        Reset
                    </button>
                </div>
                <div className="px-5 pb-4 text-sm text-dark/55" aria-live="polite">
                    {lostInput
                        ? "The input's slot now holds a different type, so it was replaced, and your text went with it."
                        : "Type into the input, then insert at top."}
                </div>
            </div>
            <figcaption className="mt-2 text-center text-xs text-gray-500">fig 3.1 - Matching children by position</figcaption>
        </figure>
    );
}
