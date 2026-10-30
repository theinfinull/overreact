import CodeBlock from "./CodeBlock";
import FiberTraversal from "./FiberTraversal";
import Illustration from "./Illustration";
import SubTitle from "./SubTitle";
import Title from "./Title";
import Callout from "./Callout";
import ChapterSource from "./ChapterSource";
import { AlertCircle, Lightbulb } from "lucide";

export default function Part2() {
    return (
        <div>
            {/* Theory Stuff */}
            <Title id="chunking-render" chapter="Two">
                Rendering In Pieces
            </Title>
            <p>
                Our recursive render doesn't stop until the whole tree is done. On the browser's main thread, a big tree
                can hold up input and painting. Let's split that work into small pieces and give the browser a turn
                between them.
            </p>
            <Illustration
                src="/images/diagrams/work-chunking.svg"
                description="fig 2.1 - Chunking Render"
                className="px-4"
            ></Illustration>

            <SubTitle id="fibers">The Fiber Tree</SubTitle>
            <p>
                So we know we've got to split the render into smaller chunks, but chunks of what? Every render
                ultimately produces multiple DOM nodes, so the smallest sensible unit of work is a single node. But that
                raises a new question - once you've handled one node, how do you find the next?
            </p>
            <p>
                Which means we need more than just an element. We need a data structure of nodes that also knows where
                to go next. We'll call these <span className="font-bold">fibers</span>. Each one holds the element's{" "}
                <code>type</code> and <code>props</code>, same as before, plus three new links and a dom node:
            </p>
            <Illustration
                src="/images/diagrams/fiber-tree.svg"
                description="fig 2.2 - Fibers"
                className="px-4"
            ></Illustration>
            <ol>
                <li>
                    <code>child</code> - the first child fiber, if there is one
                </li>
                <li>
                    <code>sibling</code> - the next fiber at the same level
                </li>
                <li>
                    <code>parent</code> - the fiber one level up
                </li>
                <li>
                    <code>dom</code> - the actual DOM node this fiber is responsible for
                </li>
            </ol>
            <p>
                The first three make traversal possible. Give any fiber a <code>child</code>, a <code>sibling</code>,
                and a <code>parent</code>, and it can find the next one without a call stack remembering the way back.{" "}
                <code>dom</code> is here for a different job, which is holding whatever gets attached to the page once
                the fiber’s work is done.
            </p>

            <SubTitle id="workloop">Scheduling & Walking The Tree</SubTitle>
            <p>
                We have our units of work, but nothing to run them yet. That is the job of the work loop. It picks up the
                next unit of work, performs it, checks how much time is left, and either keeps going or hands control
                back to the browser. It's a small loop, but it's what turns one big blocking render into tiny
                non-blocking ones.
            </p>
            <p>
                To know when it's safe to run, we'll use <code>requestIdleCallback</code>, which is basically{" "}
                <code>setTimeout</code>'s more considerate version. Instead of you telling it when to run, the browser
                looks for an idle period to call it back.
            </p>
            <Callout icon={Lightbulb} color="blue">
                Real React doesn't use <code>requestIdleCallback</code>. It has its own scheduler package that also
                works out how much time is left. We borrow the browser's version because it makes the idea easy to see.
            </Callout>

            <CodeBlock title="workLoop.js">
                {`
                    let nextUnitOfWork = null

                    function workLoop(deadline) {
                        scheduled = false

                        let performed = false
                        while (nextUnitOfWork && (!performed || deadline.timeRemaining() > 1)) {
                            nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
                            performed = true
                        }

                        if (nextUnitOfWork) scheduleWork()
                    }
                `}
            </CodeBlock>
            <p>
                <code>nextUnitOfWork</code> is our bookmark. It always points at the fiber to work on next, so whenever
                we pause, we know exactly where to pick up again.
            </p>
            <p>
                <code>deadline</code> is an object that <code>requestIdleCallback</code> hands to our loop. Its{" "}
                <code>timeRemaining()</code> method tells us how much idle time the browser has left. We keep going
                while more than 1ms remains, but always perform at least one unit per call. Otherwise a callback with no
                time left would do nothing at all. That helps responsiveness, but one expensive unit can still block.
            </p>
            <p>
                If work is left over, the loop books itself another turn. And when there's nothing to do, it stops
                asking, instead of waking up on every idle period for no reason. The loop leans on <code>scheduled</code>{" "}
                and <code>scheduleWork</code>, which come right after this.
            </p>
            <CodeBlock title="scheduleWork.js">
                {`
                    let scheduled = false

                    // safari has no requestIdleCallback, so fall back to setTimeout
                    const requestWork = typeof requestIdleCallback === "function"
                        ? (callback) => requestIdleCallback(callback, { timeout: 100 })
                        : (callback) => setTimeout(() => {
                            const start = performance.now()
                            callback({ timeRemaining: () => Math.max(0, 5 - (performance.now() - start)) })
                        }, 0)

                    function scheduleWork() {
                        if (!scheduled) {
                            scheduled = true
                            requestWork(workLoop)
                        }
                    }
                `}
            </CodeBlock>
            <p>
                <code>scheduled</code> makes sure only one loop is ever waiting in line. Some browsers (Safari, at the time
                of writing) don't support <code>requestIdleCallback</code>, so there we fake it with a{" "}
                <code>setTimeout</code> and a 5ms budget.
                And <code>timeout: 100</code> makes sure a busy browser can't put our work off forever. After 100ms, it
                runs the callback anyway, even with no idle time left. That's the case the at-least-one-unit rule
                covers.
            </p>

            <p>
                Instead of rendering the whole tree in one recursive sweep, <code>render</code> now just sets up the
                very first unit of work and asks for the loop to start:
            </p>
            <CodeBlock title="render.js">
                {`
                    let wipRoot = null // work-in-progress tree

                    function render(element, container) {
                        wipRoot = {
                            dom: container,
                            props: {
                                children: [element],
                            },
                        }
                        nextUnitOfWork = wipRoot
                        scheduleWork()
                    }
                `}
            </CodeBlock>
            <p>
                That root fiber doesn't correspond to a real element. It's a placeholder whose only child is the element
                you passed in, and whose <code>dom</code> is the container itself. Everything else grows out from there,
                one fiber at a time.
            </p>
            <p>
                <code>performUnitOfWork</code> has three jobs for each fiber. It creates the DOM node if the fiber
                doesn't have one yet, creates fibers for its children, and figures out what the next unit of work should
                be.
            </p>
            <CodeBlock title="performUnitOfWork.js">
                {`
                    function performUnitOfWork(fiber) {
                        if (!fiber.dom) {
                            fiber.dom = createDom(fiber)
                        }

                        let previous = null
                        fiber.props.children.forEach((element, index) => {
                            const child = {
                                type: element.type,
                                props: element.props,
                                parent: fiber,
                                dom: null,
                            }

                            // the first child hangs off its parent, the rest chain along as siblings
                            if (index === 0) fiber.child = child
                            else previous.sibling = child
                            previous = child
                        })

                        return nextFiber(fiber)
                    }

                    // child first, then sibling, then the parent's sibling
                    function nextFiber(fiber) {
                        if (fiber.child) return fiber.child
                        for (let next = fiber; next; next = next.parent) {
                            if (next.sibling) return next.sibling
                        }
                        return null
                    }
                `}
            </CodeBlock>
            <p>
                <code>nextFiber</code> picks the next unit of work: the child if there is one, otherwise the sibling, and
                if there's no sibling either, we climb up and try the parent's sibling, until the tree runs out. Child,
                sibling, parent's sibling. That's the whole order. Press play to watch it:
            </p>
            <FiberTraversal />
            <p>
                <code>createDom</code> is just Chapter One's logic for creating a node and assigning its props, pulled
                into a helper. The complete source below includes it. Creating a node still doesn't attach it to the
                page, though.
            </p>

            <SubTitle id="committing">Committing The Tree</SubTitle>

            <p>
                If we mounted nodes as we went, the user could see the UI before it's fully rendered, with pieces
                missing and the page looking broken. So we hold off. The DOM nodes stay detached while the work is in
                progress, and once the whole render is complete, we mount the finished tree in one go. The bookmark
                becomes null when the work ends, so <code>wipRoot</code> keeps the tree handy for this final step.
            </p>

            <CodeBlock title="workLoop.js — after the while loop">{`
                if (!nextUnitOfWork && wipRoot) {
                    commitRoot()
                }
            `}</CodeBlock>
            <CodeBlock title="commit.js">{`
                function commitRoot() {
                    commitWork(wipRoot.child)
                    wipRoot = null
                }

                function commitWork(fiber) {
                    if (!fiber) return
                    fiber.parent.dom.appendChild(fiber.dom)
                    commitWork(fiber.child)
                    commitWork(fiber.sibling)
                }
            `}</CodeBlock>
            <p>
                We start at the root's child, because the root container is already there. Attach that child, then its
                children, then its siblings. Rendering paused between fibers to let the browser breathe, but the commit
                doesn't. It runs start to finish without stopping, so the user never sees a half-attached tree.
            </p>
            <Callout icon={AlertCircle} color="yellow">
                Only the render phase is pausable. The commit runs start to finish, so attaching a really big tree can
                still make the page stutter. Fibers help with the preparation, not with the mounting.
            </Callout>
            <p>
                Rendering no longer freezes the page. But render the same UI twice and it still gets appended twice.
                We'll fix that in the next chapter by remembering the previous tree, so we can update what's already
                there instead of starting over.
            </p>
            <ChapterSource
                eyebrow="Version Two"
                title="Source Till Now"
                zipHref="/examples/overreact-chap2.zip"
                stackblitzHref="https://stackblitz.com/edit/overreact-chap2?file=src%2Fmain.jsx"
            >
                Here's the complete version of what we built till now, along with the Vite config that connects them.
                Download it, unzip it, and run <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
