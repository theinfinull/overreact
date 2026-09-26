const KEYWORDS = new Set([
    "as",
    "async",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "from",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "let",
    "new",
    "null",
    "of",
    "return",
    "static",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
]);

const TOKEN_RE =
    /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(`(?:\\.|[^`\\])*`)|(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(\b[A-Za-z_$][\w$]*\b)/g;

const highlightCache = new Map();

function dedent(raw) {
    let text = String(raw).replace(/\r\n/g, "\n");
    if (text.startsWith("\n")) text = text.slice(1);
    text = text.replace(/[ \t]*$/, "");

    const lines = text.split("\n");
    const nonempty = lines
        .map((line, index) => ({ line, index, indent: line.match(/^[ \t]*/)[0].length }))
        .filter(({ line }) => line.trim());
    if (nonempty.length === 0) return text;

    const rest = nonempty.slice(1);
    const min =
        rest.length > 0 && nonempty[0].indent === 0
            ? Math.min(...rest.map(({ indent }) => indent))
            : Math.min(...nonempty.map(({ indent }) => indent));

    return lines
        .map((line, index) => {
            if (index === nonempty[0].index && nonempty[0].indent === 0 && rest.length > 0) return line;
            const indent = line.match(/^[ \t]*/)[0].length;
            return line.slice(Math.min(min, indent));
        })
        .join("\n")
        .replace(/\s+$/, "");
}

function codeFromChildren(children) {
    if (children == null) return "";
    if (typeof children === "string" || typeof children === "number") return dedent(children);
    if (!Array.isArray(children)) return dedent(children.props?.nodeValue ?? "");

    let code = "";
    for (const child of children) {
        if (child == null) continue;
        if (typeof child === "string" || typeof child === "number") {
            code += child;
        } else {
            code += child.props?.nodeValue ?? "";
        }
    }
    return dedent(code);
}

function highlightKeywords(code) {
    const cached = highlightCache.get(code);
    if (cached) return cached;

    const nodes = [];
    let last = 0;
    let plain = "";
    let keywordIndex = 0;

    const flushPlain = () => {
        if (plain) {
            nodes.push(plain);
            plain = "";
        }
    };

    for (const match of code.matchAll(TOKEN_RE)) {
        if (match.index > last) {
            plain += code.slice(last, match.index);
        }

        const value = match[0];
        const isComment = match[4] != null || match[5] != null;

        if (isComment) {
            flushPlain();
            nodes.push(
                <span key={String(keywordIndex++)} className="text-[#6A9955]">
                    {value}
                </span>,
            );
        } else if (KEYWORDS.has(value)) {
            flushPlain();
            nodes.push(
                <span key={String(keywordIndex++)} className="text-accent">
                    {value}
                </span>,
            );
        } else {
            plain += value;
        }

        last = match.index + value.length;
    }

    if (last < code.length) {
        plain += code.slice(last);
    }
    flushPlain();

    highlightCache.set(code, nodes);
    return nodes;
}

export default function CodeBlock({ children, title, className = "" }) {
    return (
        <figure className={`mb-8 overflow-hidden rounded-2xl bg-dark text-light ${className}`.trim()}>
            {title && (
                <figcaption className="border-b border-dark2 px-4 py-2 font-mono text-xs tracking-wide text-light3">
                    {title}
                </figcaption>
            )}
            <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed">
                <code className="font-mono text-light2">{highlightKeywords(codeFromChildren(children))}</code>
            </pre>
        </figure>
    );
}
