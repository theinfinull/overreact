import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const createDomCode = `const SVG_NS = "http://www.w3.org/2000/svg";

export function createDom(fiber) {
    if (fiber.type === TEXT_ELEMENT) {
        return document.createTextNode("");
    }
    if (isSvgElement(fiber)) {
        return document.createElementNS(SVG_NS, fiber.type);
    }
    return document.createElement(fiber.type);
}

function isSvgElement(fiber) {
    if (fiber.type === "svg") return true;

    for (let parent = fiber.parent; parent; parent = parent.parent) {
        if (parent.type === "foreignObject") return false;
        if (parent.type === "svg") return true;
    }
    return false;
}`;

const updateDomCode = `export function updateDom(dom, prevProps, nextProps) {
    // remove stale event listeners and properties
    Object.keys(prevProps)
        .filter(key => key !== "children" && prevProps[key] !== nextProps[key])
        .forEach(key => {
            if (key.startsWith("on")) {
                dom.removeEventListener(key.slice(2).toLowerCase(), prevProps[key]);
            } else if (!(key in nextProps)) {
                dom[key] = "";
            }
        });

    // add new event listeners and properties
    Object.keys(nextProps)
        .filter(key => key !== "children" && prevProps[key] !== nextProps[key])
        .forEach(key => {
            if (key.startsWith("on")) {
                dom.addEventListener(key.slice(2).toLowerCase(), nextProps[key]);
            } else {
                dom[key] = nextProps[key];
            }
        });
}`;

const renderCode = `export function render(element, container) {
    const dom = createDom({ type: element.type, props: element.props });
    element.props.children.forEach(child => render(child, dom));
    container.appendChild(dom);
}`;

