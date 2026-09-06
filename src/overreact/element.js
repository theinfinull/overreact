export const TEXT_ELEMENT = "TEXT_ELEMENT";

/** creates a virtual element (the JSX/runtime output shape). */
export function createElement(type, config, ...children) {
    const { key = null, ...props } = config ?? {};

    return {
        type,
        key,
        props: {
            ...props,
            children: toChildElements(children),
        },
    };
}

/** wraps a string/number primitive as a text node element. */
function createTextElement(text) {
    return {
        type: TEXT_ELEMENT,
        key: null,
        props: { nodeValue: text, children: [] },
    };
}

/** flatten, drop null/falses and handle text element creation for children  */
export function toChildElements(children) {
    return children
        .flat(Infinity)
        .filter((child) => child != null && typeof child !== "boolean")
        .map((child) => (typeof child === "object" ? child : createTextElement(child)));
}
