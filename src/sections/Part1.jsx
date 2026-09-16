import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const jsxBefore = `const element = (
  <div className="container">
    <h1>Hello</h1>
    <p>world</p>
  </div>
);`;

const jsxAfter = `const element = createElement(
  "div",
  { className: "container" },
  createElement("h1", null, "Hello"),
  createElement("p", null, "world")
);`;

const elementShape = `// What createElement("div", { className: "container" }, ...) returns:
{
  type: "div",
  key: null,
  props: {
    className: "container",
    children: [
      {
        type: "h1",
        key: null,
        props: {
          children: [
            { type: "TEXT_ELEMENT", key: null, props: { nodeValue: "Hello", children: [] } }
          ]
        }
      },
      // ...
    ]
  }
}`;

const createElementCode = `export const TEXT_ELEMENT = "TEXT_ELEMENT";

export function createElement(type, config, ...children) {
    const { key = null, ...props } = config ?? {};

    return {
        type,
        key,
        props: {
            ...props,
            children: toChildElements(children),
        },
    };
}

function createTextElement(text) {
    return {
        type: TEXT_ELEMENT,
        key: null,
        props: { nodeValue: text, children: [] },
    };
}

export function toChildElements(children) {
    return children
        .flat(Infinity)
        .filter((child) => child != null && typeof child !== "boolean")
        .map((child) => (typeof child === "object" ? child : createTextElement(child)));
}`;

