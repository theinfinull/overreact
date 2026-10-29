// createElement
export function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
}

export function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children
                .flat(Infinity)
                .filter((child) => child != null && typeof child !== "boolean")
                .map((child) => (typeof child === "object" ? child : createTextElement(child))),
        },
    };
}

// render
export function render(element, container) {
    const node = element.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);

    const isProperty = (key) => key !== "children";
    Object.keys(element.props)
        .filter(isProperty)
        .forEach((name) => {
            node[name] = element.props[name];
        });

    element.props.children.forEach((child) => render(child, node));

    container.appendChild(node);
}
