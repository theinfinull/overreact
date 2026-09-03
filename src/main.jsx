import * as overreact from "./overreact";

// 1. get root element
const root = document.getElementById("root");

/** @jsx overreact.createElement */
const element = (
    <div id="maindiv">
        <h1>Heading</h1>
        <p>Lorem ipsium, blah blah blah. Something like that</p>
    </div>
);

// 3. append node to root (NOTE: now it won't work coz it expects object of type 'Node')
root.appendChild(element);