export default function Part2() {
    return (
        <PartSection
            id="part-2"
            partNumber={2}
            paperLabel="Method — Part 2"
            title="Pixels, finally"
            subtitle="rendering to the DOM in ten lines"
            currentPart={2}
        >
            {/* The question */}
            <p className="font-mono text-sm text-dark3 italic">
                What's the smallest thing that turns that object tree into DOM nodes?
            </p>

            {/* Opening */}
            <p className="mt-6 text-light2 leading-relaxed">
                Ten lines and it renders. Everything after this part exists to fix the consequences of these ten
                lines, not to fix the ten lines.
            </p>

            {/* render */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">render(element, container)</h3>
                <p className="text-light2 leading-relaxed mb-4">
                    Create a DOM node for the element, set its props, recurse over children, append. That's it.
                    This is a complete, working renderer. Everything that follows is consequence management.
                </p>
                <CodeBlock code={renderCode} language="js" filename="src/overreact/renderer.js" />
            </div>

            {/* Props assignment */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">Props hit the DOM</h3>
                <p className="text-light2 leading-relaxed mb-4">
                    Not every JSX prop maps directly to a DOM property. The mismatches are specific:
                </p>
                <ul className="space-y-2.5 text-sm text-light2">
                    {[
                        [
                            "className → class",
                            "JSX uses className because class is a reserved word in JavaScript. The DOM property is className too, so direct assignment works — but setAttribute would need \"class\".",
                        ],
                        [
                            "style → object, not string",
                            "In JSX, style is an object: style={{ color: 'red' }}. The DOM's style property accepts string or object — direct assignment works for individual properties, not the whole style string.",
                        ],
                        [
                            "htmlFor → for",
                            "for is reserved in JavaScript. JSX uses htmlFor; the DOM property is htmlFor too.",
                        ],
                        [
                            "Boolean attributes",
                            "disabled={true} should set the attribute; disabled={false} should remove it. Direct property assignment handles this correctly — dom.disabled = false removes the attribute.",
                        ],
                    ].map(([term, desc]) => (
                        <li key={term} className="flex gap-3 items-start rounded-lg p-3 bg-dark2/30">
                            <code className="shrink-0 text-accent text-xs mt-0.5">{term}</code>
                            <span className="text-light3 text-xs leading-relaxed">{desc}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-4 text-sm text-light3 leading-relaxed">
                    Most React props use direct property assignment, not{" "}
                    <code className="text-accent text-xs">setAttribute</code>. That's why{" "}
                    <code className="text-accent text-xs">element.className = 'x'</code>, not{" "}
                    <code className="text-accent text-xs">element.setAttribute('class', 'x')</code>.
                </p>
            </div>

            {/* Event props */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">Events</h3>
                <p className="text-light2 leading-relaxed">
                    Any prop starting with <code className="text-accent text-sm">on</code> is an event listener.{" "}
                    <code className="text-accent text-sm">onClick</code> becomes{" "}
                    <code className="text-accent text-sm">addEventListener('click', handler)</code>.
                </p>
                <p className="mt-2 text-light2 leading-relaxed">
                    On update, the old listener must be removed before the new one is added. Skip this step and
                    every re-render adds another listener. After ten renders, a click fires the handler ten times.
                </p>
            </div>

            {/* SVG sidebar */}
            <div className="mt-8 rounded-xl border border-dark2 bg-dark2/30 p-5">
                <p className="text-xs font-mono tracking-widest text-dark3 uppercase mb-3">SVG namespace</p>
                <p className="text-sm text-light2 leading-relaxed">
                    <code className="text-accent text-xs">document.createElement("circle")</code> produces an{" "}
                    <code className="text-accent text-xs">HTMLUnknownElement</code>. Useless. SVG elements need{" "}
                    <code className="text-accent text-xs">document.createElementNS(SVG_NS, "circle")</code>.
                    The namespace is inherited down the subtree, so it has to be threaded through the recursion.
                    There are also camelCase attribute mismatches:{" "}
                    <code className="text-accent text-xs">viewBox</code> not <code className="text-accent text-xs">viewbox</code>,{" "}
                    <code className="text-accent text-xs">strokeWidth</code> not <code className="text-accent text-xs">stroke-width</code>.
                    Real bug class.
                </p>
            </div>

            {/* The code */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The code — stage 2</h3>
                <div className="space-y-4">
                    <CodeBlock code={createDomCode} language="js" filename="src/overreact/dom.js" />
                    <CodeBlock code={updateDomCode} language="js" filename="src/overreact/dom.js" />
                </div>
            </div>

            {/* Break it */}
            <div className="mt-10 rounded-xl border border-dark2/80 bg-dark/60 p-5">
                <p className="text-xs font-mono tracking-widest text-dark3 uppercase mb-2">Break it</p>
                <p className="text-light2">
                    The walk is recursive and synchronous. There is no way to stop it halfway.
                </p>
                <p className="mt-2 text-light2">
                    Render a tree of two thousand nodes and the browser can't paint, scroll, or respond to input
                    until every one of them is processed.
                </p>
            </div>

            {/* Collapsibles */}
            <div className="mt-6 space-y-3">
                <Collapsible summary="Real React — synthetic events" variant="footnote">
                    <p className="text-sm text-light2 leading-relaxed">
                        Real React doesn't call <code className="text-accent text-xs">addEventListener</code> on each element.
                        It delegates all events to the root container using a single listener, then simulates bubbling through
                        the React tree. In React 17, delegation moved from <code className="text-accent text-xs">document</code> to
                        the root container — which is why <code className="text-accent text-xs">e.stopPropagation()</code> inside
                        React now correctly stops events from reaching outside-React handlers on document.
                        Source: <code className="text-accent text-xs">packages/react-dom/src/events/</code>.
                    </p>
                </Collapsible>

                <Collapsible summary="If you're coding along" variant="warning">
                    <p className="text-sm text-light2 leading-relaxed">
                        The most common issue is forgetting the <code className="text-accent text-xs">TEXT_ELEMENT</code> case
                        in <code className="text-accent text-xs">createDom</code>, resulting in{" "}
                        <code className="text-accent text-xs">document.createElement("TEXT_ELEMENT")</code> — which creates
                        a literal <code className="text-accent text-xs">{`<text_element>`}</code> tag. The symptom is text simply
                        not appearing in the output.
                    </p>
                    <p className="mt-3 text-sm text-light2 leading-relaxed">
                        Second issue: setting <code className="text-accent text-xs">dom.style = "color: red"</code> doesn't work.
                        The DOM <code className="text-accent text-xs">style</code> property is a{" "}
                        <code className="text-accent text-xs">CSSStyleDeclaration</code> object — it's not assignable as a string
                        directly. Use <code className="text-accent text-xs">dom.style.cssText = "color: red"</code> or set individual
                        properties: <code className="text-accent text-xs">dom.style.color = "red"</code>.
                    </p>
                </Collapsible>
            </div>
        </PartSection>
    );
}
