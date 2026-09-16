import { useState } from "/src/overreact";

export default function Collapsible({ summary, children, variant }) {
    const [open, setOpen] = useState(false);

    const borderColor = variant === "warning" ? "border-yellow-700/50" : "border-dark3";
    const labelPrefix = variant === "footnote" ? "Real React ↗  " : variant === "warning" ? "If you're coding along  " : "";

    return (
        <div className={`my-6 border-l-2 ${borderColor} pl-4`}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-sm text-light3 hover:text-light2 transition-colors w-full text-left"
            >
                <span className="text-[10px] select-none">{open ? "▼" : "▶"}</span>
                <span className="font-mono text-xs text-dark3 mr-1">{labelPrefix}</span>
                <span>{summary}</span>
            </button>
            {open && (
                <div className="mt-4 text-sm text-light2 leading-relaxed space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
}
