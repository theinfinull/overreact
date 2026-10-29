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
                another tree from <code>currentRoot</code>. Next time the component runs, <code>useState</code> applies the queued actions to the
                previous state and returns the new value.
            </p>
            <CodeBlock title="useState.js">{`
                function useState(initialState) {
                    if (!renderingFiber) throw new Error("useState needs a rendering component")
                    const oldHook = renderingFiber.alternate?.hooks?.[hookIndex]
                    const queue = oldHook?.queue ?? []
                    let state = oldHook ? oldHook.state
                        : typeof initialState === "function" ? initialState() : initialState
                    const processed = queue.length

                    for (const action of queue.slice(0, processed)) {
                        state = typeof action === "function" ? action(state) : action
                    }

                    const setState = oldHook?.dispatch ?? (action => {
                        queue.push(action)
                        scheduleUpdate()
                    })
                    const hook = {
                        state, queue, dispatch: setState,
                        commit: () => queue.splice(0, processed),
                    }
                    renderingFiber.hooks.push(hook)
                    hookIndex++
                    return [state, setState]
                }
            `}</CodeBlock>
            <p>
                That queue is shared with the previous hook, but the new state lives on a new hook object. Only clear
                processed actions after committing. If unfinished rendering gets restarted, the old committed state and
                the queued actions are still there to replay. Otherwise a fast click could vanish.
            </p>

            <p>
                <code>scheduleUpdate</code> starts a fresh work-in-progress root from <code>currentRoot</code>'s DOM and props,
                with <code>currentRoot</code> as its alternate. That reruns components, reconciles their elements, and commits changes -
                it doesn't replace every node. The full helper is in the final source.
            </p>

            <p>
                Try the two small buttons on Byte's console. "+3 QUEUED" makes three{" "}
                <code>{"setCount(n => n + 1)"}</code> calls, and each builds on the previous result. "+3 STALE" makes
                three <code>setCount(count + 1)</code> calls, which all queue the same value from this render's
                snapshot, giving just +1. State belongs to this component's place in the tree; flip the power switch,
                and removing it loses its memory.
            </p>

            <p>
                State describes the UI. Sometimes a component also needs to synchronize with something outside that UI:
                a browser event, a subscription, or <code>document.title</code>. Doing that during rendering is awkward - we might
                pause or abandon that work before it ever reaches the screen.
            </p>
            <p>
                <code>useEffect</code> takes the next hook slot too, storing dependencies and cleanup. Compare dependencies with the
                previous slot using <code>Object.is</code>. If they changed, record a commit callback that runs the old
                cleanup, calls the effect, and saves its returned cleanup. Here's how we'd use it:
            </p>

            <CodeBlock title="Byte.jsx — syncing with the browser">{`
                useEffect(() => {
                    const previousTitle = document.title
                    document.title = count + " presses — Overreact"
                    return () => { document.title = previousTitle }
                }, [count])
            `}</CodeBlock>
            <p>
                After saving the committed tree, walk its hooks and run their <code>commit</code> callbacks. Before
                deleting a subtree, run its <code>unmount</code> callbacks to clean up effects. The final source
                includes both walks and the useEffect implementation.
            </p>
            <ul>
                <li>No dependency array: run after every commit for this component.</li>
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
                zipHref="/examples/part5.zip"
                stackblitzHref="https://stackblitz.com/edit/overreact-chap5?file=src%2Fmain.jsx"
            >
                Here's the complete project at this stopping point. Download it, unzip it, and run{" "}
                <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
