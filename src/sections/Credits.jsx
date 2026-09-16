import PartSection from "../components/PartSection";

const GITHUB_ISSUES = "https://github.com/theinfinull/overreact/issues/new";
const DIDACT_URL = "https://pomb.us/build-your-own-react/";
const FIBER_ARCH_URL = "https://github.com/acdlite/react-fiber-architecture";
const IN_THE_LOOP_URL = "https://www.youtube.com/watch?v=cCOL7MC4Pl0";
const LYDIA_VIZ_URL = "https://www.lydiahallie.io/blog/event-loop";
const PAUL_TALK_URL = "https://www.youtube.com/watch?v=_MAD4Oly9yg";

export default function Credits() {
    return (
        <PartSection
            id="credits"
            partNumber={null}
            paperLabel="Related work"
            title="Credits and thanks"
            subtitle=""
            currentPart={null}
        >
            <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold text-light mb-4">Thanks to Didact</h2>

                <div className="p-6 rounded-lg border border-dark2 bg-dark2/20 mb-8 text-light3 leading-relaxed text-sm space-y-4">
                    <p>
                        Overreact exists because of Rodrigo Pombo's{" "}
                        <a
                            href={DIDACT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            Build Your Own React
                        </a>
                        , which walks through writing a tiny React called Didact — named for being purely didactic,
                        which it is, thoroughly. It started as a blog series in 2017 against React's old stack
                        reconciler and was rewritten in 2019 for fibers and hooks, and it's still the clearest
                        explanation of React's internals that exists in any form.
                    </p>
                    <p>
                        The first eight stages of Overreact follow its structure closely enough that calling it an
                        influence would be underselling it — it's the foundation. Everything past that point, and
                        every mistake in it, is mine.
                    </p>
                    <p>
                        If you want the source material rather than my detour through it, go read Didact first.
                        It's free, it's one page, and it's better written than this.
                    </p>
                </div>

                <h2 className="text-xl font-semibold text-light mb-4">Also</h2>

                <ul className="space-y-3 text-light3 text-sm leading-relaxed mb-10">
                    <li>
                        The React source, and{" "}
                        <a
                            href={FIBER_ARCH_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            Andrew Clark's react-fiber-architecture notes
                        </a>
                        , for the vocabulary used throughout.
                    </li>
                    <li>
                        <a
                            href={IN_THE_LOOP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            Jake Archibald's "In The Loop" talk
                        </a>{" "}
                        and{" "}
                        <a
                            href={LYDIA_VIZ_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            Lydia Hallie's event loop visualization
                        </a>
                        , for Part 3. If you want to understand why yielding via Promise.resolve() doesn't give the
                        browser a paint opportunity, start with those.
                    </li>
                    <li>
                        <a
                            href={PAUL_TALK_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            Paul O'Shannessy's "Building React From Scratch" talk
                        </a>
                        , which Didact itself points to. The stack-reconciler era, before fiber.
                    </li>
                </ul>

                <div className="border-t border-dark2 pt-8">
                    <p className="text-light3 text-sm leading-relaxed mb-4">
                        Found an error? The source map table in Part 9 goes stale as React moves files and renames
                        things. The explanations can be wrong too. Corrections are welcome.
                    </p>
                    <a
                        href={GITHUB_ISSUES}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark2 text-light3 text-sm hover:border-accent/40 hover:text-accent transition-colors"
                    >
                        Submit a correction on GitHub
                    </a>
                </div>
            </div>
        </PartSection>
    );
}
