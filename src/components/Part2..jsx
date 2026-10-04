import CodeBlock from "./CodeBlock";
import FiberTraversal from "./FiberTraversal";
import Illustration from "./Illustration";
import SubTitle from "./SubTitle";
import Title from "./Title";
import WelcomeReader from "./WelcomeReader";

export default function Part2() {
    return (
        <div>
            {/* Theory Stuff */}
            <Title id="chunking-render" chapter={"Two"}>
                Rendering In Pieces
            </Title>
            <p>
                As we know, JS is single-threaded, meaning one thing runs at a time. You can learn more about this{" "}
                <a
                    href="https://www.youtube.com/watch?v=eiC58R16hb8"
                    target="_blank"
                    className="highlight-violet-100 text-violet-600"
                >
                    here
                </a>
                . Which is a problem for our current <code>render</code> - it's recursive, so once it starts, it won't
                stop until the whole thing is done.
            </p>
            <p>
                Not for user input, not for animations - the browser can't do anything else until rendering finishes. So
                a big enough tree can literally freeze the page.
            </p>
            <p>
                So we're going to break the rendering into small units of work and schedule them during the browser's
                idle time - one chunk at a time, whenever the browser has a spare moment.
            </p>
            <Illustration
                src="illustrations/part2-chunking.svg"
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
                Which means we need more than just an element - we need a data structure of nodes that also knows where
                to go next. We'll call these <span className="font-bold">fibers</span>. Each one holds the element's{" "}
                <code>type</code> and <code>props</code>, same as before, plus three new links:
            </p>
            <Illustration
                src="illustrations/part2-fiber.svg"
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
                The first three are what make traversal possible - with <code>child</code>, <code>sibling</code>, and{" "}
                <code>parent</code>, any fiber can find the next one without needing a call stack to remember where it
                came from. <code>dom</code> is along for a different reason - it's what actually gets attached to the
                page once the fiber's work is done.
            </p>
            <p>
                Put together, you get a fiber tree, which lets you find the next unit of work from any node, no matter
                where you left off.
            </p>

            <SubTitle id="workloop">The Work Loop</SubTitle>
            <p>
                We have our units of work, but nothing to run em yet. That is the job of the work loop. It picks up the
                next unit of work, performs it, checks how much time is left, and either keeps going or hands control
                back to the browser. It's a small loop, but it's what turns one big blocking render into tiny
                non-blocking ones.
            </p>
            <p>
                To know when it's safe to run, we'll use <code>requestIdleCallback</code>, which is basically{" "}
                <code>setTimeout</code>'s more considerate version. Instead of you telling it when to run, the browser
                calls it back whenever the main thread has nothing better to do.
            </p>

            <CodeBlock title="requestIdleCallback.js">
                {`
                    requestIdleCallback(callback, { timeout: 500 }) //params other than callback are optional
                `}
            </CodeBlock>

            <p>
                It schedules <code>callback</code> to run during an idle period, and returns an id you can pass to{" "}
                <code>cancelIdleCallback</code> to cancel it. The optional <code>timeout</code> forces the callback to
                execute if the browser stays busy for that long, so your callback doesn't starve.
            </p>

            <CodeBlock title="workLoop.js">
                {`
                    let nextUnitOfWork = null

                    function workLoop(deadline) {
                        let shouldYield = false
                        while (nextUnitOfWork && !shouldYield) {
                            nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
                            shouldYield = deadline.timeRemaining() < 1
                        }
                        requestIdleCallback(workLoop)
                    }

                    requestIdleCallback(workLoop)
                `}
            </CodeBlock>
            <p>
                <code>nextUnitOfWork</code> is our bookmark. It always points at the fiber to work on next, so whenever
                we pause, we know exactly where to pick up again.
            </p>
            <p>
                When the browser calls <code>workLoop</code>, it passes in an <code>IdleDeadline</code> object. Its{" "}
                <code>timeRemaining()</code> method returns how many milliseconds of idle time are left before the
                browser needs the main thread back .The browser caps this at 50ms, so a sudden click never has to wait
                long. We check it after every unit of work, and once less than 1ms remains, we stop.
            </p>
            <p>
                That gives the loop two ways to exit. Either we run out of work, or we run out of time. Either way we
                hand control back and book the next idle slot with <code>requestIdleCallback(workLoop)</code>. The loop
                re-registers itself even when there's nothing to do, so the moment <code>render</code> sets a new{" "}
                <code>nextUnitOfWork</code>, it gets picked up on the next slot.
            </p>
            <p>
                All that's left is <code>performUnitOfWork</code>, the function that does the work for one fiber and
                returns whichever fiber should run next.
            </p>

            <SubTitle id="render-v2">
                Implementing <code>render</code> v2
            </SubTitle>
            <p>
                Instead of rendering the whole tree in one recursive sweep, <code>render</code> now just sets up the
                very first unit of work and lets the loop take it from there:
            </p>
            <CodeBlock title="render.js">
                {`
                    function render(element, container) {
                        nextUnitOfWork = {
                            dom: container,
                            props: {
                                children: [element],
                            },
                        }
                    }
                `}
            </CodeBlock>
            <p>
                That root fiber doesn't correspond to a real element - it's a stand-in whose only child is the element
                you passed in, and whose <code>dom</code> is the container itself. Everything else grows out from there,
                one fiber at a time.
            </p>
            <p>
                <code>performUnitOfWork</code> has three jobs for each fiber: create its DOM node if it doesn't have one
                yet, create fibers for its children, and figure out what the next unit of work should be.
            </p>
            <CodeBlock title="performUnitOfWork.js">
                {`
                    function performUnitOfWork(fiber) {
                        if (!fiber.dom) {
                            fiber.dom = createDom(fiber)
                        }

                        const elements = fiber.props.children
                        let index = 0
                        let prevSibling = null

                        while (index < elements.length) {
                            const element = elements[index]

                            const newFiber = {
                                type: element.type,
                                props: element.props,
                                parent: fiber,
                                dom: null,
                            }

                            if (index === 0) {
                                fiber.child = newFiber
                            } else {
                                prevSibling.sibling = newFiber
                            }

                            prevSibling = newFiber
                            index++
                        }

                        if (fiber.child) {
                            return fiber.child
                        }

                        let nextFiber = fiber
                        while (nextFiber) {
                            if (nextFiber.sibling) {
                                return nextFiber.sibling
                            }
                            nextFiber = nextFiber.parent
                        }
                    }
                `}
            </CodeBlock>
            <p>
                The search for the next unit of work goes child first, then sibling, then back up to the parent's
                sibling - and so on, until it runs out of tree. Child, sibling, parent's sibling: that's the whole
                order.
            </p>
            <FiberTraversal />
            <p>
                <code>createDom</code> is just our old element-to-node logic from <code>render</code>, pulled out into
                its own function so a fiber can call it on demand instead of all at once:
            </p>
            <CodeBlock title="createDom.js">
                {`
                    function createDom(fiber) {
                        const dom =
                            fiber.type === "TEXT_ELEMENT"
                                ? document.createTextNode("")
                                : document.createElement(fiber.type)

                        const isProperty = (key) => key !== "children"
                        Object.keys(fiber.props)
                            .filter(isProperty)
                            .forEach((name) => {
                                dom[name] = fiber.props[name]
                            })

                        return dom
                    }
                `}
            </CodeBlock>
            <p>
                One thing this version is missing: every fiber appends its own DOM node to its parent's the moment it's
                created, not once the whole tree is ready. Which means the browser can end up showing half a tree
                mid-render - flickering, incomplete UI, the exact opposite of what we're trying to fix. We'll deal with
                that next.
            </p>
            // also add commit part here
        </div>
    );
}
