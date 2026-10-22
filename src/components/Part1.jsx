import CodeBlock from "./CodeBlock";
import Illustration from "./Illustration";
import SubTitle from "./SubTitle";
import Title from "./Title";
import WelcomeReader from "./WelcomeReader";
import Callout from "./Callout";
import ChapterSource from "./ChapterSource";
import { Lightbulb } from "lucide";

export default function Part1() {
    return (
        <div>
            {/* Theory Stuff */}
            <Title id="parsing-rendering" chapter={"One"}>
                Parsing & Rendering
            </Title>
            <WelcomeReader />
            <p>
                This is JSX. As you can see, we've got both script and markup living in the same place. It might look
                like magic, but it's really just syntactic sugar.
            </p>
            <p>
                The upside? A component can be a function that returns elements, and those components nest inside each
                other to build up a whole UI.
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
            <p>Let's start with a simple react app:</p>
            <CodeBlock title="main.jsx">
                {`
                const container = document.getElementById("root")

                // parsing the markup
                const element = <h1 title="foo">Hello</h1>

                // rendering
                ReactDOM.createRoot(container).render(element)
            `}
            </CodeBlock>
            <p>
                Let's swap out the JSX with the element object that <code>createElement</code> would return and render
                the element ourselves into actual DOM.
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

            <SubTitle id="create-element">Building Elements & Wiring JSX</SubTitle>

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
                                        children: children.flat(Infinity)
                                            .filter(child => child != null && typeof child !== "boolean")
                                            .map(child => typeof child === "object" ? child : createTextElement(child)),
                                    },
                                }
                            }
                        `}
            </CodeBlock>

            <p>
                Arrays show up when you map a list. Null and booleans show up in conditional JSX. Flatten the arrays and
                skip those empty children, but keep numbers - even zero is valid text.
            </p>

            <p>
                Now tell the JSX compiler to use our function instead of React's. We'll use the classic transform with
                Vite 7's esbuild settings:
            </p>

            <CodeBlock title="vite.config.js">
                {`
                    import { defineConfig } from "vite"

                    export default defineConfig({
                        esbuild: {
                            // the function to call
                            jsxFactory: "createElement",
                            // injecting createElement import
                            jsxInject: \`import { createElement } from "/src/overreact"\`,
                        },
                    })
                `}
            </CodeBlock>
            <p>
                <code>jsxFactory</code> turns the markup into <code>createElement("h1", ...)</code>.{" "}
                <code>jsxInject</code> sticks the import at the top of every JSX file, so you don't have to.
            </p>

            <SubTitle id="render">
                Implementing <code>render</code>
            </SubTitle>

            <p>
                If <code>createElement</code>'s job is turning arguments into an object, <code>render</code>'s job is
                turning that object into something the browser actually understands. Same steps as our manual version,
                just generalized to work for any element instead of one hardcoded <code>h1</code>.
            </p>

            <CodeBlock title="render.js">
                {`
                            function render(element, container) {
                                const node = element.type === "TEXT_ELEMENT"
                                        ? document.createTextNode("")
                                        : document.createElement(element.type)

                                const isProperty = (key) => key !== "children"
                                Object.keys(element.props)
                                    .filter(isProperty)
                                    .forEach((name) => {node[name] = element.props[name]})

                                element.props.children.forEach((child) => render(child, node))

                                container.appendChild(node)
                            }
                        `}
            </CodeBlock>

            <p>
                Now props get assigned generically instead of one at a time, and children are handled recursively.
                Because we wrapped those leaf primitives, every child is already an element, so <code>render</code> can
                walk them the same way. The only extra branch is creating a text node when <code>type</code> is{" "}
                <code>TEXT_ELEMENT</code>.
            </p>

            <p>Wire 'em up, and we've got ourselves a simple renderer.</p>

            <CodeBlock title="main.jsx">
                {`
                            const container = document.getElementById("root")
                            const element = createElement("h1", { title: "foo" }, "Hello")

                            render(element, container)
                        `}
            </CodeBlock>

            <p>
                Now the renderer can mount any element you throw at it. But it needs some optimization and refactoring,
                because a huge tree can cause real trouble. We'll get to that in the next chapter.
            </p>

            <ChapterSource
                eyebrow="Version One"
                title="Source Till Now"
                zipHref="/example/overreact-chap1.zip"
                stackblitzHref="https://stackblitz.com/edit/overreact-chap1?file=src%2Fmain.jsx"
            >
                Here's the complete version of what we built till now, along with the Vite config that connects them.
                Download it, unzip it, and run <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
