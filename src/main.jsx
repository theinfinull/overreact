import * as overreact from "./overreact.js";

// 1. get root element
const container = document.getElementById("root");

const mainDivID = "maindiv";
const element = (
    <div id={mainDivID}>
        <h1>Heading</h1>
        <p>Lorem ipsium, blah blah blah. Something like that</p>
    </div>
);

// 3. append node to root
overreact.render(element, container);
