import { Heart } from "lucide";
import Callout from "./Callout";
import Title from "./Title";
import Illustration from "./Illustration";

export default function Conclusion() {
    return (
        <div>
            <Title id="conclusion" chapter="final">
                That's It
            </Title>
            <p>
                We started with a heading and a text node. Now we've got a little renderer that turns JSX into elements,
                prepares fibers in pieces, compares trees, calls components, remembers state, and runs effects with
                cleanup. That's a lot of "React will handle it" we've just handled ourselves.
            </p>

            <Illustration src="/images/diagrams/journey-recap.svg" className="pr-3 py-4"></Illustration>

            <p>
                Of course, this isn't all of React. We built a single-root renderer with a positional diff, a basic
                scheduler, and two hooks. React does much more than that, and we’ve happily left it all out of this
                afternoon’s project. Small enough to understand is the point.
            </p>

            <Callout icon={Heart} color="pink">
                Huge thanks to{" "}
                <a
                    href="https://pomb.us/build-your-own-react/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="highlight-pink-200"
                >
                    Build your own React by pomber
                </a>
                , the foundation for this project. Please read that too.
            </Callout>
            <p>
                The complete overreact source code is available on{" "}
                <a href="https://github.com/theinfinull/overreact" target="_blank" className="highlight-violet-200">
                    Github
                </a>
                , ready to tinker with. Break it, trace a render, add a hook. And next time someone says “React will
                handle this”, you'll have a pretty good idea how.
            </p>
            <div className="mb-8 text-violet-600">** Thanks for building along. Go make something weird. **</div>
        </div>
    );
}
