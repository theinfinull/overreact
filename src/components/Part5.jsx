import { AlertCircle, Lightbulb } from "lucide";
import Callout from "./Callout";
import ChapterSource from "./ChapterSource";
import CodeBlock from "./CodeBlock";
import Counter from "./Counter";
import Title from "./Title";

export default function Part5() {
    return (
        <div>
            <Title id="hooks" chapter="Five">
                Hooks
            </Title>
            <p>
                Functions forget. Run a component with <code>let count = 0</code>, increment count in a click handler,
                then run it again - you're back at zero. And changing that local variable doesn't tell our renderer to
                do anything anyway. We need both memory and a way to request another render.
            </p>
            <p>
                That's what <code>useState</code> gives us. The component asks for a state slot; the renderer keeps it between
                renders. Let's give that idea a face. Meet Byte. Byte has exactly one job: getting pressed.
            </p>
            <Counter />
            <CodeBlock title="Byte.jsx">{`
                function Byte() {
                    const [count, setCount] = useState(0)
                    return (
                        <button onClick={() => setCount(n => n + 1)}>
                            {count === 0 ? "Press me!" : "Hey!"} — {count} presses
                        </button>
                    )
                }
            `}</CodeBlock>

            <p>
                Each function fiber gets a <code>hooks</code> array. While calling its component, we remember which
                fiber is rendering and reset a hook index to zero. Each <code>useState</code> call takes the next slot. On the next
                render, the same slot on the alternate fiber holds the previous state.
            </p>
            <CodeBlock title="updateFunctionComponent.js">{`
                let renderingFiber = null
                let hookIndex = 0

                function updateFunctionComponent(fiber) {
                    renderingFiber = fiber
                    hookIndex = 0
                    fiber.hooks = []
                    const result = fiber.type(fiber.props)
                    renderingFiber = null
                    reconcileChildren(fiber, toChildElements([result]))
                }
            `}</CodeBlock>
            <Callout icon={AlertCircle} color="orange">
                Slots have positions, not variable names. Call hooks at the top level, in the same order every render.
                Put one inside an if or loop and the next hook can read the wrong slot. Also, call them only from
                components or custom hooks while a component is rendering.
            </Callout>

            <p>
                The setter doesn't edit this render's count. It queues an action and asks the renderer to prepare
                another tree from <code>currentRoot</code>. Next time the component runs, <code>useState</code> picks
                up the previous state, replays the queued actions on it, and returns the result. An action is either a
                new value or an updater function like <code>n =&gt; n + 1</code>.
            </p>
            <CodeBlock title="useState.js">{`
                function useState(initialState) {
                    if (!renderingFiber) throw new Error("useState needs a rendering component")
                    const oldHook = renderingFiber.alternate?.hooks?.[hookIndex]
                    const queue = oldHook?.queue ?? []
                    // snapshot: actions queued after this point stay queued for the next render
                    const pending = queue.slice()
                    let state = oldHook ? oldHook.state
                        : typeof initialState === "function" ? initialState() : initialState

                    for (const action of pending) {
                        state = typeof action === "function" ? action(state) : action
                    }

                    const setState = oldHook?.dispatch ?? (action => {
                        queue.push(action)
                        scheduleUpdate()
                    })
                    const hook = {
                        state, queue, dispatch: setState,
                        // only drop the applied actions once committed, so a restarted render can replay them
                        commit: () => queue.splice(0, pending.length),
                    }
                    renderingFiber.hooks.push(hook)
                    hookIndex++
                    return [state, setState]
                }
            `}</CodeBlock>
            <p>
                Why not empty the queue the moment we use it? Because a render can be thrown away and restarted before
                it commits. If the queue were already drained, the restarted render would begin from the old state and
                the click would vanish. So each hook remembers which actions it applied, and the commit removes exactly
                those. Anything queued in the meantime stays for the next render. The queue array itself is shared from
                render to render, and so is the <code>setState</code> function, which is why a stale closure can still
                call it safely.
            </p>

            <p>
                <code>scheduleUpdate</code> starts a fresh work-in-progress root from <code>currentRoot</code>'s DOM and
                props, with <code>currentRoot</code> as its alternate. That reruns components, reconciles their
                elements, and commits changes. It doesn't replace every node. <code>render</code> now shares the same{" "}
                <code>startRender</code> helper.
            </p>
            <CodeBlock title="scheduleUpdate.js">{`
                function scheduleUpdate() {
                    if (!currentRoot) return
                    startRender({
                        dom: currentRoot.dom,
                        props: currentRoot.props,
                        alternate: currentRoot,
                    })
                }

                // a fresh work-in-progress root, replacing any unfinished one
                function startRender(root) {
                    wipRoot = root
                    deletions = []
                    nextUnitOfWork = wipRoot
                    scheduleWork()
                }
            `}</CodeBlock>

            <p>
                Try the two small buttons on Byte's console. "+3 QUEUED" makes three{" "}
                <code>{"setCount(n => n + 1)"}</code> calls, and each builds on the previous result. "+3 STALE" makes
                three <code>setCount(count + 1)</code> calls, which all queue the same value from this render's
                snapshot, giving just +1.
            </p>
            <p>
                State also belongs to the component's place in the tree. Flip the power switch to remove Byte, and its
                memory goes with it. That's the same "different function or missing, so throw it away" rule from the
                last chapter.
            </p>

            <p>
                State describes the UI. Sometimes a component also needs to synchronize with something outside that UI:
                a browser event, a subscription, or <code>document.title</code>. Doing that during rendering is awkward - we might
                pause or abandon that work before it ever reaches the screen.
            </p>
            <p>
                <code>useEffect</code> takes the next hook slot too, storing its dependencies and cleanup. It compares the
                dependencies with the previous slot using <code>Object.is</code>. If they changed, it records a commit
                callback that runs the old cleanup, calls the effect, and saves the cleanup it returns. Here's how we'd
                use it:
            </p>

            <CodeBlock title="Byte.jsx — syncing with the browser">{`
                useEffect(() => {
                    const previousTitle = document.title
                    document.title = count + " presses — Overreact"
                    return () => { document.title = previousTitle }
                }, [count])
            `}</CodeBlock>
            <CodeBlock title="useEffect.js">{`
                function useEffect(effect, deps) {
                    if (!renderingFiber) throw new Error("useEffect needs a rendering component")
                    const oldHook = renderingFiber.alternate?.hooks?.[hookIndex]
                    const hook = { deps, cleanup: oldHook?.cleanup }

                    if (depsChanged(oldHook?.deps, deps)) {
                        hook.commit = () => {
                            runCleanup(hook)
                            const cleanup = effect()
                            hook.cleanup = typeof cleanup === "function" ? cleanup : undefined
                        }
                    }
                    hook.unmount = () => runCleanup(hook)

                    renderingFiber.hooks.push(hook)
                    hookIndex++
                }

                function runCleanup(hook) {
                    hook.cleanup?.()
                    hook.cleanup = undefined
                }

                // no deps array (or no previous render) means run every commit
                function depsChanged(oldDeps, deps) {
                    if (!oldDeps || !deps) return true
                    return oldDeps.length !== deps.length || deps.some((dep, i) => !Object.is(dep, oldDeps[i]))
                }
            `}</CodeBlock>
            <p>
                Nothing runs during render. The effect is only recorded on the hook, and the commit phase walks the
                finished tree to call it. Deleted subtrees get a similar walk first, so effects can clean up before
                their DOM disappears.
            </p>
            <CodeBlock title="commit.js — running effects">{`
                function commitRoot() {
                    deletions.forEach(commitWork)
                    commitWork(wipRoot.child)
                    const committed = wipRoot
                    currentRoot = committed
                    wipRoot = null
                    deletions = []

                    // after wipRoot is cleared, so an effect calling setState can start a new render
                    visitHooks(committed, "commit")
                }

                // in commitWork, for a deleted fiber, before its dom is removed:
                visitHooks(fiber, "unmount")

                function visitHooks(fiber, callback) {
                    fiber.hooks?.forEach((hook) => hook[callback]?.())
                    for (let child = fiber.child; child; child = child.sibling) {
                        visitHooks(child, callback)
                    }
                }
            `}</CodeBlock>
            <p>The dependency array decides when an effect runs:</p>
            <ul>
                <li>No dependency array: run after every commit.</li>
                <li>
                    <code>[]</code>: run when it mounts; clean up when it unmounts.
                </li>
                <li>
                    <code>[count]</code>: run on mount and when count changes, comparing with <code>Object.is</code>.
                </li>
            </ul>
            <Callout icon={Lightbulb} color="blue">
                Our effects run synchronously at the end of commit. React schedules passive effects separately; we're
                teaching dependencies and cleanup, not its exact timing.
            </Callout>
            <p>
                And that's a hook. No secret syntax inside JavaScript - just an ordered record on a fiber, and a
                renderer that knows when to read it, update it, and clean it up. Byte can finally remember your pokes.
            </p>
            <ChapterSource
                eyebrow="Version Five"
                title="Source Till Now"
                zipHref="/examples/overreact-chap5.zip"
                stackblitzHref="https://stackblitz.com/edit/overreact-chap5?file=src%2Fmain.jsx"
            >
                Here's the complete project at this stopping point. Download it, unzip it, and run{" "}
                <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
