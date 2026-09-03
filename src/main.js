import { createElement } from "./overreact";

// 1. get root element
const root = document.getElementById("root");

// 2. construct the node
const element = {
    type: "div",
    props: {
        id: "maindiv",
    },
    children: [
        {
            type: "h1",
            props: null,
            children: "Heading",
        },
        {
            type: "p",
            children: "Lorem ipsium, blah blah blah. Something like that",
        },
    ],
};

const node = createElement(element);

// 3. append node to root (NOTE: now it won't work coz it expects object of type 'Node')
root.appendChild(node);
