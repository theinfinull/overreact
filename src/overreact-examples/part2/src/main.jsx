import { createElement, render } from "./overreact.js";
import "./styles.css";

const items = Array.from({ length: 300 }, (_, i) => <li>Fiber {i + 1}</li>);
render(<main><h1>One tree, prepared in pieces.</h1>
    <p>Nodes are attached only after all the work is ready.</p>
    <ul>{items}</ul></main>, document.getElementById("root"));
