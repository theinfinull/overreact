import { AlertCircle } from "lucide";
import Icon from "./Icon";
import SubTitle from "./SubTitle";
import Title from "./Title";
import Callout from "./Callout";

export default function Intro() {
    const currentYear = new Date().getFullYear();
    return (
        <div>
            <Title chapter={"Zero"}>Introduction</Title>

            <p>Before we take a peek under the hood, let's start with the basics - What exactly is React?</p>

            <Callout icon={AlertCircle} color="yellow">
                This blog assumes you already know your way around React. Don't worry if you aren't an expert, you can
                always Google unfamiliar stuff as we go!
            </Callout>

            <p>React is a UI library that does 2 things very well.</p>
            <ol>
                <li>
                    {" "}
                    Modularity - it lets you break UI into reusable blocks called components, bundled with their own
                    structure and styling, yet customizable via props. It's done by JSX - a syntax that
                    lets you drop dynamic JS (wrapped in {"{...}"}) right into your markup, so your UI logic and
                    structure live in one place.
                </li>

                <li>
                    {" "}
                    Self Updating UI - Instead of manually querying and mutating DOM nodes, React handles updates
                    automatically whenever underlying state changes. It pulls this off by keeping a lightweight
                    in-memory representation of your UI. When state updates, React figures out what changed (very
                    roughly, for now) and applies those changes to the real DOM.
                </li>
            </ol>

            <p>What's our goal?</p>
            <p>
                We're going to learn how React does this by building a simpler version of it ourselves, which we'll
                call <span className="font-bold">Overreact</span>. Build it step by step, picking up rendering,
                reconciliation, hooks, and more along the way.
            </p>
            <p>And by the end, we'll have a library capable of rendering a site kinda like this one.</p>
        </div>
    );
}
