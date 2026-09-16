import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const performUnitCode = `function performUnitOfWork(fiber) {
    if (typeof fiber.type === "function") {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    if (fiber.child) return fiber.child;
    for (let current = fiber; current; current = current.parent) {
        if (current.sibling) return current.sibling;
    }
    return null;
}

function updateFunctionComponent(fiber) {
    fiber.hooks = [];
    renderingFiber = fiber;
    const rendered = fiber.type(fiber.props);
    renderingFiber = null;
    reconcileChildren(fiber, [rendered], deletions);
}

function updateHostComponent(fiber) {
    if (!fiber.dom) fiber.dom = createDom(fiber);
    reconcileChildren(fiber, fiber.props.children, deletions);
}`;

const findDomParentCode = `function findDomParent(fiber) {
    let parent = fiber.parent;
    while (!parent.dom) {
        parent = parent.parent;
    }
    return parent.dom;
}`;

export default function Part7() {
    return (
        <PartSection
            id="part-7"
            partNumber={7}
            paperLabel="Method — Part 7"
            title="Components aren't real"
            subtitle="function components and DOM-less fibers"
            currentPart={7}
        >
            <p className="text-xl text-light2 leading-relaxed mb-8">
                What actually changes when <code className="font-mono text-accent">type</code> is a function instead
                of a string?
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                React never renders your components. It calls them, once, to ask what it should render, and then
                throws the function away. This explains more of your day than you'd expect.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-10 mb-4">Two differences that cascade</h2>

            <p className="text-light2 leading-relaxed mb-4">
                <strong className="text-light">First:</strong> a function component fiber has no DOM node. Its
                children come from calling <code className="font-mono text-accent text-sm">fiber.type(fiber.props)</code>.
                The function runs. The function returns elements. Those elements become children. The fiber itself
                produces nothing for the DOM.
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                <strong className="text-light">Second:</strong> because it has no DOM node, commit can no longer
                assume <code className="font-mono text-accent text-sm">fiber.parent.dom</code> exists. Appending
                has to walk <em>up</em> until it finds an ancestor with a real DOM node. Deleting has to walk{" "}
                <em>down</em> until it finds a descendant with one.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                Both differences are handled by splitting{" "}
                <code className="font-mono text-accent text-sm">performUnitOfWork</code> into two paths:
            </p>

            <CodeBlock code={performUnitCode} language="js" filename="renderer.js" />

            <p className="text-light2 leading-relaxed mt-6 mb-4">
                The ancestor walk in commit:
            </p>

            <CodeBlock code={findDomParentCode} language="js" filename="renderer.js" />

            <h2 className="text-2xl font-semibold text-light mt-12 mb-4">The shape mismatch</h2>

            <p className="text-light2 leading-relaxed mb-4">
                Components are not a thing React renders. Components are functions React calls to find out what to
                render. The fiber tree and the DOM tree are different shapes, and this mismatch is the explanation
                for several things that probably confused you at some point:
            </p>

            <ul className="text-light2 leading-relaxed mb-6 space-y-3 pl-4">
                <li>
                    <code className="font-mono text-accent text-sm">React.Fragment</code> — a function component with
                    no DOM node, returning multiple children. Nothing in the DOM; multiple things in the fiber tree.
                </li>
                <li>
                    Why a component can return <code className="font-mono text-accent text-sm">null</code> — the
                    function is called, returns null, no DOM node is created, fiber exists with no dom.
                </li>
                <li>
                    Why context providers are invisible in the DOM — they're function components with no DOM node.
                </li>
                <li>
                    Why ref forwarding was ever necessary — you can't attach a ref to something that has no DOM node,
                    so passing a ref down to the actual element required an explicit escape hatch.
                </li>
            </ul>

            <h2 className="text-2xl font-semibold text-light mt-10 mb-4">Identity</h2>

            <p className="text-light2 leading-relaxed mb-6">
                <code className="font-mono text-accent text-sm">fiber.type === MyComponent</code> is an identity
                comparison. Define a component inside another component and React sees a brand-new function
                on every render — a different type. So it unmounts the entire subtree and mounts fresh. Every time.
                This isn't a performance concern. It's correctness: a different function is a different component.
            </p>

            <div className="mt-10 p-6 rounded-lg border border-dark2 bg-dark2/30">
                <h3 className="text-lg font-semibold text-light mb-2">Where this breaks</h3>
                <p className="text-light2 leading-relaxed">
                    Components are pure functions of props, called fresh every render. Every local variable is
                    destroyed on return. So where does state live? It can't be in the function — the function is gone
                    the moment it returns.
                </p>
            </div>

            <Collapsible summary="Real React — beginWork" variant="footnote">
                <p className="text-light3 leading-relaxed text-sm">
                    React's <code className="font-mono text-xs">beginWork</code> switches on{" "}
                    <code className="font-mono text-xs">fiber.tag</code> — an integer (FunctionComponent = 0,
                    ClassComponent = 1, HostRoot = 3, HostComponent = 5, etc.) rather than{" "}
                    <code className="font-mono text-xs">typeof fiber.type</code>. Class components are a different
                    branch in the same switch: they call the constructor on mount and{" "}
                    <code className="font-mono text-xs">render()</code> on updates. Hooks don't exist for class
                    components; <code className="font-mono text-xs">this.state</code> and the lifecycle methods live
                    on the class instance instead. Both paths produce reconciled children via the same
                    reconcileChildren call. Source:{" "}
                    <code className="font-mono text-xs">
                        packages/react-reconciler/src/ReactFiberBeginWork.js
                    </code>
                    .
                </p>
            </Collapsible>

            <Collapsible summary="If you're coding along" variant="warning">
                <p className="text-light3 leading-relaxed text-sm">
                    The ancestor-walk in <code className="font-mono text-xs">commitWork</code> is the part everyone
                    forgets. The symptom: function components render correctly in the fiber tree but nothing appears
                    in the DOM, because <code className="font-mono text-xs">appendChild</code> is called on the
                    function component's null <code className="font-mono text-xs">dom</code> property instead of its
                    ancestor's. If you see "Cannot read properties of null (reading 'appendChild')" after adding
                    function components, this is why.
                </p>
            </Collapsible>
        </PartSection>
    );
}
