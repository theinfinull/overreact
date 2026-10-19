import ChapterSource from "./ChapterSource";
import CodeBlock from "./CodeBlock";
import FunctionComponentDemo from "./FunctionComponentDemo";
import Title from "./Title";

export default function Part4() {
    return (
        <div>
            <Title id="functional-components" chapter="Four">Functional Components</Title>
            <p>
                Up to now, every element's type has been a tag name. But writing a whole app as one big tree gets
                old pretty quickly. What if a piece of that tree could be a function? Give it props, let it return
                elements, and use it wherever we'd use a tag. That's a function component.
            </p>
            <CodeBlock title="main.jsx">{`
                function Greeting({ name }) {
                    return <h1>Hey, {name}!</h1>
                }

                const element = <Greeting name="Byte" />
                // createElement(Greeting, { name: "Byte" })
            `}</CodeBlock>
            <p>
                Capitalization tells the JSX compiler whether we mean a variable or a literal tag name.
                <code>Greeting</code> becomes the function itself; <code>h1</code> becomes the string "h1".
                Our createElement already stores whatever type it receives, so that part needs no special trick.
            </p>
            <FunctionComponentDemo />

            <p>
                A function component doesn't create a DOM node of its own. Its job is to describe children.
                So split our unit of work into two paths: call functions to get their elements, and create DOM
                nodes for host elements (the browser tags and text nodes).
            </p>
            <CodeBlock title="performUnitOfWork.js">{`
                function performUnitOfWork(fiber) {
                    if (typeof fiber.type === "function") {
                        updateFunctionComponent(fiber)
                    } else {
                        updateHostComponent(fiber)
                    }

                    return nextFiber(fiber) // same child → sibling → parent walk
                }

                function updateFunctionComponent(fiber) {
                    const result = fiber.type(fiber.props)
                    reconcileChildren(fiber, toChildElements([result]))
                }

                function updateHostComponent(fiber) {
                    if (!fiber.dom) fiber.dom = createDom(fiber)
                    reconcileChildren(fiber, fiber.props.children)
                }
            `}</CodeBlock>
            <p>
                <code>toChildElements</code> is our flatten, filter, and text-wrap logic from Chapter One,
                pulled into a helper. Using it on the result lets a component return an element, an array,
                text, or null. Null simply means there's nothing to show this time.
            </p>

            <p>
                Here's the catch. Our old commit code assumes every parent fiber has a DOM node. But in
                <code>{"<div><Greeting /></div>"}</code>, the h1's parent fiber is Greeting, not div.
                We need to walk upward until we reach an actual DOM parent.
            </p>
            <CodeBlock title="commit.js">{`
                function findDomParent(fiber) {
                    let parent = fiber.parent
                    while (!parent.dom) parent = parent.parent
                    return parent.dom
                }

                // in commitWork:
                const parentDom = findDomParent(fiber)
                // only insert/update fibers that actually have a dom node
                if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
                    parentDom.insertBefore(fiber.dom, nextMountedDom(fiber))
                }
            `}</CodeBlock>
            <p>
                Deletion needs the same care in the other direction. Removing Greeting can't remove
                <code>Greeting.dom</code> - it doesn't exist. Walk down until you find DOM nodes and remove
                those instead. If a component returns several host children, remove all of them.
            </p>

            <p>
                Our insertion helper also looks through DOM-less sibling fibers to find the next mounted node.
                The full version below includes that walk. No wrapper divs needed just to make the renderer happy.
            </p>

            <p>
                The same function at the same matched position keeps its identity, even with new props.
                Define components outside other components: a fresh function created during every render looks
                like a replacement. We'll use that identity to preserve state next.
            </p>

            <p>
                We've got reusable pieces now. But a plain local variable won't survive calling a function again.
                To give a component memory, we'll need somewhere outside that function call to keep its state.
                Conveniently, we already have that somewhere: its fiber.
            </p>
            <ChapterSource
                eyebrow="Chapter Four source"
                title="Chapter Four — final version"
                zipHref="/examples/part4.zip"
            >
                Here's the complete project at this stopping point. Download it, unzip it, and run 
                <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
