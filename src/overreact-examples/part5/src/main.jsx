import { createElement, render, useState, useEffect } from "./overreact.js";
import "./styles.css";

function Byte() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState("Byte");
    useEffect(() => {
        const previousTitle = document.title;
        document.title = count + " presses — Overreact";
        return () => { document.title = previousTitle; };
    }, [count]);
    return <section>
        <label>Name <input value={name} onInput={e => setName(e.target.value)} /></label>
        <button className="creature" onClick={() => setCount(n => n + 1)}>
            <span>• ᴗ •</span>{count === 0 ? "Press me!" : count % 2 ? "Ouch!" : "Hey!"}
        </button>
        <p>{name}: {count} presses</p>
        <button onClick={() => { setCount(n => n + 1); setCount(n => n + 1); setCount(n => n + 1); }}>+3 queued</button>
        <button onClick={() => setCount(0)}>Reset count</button>
    </section>;
}
function App() {
    const [show, setShow] = useState(true);
    return <main><h1>A creature with a memory.</h1>
        <button onClick={() => setShow(s => !s)}>Mount / unmount Byte</button>
        {show && <Byte />}
        <footer>Unmounting resets Byte's state and cleans up its title effect.</footer>
    </main>;
}
render(<App />, document.getElementById("root"));
