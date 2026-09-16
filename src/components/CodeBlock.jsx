import { useState } from "/src/overreact";

export default function CodeBlock({ code, language, filename }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const label = filename ?? language;

    return (
        <div className="relative my-6 rounded-lg bg-dark2 overflow-hidden border border-dark3/40">
            <div className="flex items-center justify-between px-4 py-2 border-b border-dark3/40">
                <span className="text-xs font-mono text-light3 select-none">{label ?? " "}</span>
                <button
                    onClick={handleCopy}
                    className="text-xs font-mono text-dark3 hover:text-light2 transition-colors px-2 py-0.5 rounded"
                    aria-label="Copy code"
                >
                    {copied ? "copied!" : "copy"}
                </button>
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                <code className="font-mono text-light2">{code}</code>
            </pre>
        </div>
    );
}