export default function Part1() {
    return (
        <PartSection
            id="part-1"
            partNumber={1}
            paperLabel="Method — Part 1"
            title="JSX is a lie, and a nice one"
            subtitle="createElement and the element tree"
            currentPart={1}
        >
            {/* The question */}
            <p className="font-mono text-sm text-dark3 italic">
                Who converts <code className="not-italic text-light3">{`<div className="x">hi</div>`}</code> into something JavaScript can execute, and when?
            </p>

            {/* Opening */}
            <p className="mt-6 text-light2 leading-relaxed">
                There is no JSX parser in React. There never was. Babel deleted your syntax before React ever saw it,
                and what React receives is an object so boring you'll be annoyed.
            </p>

            {/* Misconception callout */}
            <div className="mt-8 rounded-xl border border-dark2 bg-dark2/40 p-5">
                <p className="text-xs font-mono tracking-widest text-dark3 uppercase mb-4">Common misconception</p>
                <p className="text-sm text-light2 mb-4">
                    JSX is not parsed at runtime. It is not JSON. It is not HTML strings. Babel (or SWC or tsc)
                    rewrites your syntax at <em>build time</em>, before the browser ever sees it. What ships to the browser
                    is plain function calls.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <p className="text-xs text-dark3 mb-2 font-mono">What you write</p>
                        <CodeBlock code={jsxBefore} language="jsx" />
                    </div>
                    <div>
                        <p className="text-xs text-dark3 mb-2 font-mono">What Babel emits</p>
                        <CodeBlock code={jsxAfter} language="js" />
                    </div>
                </div>
            </div>

            {/* The element object */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The element object</h3>
                <p className="text-light2 leading-relaxed mb-4">
                    Those <code className="text-accent text-sm">createElement</code> calls return nested plain objects.
                    That's the whole data format. No class hierarchy, no methods, no magic.
                </p>
                <CodeBlock code={elementShape} language="js" />
                <p className="mt-3 text-light2 leading-relaxed">
                    Children live inside <code className="text-accent text-sm">props.children</code>. That's why{" "}
                    <code className="text-accent text-sm">props.children</code> behaves like any other prop — because it is one.
                </p>
            </div>

            {/* TEXT_ELEMENT */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The text node problem</h3>
                <p className="text-light2 leading-relaxed">
                    Text children are the annoying case. The string <code className="text-accent text-sm">"Hello"</code> is not
                    an object, so it can't go into the element tree as-is. We wrap it:
                </p>
                <div className="mt-3 rounded-lg bg-dark2/40 border border-dark2 px-4 py-3 font-mono text-sm text-light3">
                    {`{ type: "TEXT_ELEMENT", props: { nodeValue: "Hello", children: [] } }`}
                </div>
                <p className="mt-3 text-sm text-light3 leading-relaxed">
                    Real React skips this wrapper and handles text as a primitive for performance. We add it so the rest
                    of the codebase never needs a special case for strings.
                </p>
            </div>

            {/* type as string vs function */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">Two kinds of type</h3>
                <p className="text-light2 leading-relaxed">
                    <code className="text-accent text-sm">type</code> is either a string (a DOM tag like{" "}
                    <code className="text-accent text-sm">"div"</code>) or a function (a component like{" "}
                    <code className="text-accent text-sm">MyButton</code>). Note this now.
                </p>
                <p className="mt-2 text-light2 leading-relaxed">
                    It becomes the entire basis of Part 7.
                </p>
            </div>

            {/* JSX pragma */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The pragma, and why it's gone</h3>
                <p className="text-light2 leading-relaxed">
                    The <code className="text-accent text-sm">/** @jsx Overreact.createElement */</code> comment used to be
                    necessary — it told Babel which function to call. The modern automatic runtime
                    (<code className="text-accent text-sm">jsx</code>/<code className="text-accent text-sm">jsxs</code> from{" "}
                    <code className="text-accent text-sm">react/jsx-runtime</code>) removed that requirement, which is why
                    you no longer import React at the top of every file.
                </p>
                <p className="mt-3 text-sm text-light3 leading-relaxed">
                    Worth noting: in the automatic runtime, <code className="text-accent text-sm">key</code> is extracted and
                    passed as a separate argument rather than living in props. That's why{" "}
                    <code className="text-accent text-sm">props.key</code> is always <code className="text-accent text-sm">undefined</code> inside
                    your component.
                </p>
            </div>

            {/* Children edge cases */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">Children edge cases</h3>
                <ul className="space-y-2 text-light2">
                    <li className="flex gap-3 items-start">
                        <span className="shrink-0 mt-1.5 size-1 rounded-full bg-dark3" />
                        <span>
                            Arrays from <code className="text-accent text-sm">.map()</code> are flattened before filtering.
                        </span>
                    </li>
                    <li className="flex gap-3 items-start">
                        <span className="shrink-0 mt-1.5 size-1 rounded-full bg-dark3" />
                        <span>
                            <code className="text-accent text-sm">null</code>, <code className="text-accent text-sm">undefined</code>,{" "}
                            <code className="text-accent text-sm">false</code>, and <code className="text-accent text-sm">true</code> are
                            filtered out. That's why{" "}
                            <code className="text-accent text-sm">{`{condition && <Thing />}`}</code> renders nothing when condition
                            is false — not the string <code className="text-accent text-sm">"false"</code>.
                        </span>
                    </li>
                </ul>
            </div>

            {/* The code */}
            <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-light mb-3">The code — stage 1</h3>
                <CodeBlock code={createElementCode} language="js" filename="src/overreact/element.js" />
            </div>

            {/* Break it */}
            <div className="mt-10 rounded-xl border border-dark2/80 bg-dark/60 p-5">
                <p className="text-xs font-mono tracking-widest text-dark3 uppercase mb-2">Break it</p>
                <p className="text-light2">
                    You have a perfect description of a UI.
                </p>
                <p className="mt-1 text-light2">
                    Zero pixels have moved. Nothing has touched the DOM.
                </p>
            </div>

            {/* Collapsibles */}
            <div className="mt-6 space-y-3">
                <Collapsible summary="Real React — ReactElement.js" variant="footnote">
                    <p className="text-sm text-light2 leading-relaxed">
                        Real React adds <code className="text-accent text-sm">{"$$typeof: Symbol.for('react.element')"}</code> to
                        every element. It's XSS protection: a JSON-injected fake element object can't have a Symbol property
                        (symbols don't survive JSON serialization), so React can safely reject it. The source is{" "}
                        <code className="text-accent text-sm">packages/react/src/ReactElement.js</code>.
                    </p>
                </Collapsible>

                <Collapsible summary="If you're coding along" variant="warning">
                    <p className="text-sm text-light2 leading-relaxed">
                        The most common mistake at this stage is handling <code className="text-accent text-sm">config</code> as
                        always an object. When JSX has no props (e.g., <code className="text-accent text-sm">{`<br />`}</code>),
                        Babel passes <code className="text-accent text-sm">null</code> for config. The{" "}
                        <code className="text-accent text-sm">config ?? {}</code> guards against that — forgetting it gives a
                        "Cannot destructure property of null" error immediately.
                    </p>
                    <p className="mt-3 text-sm text-light2 leading-relaxed">
                        Also: children passed as a prop (<code className="text-accent text-sm">{`<Comp children={x} />`}</code>) and
                        as JSX content (<code className="text-accent text-sm">{`<Comp>{x}</Comp>`}</code>) can conflict.
                        The JSX content form spreads into <code className="text-accent text-sm">props.children</code> after the
                        config spread, so it wins.
                    </p>
                </Collapsible>
            </div>
        </PartSection>
    );
}
