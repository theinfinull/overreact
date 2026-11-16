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
                Every render runs your component function from the top. Write <code>let count = 0</code> inside it,
                bump it in a click handler, and the next render puts it right back to zero. Even if it did stick,
                nothing told the renderer to paint again. Hooks fix both. They give the function a memory that
                outlives the call, and a way to ask for another one.
            </p>
            <p>
                <code>useState</code> gives you a value and a setter.
            </p>
            <CodeBlock title="score.jsx">{`
                function Score() {
                    const [count, setCount] = useState(0)
                    return (
                        <button onClick={() => setCount(count + 1)}>
                            {count}
                        </button>
                    )
                }
            `}</CodeBlock>
            <p>
                First render, you get <code>0</code>. That's the initial state. Click, and <code>1</code> gets stored
                while a new render is requested. The render you're in still shows <code>0</code>. Only when{" "}
                <code>Score</code> runs again does <code>useState</code> hand back <code>1</code>.
            </p>
            <p>
                So where does that memory live? On the function fiber, in a list called <code>hooks</code>. When a
                component starts running, we note which fiber it is and reset the list. Every hook call takes the next
                spot. The first <code>useState</code> is spot 0, the next is spot 1. On the following render, that
                same spot on the previous fiber still holds the old state.
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
            <Callout icon={AlertCircle} color="yellow">
                Hooks match by position, not by name. Spot 0 is whichever hook ran first, whatever you called the
                variable. So call them at the top, in the same order every render, and only while a component is
                rendering. Put one inside an <code>if</code> or a loop and a spot can get skipped. Then the next hook
                reads the wrong one.
            </Callout>
            <p>
                The setter just stores an update. Pass a plain value and it means "use this next". Pass a function and
                it means "take the latest value and work out the next one". With a single update, both do the same
                thing. Fire several in one turn, before the next render, and they split apart.
            </p>
            <p>
                Say <code>count</code> is 4 right now.
            </p>
            <CodeBlock title="three updates, two results">{`
                setCount(count + 1)
                setCount(count + 1)
                setCount(count + 1)
                // every call reads 4, so the queue is 5, 5, 5
                // replay ends at 5

                setCount(n => n + 1)
                setCount(n => n + 1)
                setCount(n => n + 1)
                // replay runs 4 → 5 → 6 → 7
            `}</CodeBlock>
            <p>
                The first three calls all read <code>count</code> from this render, so each one queues a{" "}
                <code>5</code>. Replay walks the queue. Set 5, set 5, set 5. The last write wins and the count only
                grows by 1. That's the stale update. The number was copied before any update ran.
            </p>
            <p>
                The other three queue functions. Replay starts at 4. The first returns 5. The second gets that 5 and
                returns 6. The third returns 7. The count grows by 3. If the next value depends on the current one,
                use the function form.
            </p>
            <p>
                <code>useState</code> does that replay. It loads the previous spot, plays the queued updates on top,
                and hands back the result along with the setter. The very first render has no previous spot, so it uses{" "}
                <code>initialState</code>. Pass a function there and it gets called once to produce that first value.
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
                Those updates stay in the queue until commit. A render can get thrown away and restarted before it
                ever reaches the screen, and the new attempt still needs them. So commit only drops the ones this
                render already applied. Anything that showed up after the snapshot waits for the next render.
            </p>
            <p>
                The setter is kept too, so a click handler from an old render can still call it. What goes stale is
                the <code>count</code> that handler read, if it passes a number.
            </p>
            <p>
                <code>scheduleUpdate</code> kicks off the next render from the tree that's on screen. Components run,
                elements get reconciled, and the DOM changes only where it must. <code>render</code> goes through the
                same <code>startRender</code> helper.
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
                State lives on that fiber. Take the component out of the tree and the fiber goes with it, hooks and
                all. Mount it again later and you get a brand new fiber with the initial state. Same rule as last
                chapter. A different function in that spot, or nothing there, and the old fiber is thrown away.
            </p>
            <p>
                State is what the screen should show. An effect is something that should happen after the screen
                updates, and might need undoing later. A timer, a subscription, <code>document.title</code>. Doing
                that work during render is a bad idea, because that render might never commit.
            </p>
            <CodeBlock title="document-title.jsx">{`
                useEffect(() => {
                    const previousTitle = document.title
                    document.title = count + " clicks"
                    return () => {
                        document.title = previousTitle
                    }
                }, [count])
            `}</CodeBlock>
            <p>
                <code>useEffect</code> takes the next spot too. It saves the dependency list and the cleanup from last
                time. If a dependency changed, it records a commit step. Run the old cleanup, run the effect, then save
                whatever cleanup the effect returns.
            </p>
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
                The effect itself waits for commit. Commit walks the finished tree and runs the steps that were
                recorded. Deleted fibers go first, so their cleanup runs before their DOM disappears.
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
            <p>The dependency list decides when that step gets recorded.</p>
            <ul>
                <li>No list. It runs after every commit.</li>
                <li>
                    <code>[]</code> runs after the first commit. Cleanup runs when the component is removed.
                </li>
                <li>
                    <code>[count]</code> runs after the first commit, and again whenever <code>count</code> changes.
                    The comparison is <code>Object.is</code>.
                </li>
            </ul>
            <Callout icon={Lightbulb} color="accent">
                Our effects run at the very end of commit. React runs <code>useEffect</code> a little later. The
                dependencies and the cleanup work the same way though.
            </Callout>
            <p>
                So a hook is just the next spot on the fiber. <code>useState</code> keeps a value and a queue.{" "}
                <code>useEffect</code> keeps a dependency list and a cleanup. The renderer fills the spots in order,
                then commits them or cleans them up.
            </p>
            <p>
                The console below shows all of it. Click calls <code>{"setCount(n => n + 1)"}</code>, so every press
                adds one. +3 stale calls <code>{"setCount(count + 1)"}</code> three times, and the score moves by one.
                +3 queued calls <code>{"setCount(n => n + 1)"}</code> three times, and it moves by three. The power
                switch removes the component holding the score. Flip it back on and you start again from zero.
            </p>
            <Counter />
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
