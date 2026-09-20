import { useState } from "../overreact";

function Kw({ children }) {
    return <span className="text-accent">{children}</span>;
}

export default function WelcomeReader() {
    const [name, setName] = useState("");

    return (
        <div className="mx-auto mb-8 flex w-full max-w-85 flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:items-stretch sm:gap-4">
            <figure className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-dark text-light sm:w-1/2">
                <figcaption className="border-b border-dark2 px-3 py-2 font-mono text-xs tracking-wide text-light3 sm:px-4">
                    WelcomeReader.jsx
                </figcaption>
                <pre className="min-h-0 flex-1 overflow-auto px-3 py-3 text-xs leading-relaxed sm:px-4">
                    <code className="font-mono text-light2">
                        <Kw>function</Kw>
                        {" WelcomeReader({ name }) {\n"}
                        {"  "}
                        <span className="text-light3">{"// It's editable btw"}</span>
                        {"\n  name = "}
                        <input
                            value={name}
                            placeholder="_"
                            onInput={(event) => setName(event.target.value)}
                            className="inline-block w-24 rounded-md border border-accent bg-transparent px-2 align-baseline font-mono text-xs text-accent outline-none"
                        />
                        {"\n\n  "}
                        <Kw>return</Kw>
                        {
                            ' (\n    <>\n      <img\n        src="/welcome.png"\n        alt="welcome"\n      />\n      <p>Sup {name}! grab a seat</p>\n    </>\n  );\n}'
                        }
                    </code>
                </pre>
            </figure>

            <div className="relative min-w-0 w-full overflow-hidden rounded-2xl border border-light2 sm:w-1/2">
                <img src="/welcome-rat.png" alt="" className="block size-full object-cover object-top" />
                <div className="absolute inset-x-0 top-6 text-center text-hand font-black text-light [-webkit-text-stroke:0.5em_var(--color-dark)] [paint-order:stroke_fill]">
                    Sup <span className="text-purple-400">{name || "bro"}</span> !<br />
                    grab a seat
                </div>
            </div>
        </div>
    );
}
