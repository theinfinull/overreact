import { TEXT_ELEMENT } from "./element.js";

export function createDom(fiber) {
    const dom = fiber.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(fiber.type);
    updateDom(dom, {}, fiber.props);
    return dom;
}

const isEventProp = (key) => key.startsWith("on");
const isChildrenProp = (key) => key === "children";
const eventNameOf = (key) => key.slice(2).toLowerCase();
const isChanged = (key, prevProps, nextProps) => prevProps[key] !== nextProps[key];

export function updateDom(dom, prevProps, nextProps) {
    // remove old props
    Object.keys(prevProps)
        .filter((key) => !isChildrenProp(key) && isChanged(key, prevProps, nextProps))
        .forEach((key) => {
            if (isEventProp(key)) {
                dom.removeEventListener(eventNameOf(key), prevProps[key]);
            } else if (!(key in nextProps)) {
                dom[key] = "";
            }
        });

    // add new props
    Object.keys(nextProps)
        .filter((key) => !isChildrenProp(key) && isChanged(key, prevProps, nextProps))
        .forEach((key) => {
            if (isEventProp(key)) {
                dom.addEventListener(eventNameOf(key), nextProps[key]);
            } else {
                dom[key] = nextProps[key];
            }
        });
}
