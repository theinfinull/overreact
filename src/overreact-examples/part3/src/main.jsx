import { createElement, render } from "./overreact.js";
import "./styles.css";

const container = document.getElementById("root");
let updated = false;
function draw() {
    render(<main>
        <h1>{updated ? "Hey again!" : "Hello!"}</h1>
        <p>Type below, then update. The input node is reused.</p>
        <input placeholder="Keep my text" />
        <button onClick={() => { updated = !updated; draw(); }}>Update the tree</button>
        {updated && <p>I'm a newly placed child.</p>}
        <footer>This sibling stays after the new child.</footer>
    </main>, container);
}
draw();
