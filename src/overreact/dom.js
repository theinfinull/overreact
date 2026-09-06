import { TEXT_ELEMENT } from "./element.js";

export function createDom(fiber) {
    const dom = fiber.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(fiber.type);
    updateDom(dom, {}, fiber.props);
    return dom;
}

const isEventProp = (key) => key.startsWith("on");
const eventNameOf = (key) => key.slice(2).toLowerCase();

export function updateDom(dom, prevProps, nextProps) {
    for (const key of Object.keys(prevProps)) {
        if (key === "children" || prevProps[key] === nextProps[key]) continue;

        if (isEventProp(key)) {
            dom.removeEventListener(eventNameOf(key), prevProps[key]);
        } else if (!(key in nextProps)) {
            dom[key] = "";
        }
    }

    for (const key of Object.keys(nextProps)) {
        if (key === "children" || prevProps[key] === nextProps[key]) continue;

        if (isEventProp(key)) {
            dom.addEventListener(eventNameOf(key), nextProps[key]);
        } else {
            dom[key] = nextProps[key];
        }
    }
}
