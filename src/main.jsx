import * as overreact from "./overreact.js";

// 1. get root element
const container = document.getElementById("root");

const mainDivID = "maindiv";
let count = 0;
const incrementCounter = () => {
    count++;
    console.log("counter incremented to: " + count);
    overreact.render(element(), container);
};

const element = () => (
    <div id={mainDivID}>
        <h1>Overreact</h1>
        <p>This is overreact.</p>

        <button onclick={incrementCounter}>counter</button>
        <p>count: {count}</p>
    </div>
);

// 2. append node to root
overreact.render(element(), container);
