import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const workLoopCode = `let nextUnitOfWork = null;
let wipRoot = null;

function workLoop(deadline) {
    while (nextUnitOfWork && deadline.timeRemaining() > 1) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    // only reschedule if there's pending work
    if (nextUnitOfWork || wipRoot) {
        requestIdleCallback(workLoop);
    }
}

requestIdleCallback(workLoop);`;

export default function Part3() {
    return (
        <PartSection
            id="part-3"
            partNumber={3}
            paperLabel="Method — Part 3"
            title="The 16.7 millisecond problem"
            subtitle="why one big render freezes everything"
            currentPart={3}
        >
            {/* The question */}
            <p className="font-mono text-sm text-dark3 italic">
                The render worked. So why does React need a scheduler at all?
            </p>

            {/* Opening */}
            <p className="mt-6 text-light2 leading-relaxed">
                The renderer works. It also holds the main thread hostage until it's finished, which your users
                will experience as their cursor stopping.
            </p>
            <p className="mt-2 text-light2 leading-relaxed">
                Nothing is broken. The browser simply never gets a turn.
            </p>

            {/* The frame budget */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The 16.7ms frame budget</h3>
                <p className="text-light2 leading-relaxed">
                    60fps means one frame every 16.7ms. JavaScript on the main thread is not preemptible: once your
                    recursive render starts, the browser cannot paint, cannot run animations, cannot respond to input
                    until it returns. The recursion runs to completion. The browser waits.
                </p>
                <div className="mt-4 rounded-lg border border-dark2 bg-dark2/30 p-4">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex-1 h-6 rounded bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-mono text-accent">
                            JavaScript — render (500ms)
                        </div>
                    </div>
                    <div className="mt-2 flex gap-1">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="flex-1 h-4 rounded-sm bg-dark3/30 border border-dark2 relative">
                                {i < 29 && <span className="absolute -right-px top-0 bottom-0 w-px bg-dark2" />}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-dark3 mt-2">Frames that never painted. Each slot is ~16.7ms.</p>
                </div>
            </div>

            {/* INP and long tasks */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">Long tasks and INP</h3>
                <p className="text-light2 leading-relaxed">
                    Anything over 50ms is a long task — the thing marked red in Chrome DevTools and Lighthouse. The
                    metric that captures this is <strong className="text-light">INP</strong> (Interaction to Next Paint):
                    it measures time from click to the next paint, not just time to run the handler.
                </p>
                <p className="mt-3 text-light2 leading-relaxed">
                    A render that blocks for 200ms is an INP of 200ms, even if the click handler itself was instant.
                    Everything in this part is upstream of a number the reader has probably already seen go red.
                </p>
            </div>

            {/* The solution */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The fix: yield between units</h3>
                <p className="text-light2 leading-relaxed">
                    Stop doing all the work at once. Break rendering into units. Do one unit. Check whether the
                    browser needs the thread back.
                </p>
                <p className="mt-2 text-light2 leading-relaxed">
                    If yes: schedule the next unit and return. The browser paints, handles events, and calls you
                    again when it has spare time. If no: continue immediately to the next unit.
                </p>
            </div>

            {/* requestIdleCallback */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">requestIdleCallback</h3>
                <p className="text-light2 leading-relaxed mb-4">
                    <code className="text-accent text-sm">requestIdleCallback(callback)</code> calls your callback with
                    a <code className="text-accent text-sm">deadline</code> object at the end of a frame, when the browser
                    has spare time. <code className="text-accent text-sm">deadline.timeRemaining()</code> tells you how many
                    milliseconds remain. Loop while there's work and budget; stop and re-schedule when either runs out.
                </p>
                <CodeBlock code={workLoopCode} language="js" filename="src/overreact/renderer.js" />
            </div>

            {/* Honest about rIC */}
            <div className="mt-8 rounded-xl border border-dark2 bg-dark2/30 p-5">
                <p className="text-xs font-mono tracking-widest text-dark3 uppercase mb-3">Be honest: what React actually uses</p>
                <p className="text-sm text-light2 leading-relaxed">
                    <code className="text-accent text-xs">requestIdleCallback</code> is not in Safari. The granularity
                    is coarse — slices can be up to 50ms. React does not use it.
                </p>
                <p className="mt-3 text-sm text-light2 leading-relaxed">
                    React ships its own Scheduler package built on{" "}
                    <code className="text-accent text-xs">MessageChannel</code> and{" "}
                    <code className="text-accent text-xs">postMessage</code>, with priority lanes so a user click can jump
                    ahead of a background re-render. We use <code className="text-accent text-xs">requestIdleCallback</code>{" "}
                    because it makes the idea visible in five lines. The concept is what matters.
                </p>
                <p className="mt-3 text-sm text-light3 leading-relaxed">
                    Why not <code className="text-accent text-xs">Promise.resolve().then()</code>? A microtask doesn't
                    give the browser a chance to paint. Microtasks drain before the task queue is checked, so the browser
                    never gets a turn.
                </p>
            </div>

            {/* Break it */}
            <div className="mt-10 rounded-xl border border-dark2/80 bg-dark/60 p-5">
                <p className="text-xs font-mono tracking-widest text-dark3 uppercase mb-2">Break it</p>
                <p className="text-light2">
                    <code className="text-accent text-sm">performUnitOfWork</code> is called and there's nothing it
                    can do.
                </p>
                <p className="mt-2 text-light2">
                    "One unit of work" is undefined. The recursive call stack was the thing tracking where we are in
                    the tree — and we just threw it away. We need a data structure that remembers position across pauses.
                </p>
            </div>

            {/* Collapsibles */}
            <div className="mt-6 space-y-3">
                <Collapsible summary="Real React — the Scheduler package" variant="footnote">
                    <p className="text-sm text-light2 leading-relaxed">
                        React's Scheduler uses <code className="text-accent text-xs">MessageChannel</code> to post a message
                        to itself, processed as a task (not a microtask), giving the browser a chance to paint between them.
                        Priority lanes (<code className="text-accent text-xs">SyncLane</code>,{" "}
                        <code className="text-accent text-xs">DefaultLane</code>,{" "}
                        <code className="text-accent text-xs">IdleLane</code>, etc.) let a synchronous update skip the queue
                        entirely. <code className="text-accent text-xs">shouldYieldToHost</code> checks whether 5ms has elapsed
                        since work started. Source:{" "}
                        <code className="text-accent text-xs">packages/scheduler/src/forks/Scheduler.js</code>.
                    </p>
                </Collapsible>

                <Collapsible summary="If you're coding along" variant="warning">
                    <p className="text-sm text-light2 leading-relaxed">
                        A common mistake is calling{" "}
                        <code className="text-accent text-xs">requestIdleCallback(workLoop)</code> inside{" "}
                        <code className="text-accent text-xs">workLoop</code> unconditionally — it keeps scheduling even
                        after the tree is fully committed. Track whether there's pending work and only re-schedule when
                        there is. The symptom is a render that never ends and progressively consumes more memory.
                    </p>
                </Collapsible>
            </div>
        </PartSection>
    );
}
