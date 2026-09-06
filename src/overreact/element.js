export const TEXT_ELEMENT = "TEXT_ELEMENT";

export function createElement(type, config, ...children) {
    const { key = null, ...props } = config ?? {};

    return {
        type,
        key,
        props: { ...props, children: toChildElements(children) },
    };
}

/** Flattens a render result into elements: nested arrays go away, `null`/`false` are dropped. */
export function toChildElements(children) {
    return children
        .flat(Infinity)
        .filter((child) => child != null && typeof child !== "boolean")
        .map((child) => (typeof child === "object" ? child : createTextElement(child)));
}

function createTextElement(text) {
    return {
        type: TEXT_ELEMENT,
        key: null,
        props: { nodeValue: text, children: [] },
    };
}
