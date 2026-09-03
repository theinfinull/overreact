// 1. get root element
const root = document.getElementById("root");

// 2. construct the node
const element = {
    type: "div",
    props: {
        id: "maindiv",
    },
    children: "let's not overreact",
};

const node = document.createElement(element.type);
node.setAttribute("id", element.props.id);
node.appendChild(document.createTextNode(element.children));

// 3. append node to root
root.appendChild(node);
