import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const workLoopCode = `let wipRoot = null;
let currentRoot = null;

function workLoop(deadline) {
    while (nextUnitOfWork && deadline.timeRemaining() > 1) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

function commitRoot() {
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) return;

    const domParent = findDomParent(fiber);
    if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
        domParent.appendChild(fiber.dom);
    }

    commitWork(fiber.child);
    commitWork(fiber.sibling);
}`;

export default function Part5() {
    return (
        <PartSection
            id="part-5"
            partNumber={5}
            paperLabel="Method — Part 5"
            title="Don't let them see you working"
            subtitle="render phase and commit phase"
            currentPart={5}
        >
            <p className="text-xl text-light2 leading-relaxed mb-8">
                How do you avoid ever showing a half-finished UI?
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                Right now the user watches the UI assemble itself, piece by piece, like a magic trick performed badly.
                We're going to add a curtain.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-10 mb-4">Two phases</h2>

            <p className="text-light2 leading-relaxed mb-4">
                Split the work in two. The <strong className="text-light">render phase</strong> walks the fiber tree,
                computes what the DOM should look like, and touches absolutely nothing real. It can be paused,
                resumed, restarted, or discarded entirely. The{" "}
                <strong className="text-light">commit phase</strong> applies all DOM mutations in one synchronous,
                uninterruptible pass.
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                The implementation follows from that split. Stop appending inside{" "}
                <code className="font-mono text-accent text-sm">performUnitOfWork</code>. Instead, build everything
                into a work-in-progress root (<code className="font-mono text-accent text-sm">wipRoot</code>).
                When <code className="font-mono text-accent text-sm">nextUnitOfWork</code> is null and{" "}
                <code className="font-mono text-accent text-sm">wipRoot</code> still exists, the tree is
                complete — call <code className="font-mono text-accent text-sm">commitRoot</code>, which walks the whole
                thing and applies changes, then clears <code className="font-mono text-accent text-sm">wipRoot</code>.
            </p>

            <CodeBlock code={workLoopCode} language="js" filename="renderer.js" />

            <h2 className="text-2xl font-semibold text-light mt-12 mb-4">Three consequences that follow</h2>

            <p className="text-light2 leading-relaxed mb-4">
                <strong className="text-light">Render must be pure.</strong> The render phase can be discarded at
                any point. A function that writes to the DOM during render would leave the DOM in an inconsistent
                state when the render is thrown away. StrictMode double-invokes your render functions in development
                specifically to catch this. You've seen the rule; here's the mechanism it comes from.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                <strong className="text-light">Commit cannot be interrupted.</strong> A slow render janks — the
                browser yields mid-render, frames drop, but input stays responsive. A slow commit is worse: the frame
                holds until commit finishes, no matter how long that takes. There is no yielding inside commit.
                This is the reason "keep your commit work fast" is a separate concern from "keep your render fast."
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                <strong className="text-light">A component can render and never commit.</strong> Its{" "}
                <code className="font-mono text-accent text-sm">console.log</code> ran. Its{" "}
                <code className="font-mono text-accent text-sm">useEffect</code> did not. The render phase executed
                and was discarded before commit ever happened. This is the mechanism behind "why did my component
                render twice but only mount once" — not a bug, just the curtain falling on work that was
                thrown away.
            </p>

            <div className="border-l-2 border-dark3 pl-6 my-8">
                <p className="text-light3 text-sm leading-relaxed">
                    <code className="font-mono text-accent text-sm">flushSync</code> forces an immediate synchronous
                    render and commit, bypassing the work loop entirely. If you find yourself reaching for it, you
                    almost certainly wanted <code className="font-mono text-accent text-sm">useLayoutEffect</code>{" "}
                    instead.
                </p>
            </div>

            <div className="mt-10 p-6 rounded-lg border border-dark2 bg-dark2/30">
                <h3 className="text-lg font-semibold text-light mb-2">Where this breaks</h3>
                <p className="text-light2 leading-relaxed">
                    Re-render with changed data and everything is appended again. The commit path has one case: append.
                    There is no update case, no delete case. We compare the new tree with nothing, because we've never
                    looked at the previous tree.
                </p>
            </div>

            <Collapsible summary="Real React — commitRoot phases" variant="footnote">
                <p className="text-light3 leading-relaxed text-sm">
                    React's commit phase has three sub-phases. Before-mutation runs{" "}
                    <code className="font-mono text-xs">getSnapshotBeforeUpdate</code> for class components. Mutation
                    is where the actual DOM changes happen — this is where our{" "}
                    <code className="font-mono text-xs">commitWork</code> lives. Layout runs{" "}
                    <code className="font-mono text-xs">useLayoutEffect</code> synchronously after mutation, before
                    the browser has painted. Passive effects (
                    <code className="font-mono text-xs">useEffect</code>) run asynchronously after the browser has
                    had a chance to paint — that's why layout effects can measure DOM geometry without flickering, and
                    why passive effects are the default. Source:{" "}
                    <code className="font-mono text-xs">packages/react-reconciler/src/ReactFiberCommitWork.js</code>.
                </p>
            </Collapsible>

            <Collapsible summary="If you're coding along" variant="warning">
                <p className="text-light3 leading-relaxed text-sm">
                    Forgetting to null out <code className="font-mono text-xs">wipRoot</code> after commit is the most
                    reliably painful bug at this stage. If you forget, the work loop sees a non-null{" "}
                    <code className="font-mono text-xs">wipRoot</code> every idle tick and re-commits the same tree
                    indefinitely. The symptom is infinite DOM appending — your tree appears duplicated hundreds of
                    times per second. The fix is one line:{" "}
                    <code className="font-mono text-xs">wipRoot = null</code> at the end of{" "}
                    <code className="font-mono text-xs">commitRoot</code>.
                </p>
            </Collapsible>
        </PartSection>
    );
}
