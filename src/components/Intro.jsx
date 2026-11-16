import { AlertCircle } from "lucide";
import Title from "./Title";
import Callout from "./Callout";

export default function Intro() {
    return (
        <div>
            <Title id="introduction" chapter="Zero" flush>
                Introduction
            </Title>

            <p>Before we take a peek under the hood, let's start with the basics - What exactly is React?</p>

            <Callout icon={AlertCircle} color="yellow">
                This blog assumes you already know your way around React. Don't worry if you aren't an expert, you can
                always Google unfamiliar stuff as we go!
            </Callout>

            <p>React is a UI library that does two things very well.</p>
            <ol>
                <li>
                    <b>Modularity</b> - React lets you break UI into reusable blocks called components, bundled with
                    their own structure and styling, yet customizable via props. JSX is a syntax that lets you drop
                    dynamic JS (wrapped in <code>{"{...}"}</code>) right into your markup, so your UI logic and
                    structure live in one place. It's handy, but optional - components work with plain JavaScript too.
                </li>

                <li>
                    <b>Self-updating UI</b> - Instead of manually querying and mutating DOM nodes, React handles updates
                    automatically whenever underlying state changes. It pulls this off by keeping a lightweight
                    in-memory representation of your UI. When state updates, React figures out what changed (very
                    roughly, for now) and applies those changes to the real DOM.
                </li>
            </ol>

            <p>What's our goal?</p>
            <p>
                We're going to learn how React does this by building a simpler version of it ourselves, which we'll call{" "}
                <span className="font-bold">Overreact</span>. Build it step by step, picking up rendering,
                reconciliation, hooks, and more along the way.
            </p>
            <p>Here's the route we'll take, one chapter per step:</p>
            <ol>
                <li>
                    <b>Parsing & Rendering</b> - turn JSX into plain objects, and those objects into real DOM.
                </li>
                <li>
                    <b>Rendering In Pieces</b> - split the work into small units so a big tree won't freeze the page.
                </li>
                <li>
                    <b>Reconciliation</b> - compare the old and new trees, so only what changed touches the DOM.
                </li>
                <li>
                    <b>Functional Components</b> - let a function stand in for a tag.
                </li>
                <li>
                    <b>Hooks</b> - give those functions memory with <code>useState</code> and <code>useEffect</code>.
                </li>
            </ol>
            <p>
                To follow along, all you need is a modern browser. Every chapter has a{" "}
                <a
                    href="https://stackblitz.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="highlight-accent-light"
                >
                    StackBlitz
                </a>{" "}
                project you can edit and run online. If you'd rather work locally, install Node.js and an editor, then
                download the chapter's zip.
            </p>
            <p>
                Each chapter ends with its complete project, so you can compare notes or just run it. By the end, we'll
                have a library capable of rendering a site kinda like this one.
            </p>
        </div>
    );
}
