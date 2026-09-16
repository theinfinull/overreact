const STAGES = [
    { id: "jsx", label: "JSX", part: 0 },
    { id: "createelement", label: "createElement", part: 1 },
    { id: "element-tree", label: "element tree", part: 1 },
    { id: "fiber-tree", label: "fiber tree", part: 4 },
    { id: "work-loop", label: "work loop", part: 3 },
    { id: "commit", label: "commit", part: 5 },
    { id: "dom", label: "DOM", part: 2 },
];

export default function Pipeline({ currentPart }) {
    return (
        <div className="overflow-x-auto py-4" aria-label="Pipeline progress">
            <div className="flex items-center gap-0 min-w-max">
                {STAGES.map((stage, index) => {
                    const isDone = stage.part < currentPart;
                    const isCurrent = stage.part === currentPart;
                    const isFuture = stage.part > currentPart;

                    return (
                        <div key={stage.id} className="flex items-center">
                            <div
                                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-mono whitespace-nowrap transition-colors ${
                                    isCurrent
                                        ? "bg-accent/10 text-accent border border-accent/40"
                                        : isDone
                                          ? "text-light3"
                                          : "text-dark3 opacity-40"
                                }`}
                            >
                                {isDone && <span className="text-[10px]">✓</span>}
                                {stage.label}
                            </div>
                            {index < STAGES.length - 1 && (
                                <span
                                    className={`px-1.5 text-xs select-none ${isFuture && !isCurrent ? "text-dark3 opacity-30" : "text-dark3"}`}
                                >
                                    →
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
