import CodeBlock from "./CodeBlock";
import Illustration from "./Illustration";
import SubTitle from "./SubTitle";
import Title from "./Title";
import WelcomeReader from "./WelcomeReader";

export default function Part1() {
    return (
        <div>
            {/* Theory Stuff */}
            <Title chapter={"One"}>Parsing & Rendering</Title>
            <WelcomeReader />
            <p>
                This is JSX. As you can see, we've got both script and markup living in the same place. It might look
                like magic, but it's really just syntactic sugar.
            </p>
            <p>
                The upside? Each JSX file exports a function that returns a component, and these components nest inside
                each other to build up whole UI.
            </p>
            <Illustration
                src="illustrations/part1-components.png"
                description="fig 1.1 - nested JSX components"
                className="pb-4"
            ></Illustration>
            <p>
                Behind the scenes, JSX is compiled into standard JavaScript, replacing HTML markup with{" "}
                <code>createElement</code> function calls, passing the HTML tags, attributes, and children as arguments.
            </p>
            <Illustration
                src="illustrations/part1-jsx-compilation.png"
                description="fig 1.2 - JSX compilation"
                className="pl-6"
            ></Illustration>
            <p>
                In simple terms, <code>createElement</code> takes its arguments and builds a plain object out of them -
                that's a React element. Hand that object to <code>render</code>, and it turns into actual DOM.
            </p>
            {/* Coding Stuff */}
            <SubTitle>1.1 Example</SubTitle>
            <p>Let's start with a simple react app:</p>
            <CodeBlock title="main.jsx">
                {`
                const container = document.getElementById("root")

                // parsing the markup
                const element = <h1 title="foo">Hello</h1>

                // rendering
                ReactDOM.render(element, container)
            `}
            </CodeBlock>
            <p>
                Let's swap out the HTML markup with react element object that <code>createElement</code> would return
                and render the element ourself into actual DOM.
            </p>
            <CodeBlock title="main.jsx">
                {`
                    const container = document.getElementById("root")

                    // parsing the markup
                    const reactElement = { type: "h1", props: { title: "foo", children: "Hello" }, }

                    // rendering
                    const node = document.createElement(reactElement.type)
                    node["title"] = reactElement.props.title
                    const text = document.createTextNode("")
                    text["nodeValue"] = reactElement.props.children
                    node.appendChild(text)
                    container.appendChild(node)
            `}
            </CodeBlock>
            <p>
                That's really all there is to parsing and rendering, the only job left is to make a universal{" "}
                <code>createElement</code> and <code>render</code> that can parse and render any valid markup.
            </p>

            <SubTitle>1.2 Making createElement</SubTitle>

            <p>
                The react element is a JS object with <code>type</code>, <code>props</code> and a few other fields. But
                we'll be only focussing on these two.{" "}
            </p>

            <ol>
                <li>
                    The <code>type</code> holds the element's tag (i.e. <code>h1</code>, <code>div</code>)
                </li>
                <li>
                    <code>props</code> holds everything else - attributes like <code>title</code>, plus a{" "}
                    <code>children</code> field for whatever's nested inside.
                </li>
            </ol>

            <CodeBlock title="createElement.js">
                {`
                            function createElement(type, props, ...children) {
                                return {
                                    type,
                                    props: {
                                        ...props,
                                        children,
                                    },
                                }
                            }
                        `}
            </CodeBlock>

            <p>
                That's it. Call it with the same values from earlier and you'll get back the exact same shape we built
                by hand.
            </p>

            <CodeBlock title="main.jsx">
                {`
                            const element = createElement("h1", { title: "foo" }, "Hello")

                            // { type: "h1", props: { title: "foo", children: ["Hello"] } }
                        `}
            </CodeBlock>

            <p>
                There's a catch though. Not every child is a react element - <code>"Hello"</code> is just a string, and
                numbers work the same way. Those primitives don't have a <code>type</code> or <code>props</code>, so
                they don't match the shape we'll expect when we walk the tree later.
            </p>

            <p>
                So, purely for convenience, we wrap them. That way every react element ends up the same shape - no
                missing props, no surprise errors down the line. A small object with <code>type: "TEXT_ELEMENT"</code>,
                the actual text sitting in <code>nodeValue</code>, and an empty <code>children</code> array, since a
                string has nothing nested inside it.
            </p>

            <CodeBlock title="createElement.js">
                {`
                            function createTextElement(text) {
                                return {
                                    type: "TEXT_ELEMENT",
                                    props: {
                                        nodeValue: text,
                                        children: [],
                                    },
                                }
                            }

                            function createElement(type, props, ...children) {
                                return {
                                    type,
                                    props: {
                                        ...props,
                                        children: children.map((child) =>
                                            typeof child === "object" ? child : createTextElement(child)
                                        ),
                                    },
                                }
                            }
                        `}
            </CodeBlock>

            <p>
                Now every child is an element. Call it again and <code>"Hello"</code> is no longer a bare string:
            </p>

            <CodeBlock title="main.jsx">
                {`
                            const element = createElement("h1", { title: "foo" }, "Hello")

                            // {
                            //   type: "h1",
                            //   props: {
                            //     title: "foo",
                            //     children: [
                            //       { type: "TEXT_ELEMENT", props: { nodeValue: "Hello", children: [] } }
                            //     ]
                            //   }
                            // }
                        `}
            </CodeBlock>

            <SubTitle>1.3 Making render</SubTitle>

            <p>
                If <code>createElement</code>'s job is turning arguments into an object, <code>render</code>'s job is
                turning that object into something the browser actually understands. Same steps as our manual version,
                just generalized to work for any element instead of one hardcoded <code>h1</code>.
            </p>

            <CodeBlock title="render.js">
                {`
                            function render(element, container) {
                                const node =
                                    element.type === "TEXT_ELEMENT"
                                        ? document.createTextNode("")
                                        : document.createElement(element.type)

                                const isProperty = (key) => key !== "children"
                                Object.keys(element.props)
                                    .filter(isProperty)
                                    .forEach((name) => {
                                        node[name] = element.props[name]
                                    })

                                element.props.children.forEach((child) => render(child, node))

                                container.appendChild(node)
                            }
                        `}
            </CodeBlock>

            <p>
                Two things changed from our hand-rolled version: props get assigned generically instead of one at a
                time, and children are handled recursively. Because we wrapped those leaf primitives, every child is
                already an element - so <code>render</code> can walk them the same way. The only extra branch is
                creating a text node when <code>type</code> is <code>TEXT_ELEMENT</code>.
            </p>

            <p>
                Wire it up and you've got a tiny, working stand-in for <code>ReactDOM.render</code>:
            </p>

            <CodeBlock title="main.jsx">
                {`
                            const container = document.getElementById("root")
                            const element = createElement("h1", { title: "foo" }, "Hello")

                            render(element, container)
                        `}
            </CodeBlock>
        </div>
    );
}
