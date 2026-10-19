import { createElement, render } from "./overreact.js";
import "./styles.css";

const container = document.getElementById("root");
let show = true;
function Greeting({ name }) { return <h2>Hey, {name}!</h2>; }
function Pair() { return [<Greeting name="Byte" />, <Greeting name="you" />]; }
function App() {
    return <main><h1>Functions, all the way down.</h1>
        <button onClick={() => { show = !show; draw(); }}>Show / hide the greetings</button>
        {show && <Pair />}
        <footer>No wrapper DOM needed for Pair.</footer>
    </main>;
}
function draw() { render(<App />, container); }
draw();
