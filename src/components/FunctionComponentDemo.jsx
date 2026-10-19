import { ChevronDown } from "lucide";
import { useEffect, useState } from "../overreact";
import Icon from "./Icon";

const MOODS = ["wave", "cheer", "shy"];

function Greeting({ name, mood }) {
    const who = name || "…";
    if (mood === "shy") return <p className="m-0! text-sm! text-dark/60">um… hi, {who}</p>;
    if (mood === "cheer") return <h1 className="text-xl font-bold tracking-tight text-violet-600">HEY {who.toUpperCase()}!!</h1>;
    return <h1 className="text-lg font-semibold text-dark">Hey, {who}!</h1>;
}

const field =
    "inline-flex items-center rounded-md border border-accent bg-transparent px-2 align-baseline font-mono text-xs text-accent outline-none";

function MoodPicker({ mood, onChange }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return undefined;
        const close = () => setOpen(false);
        const onKey = (event) => event.key === "Escape" && close();
        document.addEventListener("click", close);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("click", close);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <span className="relative inline-block">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={(event) => {
                    // keep the document listener from closing the menu this click opened
                    event.stopPropagation();
                    setOpen(!open);
                }}
                className={`${field} cursor-pointer gap-1`}
            >
                {mood}
                <Icon icon={ChevronDown} size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <span
                role="listbox"
                className={`absolute left-0 top-full z-10 mt-1 flex min-w-full flex-col rounded-lg border border-light2 bg-white p-1 shadow-lg transition ${
                    open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                }`}
            >
                {MOODS.map((option) => (
                    <button
                        key={option}
                        type="button"
                        role="option"
                        aria-selected={option === mood}
                        onClick={() => onChange(option)}
                        className={`cursor-pointer rounded-md px-2 py-1 text-left font-mono text-xs ${
                            option === mood ? "bg-violet-50 text-accent" : "text-dark/70 hover:bg-gray-100"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </span>
        </span>
    );
}

export default function FunctionComponentDemo() {
    const [name, setName] = useState("Byte");
    const [mood, setMood] = useState("wave");

    return (
        <figure className="mb-8">
            <div className="rounded-2xl border border-light2 bg-light">
                <div className="grid items-center gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2">
                    <div className="font-mono text-sm leading-loose text-dark/40">
                        {"<"}
                        <span className="text-dark">Greeting</span>
                        {" name="}
                        <input
                            value={name}
                            placeholder="_"
                            maxLength={10}
                            onInput={(event) => setName(event.target.value)}
                            aria-label="name prop"
                            className={`${field} w-24`}
                        />
                        {" mood="}
                        <MoodPicker mood={mood} onChange={setMood} />
                        {" />"}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <Greeting name={name} mood={mood} />
                        </div>
                        <span className="font-mono text-xs text-dark/30">{mood === "shy" ? "<p>" : "<h1>"}</span>
                    </div>
                </div>
                <div className="border-t border-light2 px-5 py-3 text-sm text-dark/55">
                    Edit the name or pick a mood. Greeting never reaches the DOM itself, only the element it returns does.
                </div>
            </div>
            <figcaption className="mt-2 text-center text-xs text-gray-500">fig 4.1 - One function, different props</figcaption>
        </figure>
    );
}
