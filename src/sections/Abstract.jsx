import PartSection from "../components/PartSection";

const PARTS = [
    { num: 1, title: "JSX is a lie, and a nice one", subtitle: "createElement and the element tree", id: "part-1" },
    { num: 2, title: "Pixels, finally", subtitle: "rendering to the DOM in ten lines", id: "part-2" },
    { num: 3, title: "The 16.7 millisecond problem", subtitle: "rendering freezes the browser", id: "part-3" },
    { num: 4, title: "A stack you can put down", subtitle: "the work loop can't be paused", id: "part-4" },
    { num: 5, title: "Don't let them see you working", subtitle: "the user sees DOM assembly", id: "part-5" },
    { num: 6, title: "Spot the difference", subtitle: "reconciliation, effect tags, and keys", id: "part-6" },
    { num: 7, title: "Components aren't real", subtitle: "function components and DOM-less fibers", id: "part-7" },
    { num: 8, title: "Your state lives in an array, sorted by arrival", subtitle: "useState, useEffect, and why the rules exist", id: "part-8" },
    { num: "8.5", title: "The art of doing nothing", subtitle: "optional — the bailout path, memo, and the compiler", id: "part-8-5" },
    { num: 9, title: "Limitations and future work", subtitle: "the 29,500 lines we skipped", id: "part-9" },
];

const PATH_CARD_BASE = "rounded-xl border border-dark2 bg-dark2/50 p-5 flex flex-col gap-2 hover:border-accent/40 transition-colors";

export default function Abstract() {
    return (
        <PartSection
            id="abstract"
            paperLabel="Abstract"
            title="React, minus the magic"
            subtitle="what happens between your JSX and the DOM"
        >
            {/* Audience contract */}
            <p className="text-lg leading-relaxed text-light2 border-l-2 border-accent pl-5 py-1">
                This is not a React tutorial. You already write components, you already use hooks.
                This is about what happens between the JSX you type and the DOM the browser paints
                — built from zero, in about 500 lines.
            </p>

            {/* The five-sentence story */}
            <div className="mt-10">
                <h3 className="text-xs font-mono tracking-widest text-dark3 uppercase mb-4">The whole story, in five sentences</h3>
                <ol className="space-y-3">
                    {[
                        "JSX is a function call in disguise.",
                        "Those calls produce a tree of plain objects describing what the UI should look like.",
                        "React turns that description into a second tree of \"fiber\" nodes — a linked list it can pause and resume.",
                        "It walks that tree during browser idle time, figuring out what changed versus last time.",
                        "When it's done figuring, and only then, it touches the real DOM in one burst.",
                    ].map((sentence, i) => (
                        <li key={i} className="flex gap-4 items-start">
                            <span className="shrink-0 mt-0.5 font-mono text-xs text-dark3 w-5 text-right">{i + 1}.</span>
                            <span className="text-light2 leading-relaxed">{sentence}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Is this still worth knowing */}
            <div className="mt-10 rounded-xl bg-dark2/40 border border-dark2 p-6">
                <h3 className="font-serif text-base font-semibold text-light mb-3">Is this still worth knowing in 2026?</h3>
                <p className="text-light2 leading-relaxed text-sm">
                    Server components moved <em>where</em> rendering happens. The React Compiler is removing the need to
                    hand-write <code className="text-accent text-xs">memo</code> and <code className="text-accent text-xs">useCallback</code>.
                    Neither touched the reconciler. Every client component still goes through createElement, fibers,
                    the work loop, and commit, exactly as described here. The compiler changes memoization, not reconciliation
                    — and understanding the bailout path (Part 8.5) is what makes the compiler's behavior legible rather than magical.
                </p>
            </div>

            {/* What you'll be able to do after */}
            <div className="mt-10">
                <h3 className="text-xs font-mono tracking-widest text-dark3 uppercase mb-4">After this, you can</h3>
                <ul className="space-y-2 text-light2">
                    {[
                        <span>Read <code className="text-accent text-sm">ReactFiberWorkLoop.js</code> without flinching.</span>,
                        "Explain why the rules of hooks exist mechanically, not as a rule to memorize.",
                        <span>Explain what <code className="text-accent text-sm">key</code> actually does.</span>,
                        "Explain why a slow render janks the page but a slow commit is worse.",
                    ].map((item, i) => (
                        <li key={i} className="flex gap-3 items-start">
                            <span className="shrink-0 mt-1 size-1.5 rounded-full bg-accent/50" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Three reading paths */}
            <div className="mt-10">
                <h3 className="text-xs font-mono tracking-widest text-dark3 uppercase mb-4">Three ways through</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                    <a href="#abstract" className={PATH_CARD_BASE}>
                        <span className="text-xs font-mono text-dark3">10 minutes</span>
                        <p className="text-sm text-light leading-snug">Abstract, the pipeline overview, and the source map table. Enough to fix the mental model.</p>
                    </a>
                    <a href="#part-1" className={PATH_CARD_BASE}>
                        <span className="text-xs font-mono text-dark3">1 hour</span>
                        <p className="text-sm text-light leading-snug">Read all nine parts. Play with the playgrounds. Skip the coding.</p>
                    </a>
                    <a href="#part-1" className={PATH_CARD_BASE}>
                        <span className="text-xs font-mono text-dark3">An afternoon</span>
                        <p className="text-sm text-light leading-snug">Build each stage yourself, using the "if you're coding along" notes.</p>
                    </a>
                </div>
            </div>

            {/* Table of contents */}
            <div className="mt-10">
                <h3 className="text-xs font-mono tracking-widest text-dark3 uppercase mb-4">Contents — Method</h3>
                <ol className="space-y-px">
                    {PARTS.map((part) => (
                        <li key={part.id}>
                            <a
                                href={`#${part.id}`}
                                className="flex items-baseline gap-4 rounded-lg px-3 py-2.5 hover:bg-dark2/60 transition-colors group"
                            >
                                <span className="shrink-0 font-mono text-xs text-dark3 w-6">{part.num}</span>
                                <span className="flex flex-col sm:flex-row sm:gap-3 sm:items-baseline min-w-0">
                                    <span className="font-medium text-light group-hover:text-accent transition-colors truncate">{part.title}</span>
                                    <span className="text-xs text-dark3 truncate">{part.subtitle}</span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Credit line */}
            <p className="mt-10 text-sm text-dark3">
                Built by following Rodrigo Pombo's{" "}
                <a
                    href="https://pomb.us/build-your-own-react/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light3 underline underline-offset-2 hover:text-light transition-colors"
                >
                    Didact
                </a>.{" "}
                <a href="#credits" className="text-light3 underline underline-offset-2 hover:text-light transition-colors">
                    Full credits below.
                </a>
            </p>
        </PartSection>
    );
}
