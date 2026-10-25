import ChapterSource from "./ChapterSource";
import CodeBlock from "./CodeBlock";
import FunctionComponentDemo from "./FunctionComponentDemo";
import Title from "./Title";

export default function Part4() {
    return (
        <div>
            <Title id="functional-components" chapter="Four">
                Functional Components
            </Title>
            <p>
                Up to now, every element's type has been a tag name. But writing a whole app as one big tree gets clumsy
                pretty quickly. What if a piece of that tree could be a function? Give it props, let it return elements,
                and use it wherever we'd use a tag. That's a function component.
            </p>
            <CodeBlock title="ProfileCard.jsx">{`
                function ProfileCard({ name, role, image }) {
                    return (
                        <div classname="profile-card">
                            <img src={image}} />
                            <h2>{name}</h2>
                            <p>{role}</p>
                        </div>
                    );
                }

                // usage
                <ProfileCard name="Broski" role="Software Dev" image="profile.jpg" />
            `}</CodeBlock>
            <p>
                Capitalization tells the JSX compiler what you mean. <code>ProfileCard</code> compiles to the function
                itself. Lowercase tags like <code>img</code> and <code>h2</code> compile to the strings{" "}
                <code>"img"</code> and <code>"h2"</code>. Our <code>createElement</code> stores whatever type it
                receives, so it needs no special trick.
            </p>

            <FunctionComponentDemo />

            <p>
                A function component has no DOM node of its own. It only describes its children. So the unit of work now
                splits into two paths. Function components get called to produce their elements. Host elements, meaning
                browser tags and text nodes, get a real DOM node.
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
                <code>toChildElements</code> is our flatten, filter, and text-wrap logic from Chapter One, pulled into a
                helper. Using it on the result lets a component return an element, an array, text, or null. Null simply
                means there's nothing to show this time.
            </p>

            <p>
                Here's the catch. Our old commit code assumes every parent fiber has a DOM node. But in
                <code>{"<div><ProfileCard /></div>"}</code>, the <code>{`<div classname="profile-card">`}</code>'s
                parent fiber is ProfileCard, not div. We need to walk upward until we reach an actual DOM parent.
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
                Deletion needs the same care in the other direction. Removing <code>ProfileCard</code> can't remove
                <code>ProfileCard.dom</code> as it doesn't exist. Walk down until you find DOM nodes and remove those
                instead. If a component returns several host children, remove all of them.
            </p>

            <p>
                Our insertion helper also looks through DOM-less sibling fibers to find the next mounted node. The full
                version below includes that walk. No wrapper divs needed just to make the renderer happy.
            </p>

            <p>
                When we render again, React checks each spot in the tree. If the same function is still in the same
                spot, React treats it as the same component and only updates its props. If the function is different,
                React throws the old component away and builds a new one. In the next chapter, we'll rely on this to
                keep a component's state between renders.
            </p>

            <p>So now we have reusable pieces. Next, we'll give them memory with state.</p>
            <ChapterSource
                eyebrow="Version Four"
                title="Source Till Now"
                zipHref="/example/overreact-chap4.zip"
                stackblitzHref="https://stackblitz.com/edit/overreact-chap4?file=src%2Fmain.jsx"
            >
                Here's the complete project at this stopping point. Download it, unzip it, and run
                <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
