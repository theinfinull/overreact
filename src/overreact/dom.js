import { TEXT_ELEMENT } from "./element.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_CAMEL_ATTRS = new Set([
    "attributeName",
    "attributeType",
    "baseFrequency",
    "calcMode",
    "clipPathUnits",
    "filterUnits",
    "gradientTransform",
    "gradientUnits",
    "keyPoints",
    "keySplines",
    "keyTimes",
    "markerHeight",
    "markerUnits",
    "markerWidth",
    "maskContentUnits",
    "maskUnits",
    "numOctaves",
    "pathLength",
    "patternContentUnits",
    "patternTransform",
    "patternUnits",
    "preserveAlpha",
    "preserveAspectRatio",
    "primitiveUnits",
    "refX",
    "refY",
    "repeatCount",
    "repeatDur",
    "spreadMethod",
    "startOffset",
    "stdDeviation",
    "surfaceScale",
    "textLength",
    "viewBox",
]);

export function createDom(fiber) {
    let dom = null;
    if (fiber.type === TEXT_ELEMENT) {
        dom = document.createTextNode("");
    } else if (isSvgElement(fiber)) {
        dom = document.createElementNS(SVG_NS, fiber.type);
    } else {
        dom = document.createElement(fiber.type);
    }

    updateDom(dom, {}, fiber.props);
    return dom;
}

function isSvgElement(fiber) {
    if (fiber.type === "svg") return true;

    for (let parent = fiber.parent; parent; parent = parent.parent) {
        if (parent.type === "foreignObject") return false;
        if (parent.type === "svg") return true;
    }
    return false;
}

const isEventProp = (key) => key.startsWith("on");
const isChildrenProp = (key) => key === "children";
const eventNameOf = (key) => key.slice(2).toLowerCase();
const isChanged = (key, prevProps, nextProps) => prevProps[key] !== nextProps[key];
const isSvgNode = (dom) => dom.namespaceURI === SVG_NS;

function setSvgAttr(dom, key, value) {
    const name = svgAttrName(key);
    if (value == null || value === false) {
        dom.removeAttribute(name);
        return;
    }
    dom.setAttribute(name, value === true ? "true" : value);
}

function svgAttrName(key) {
    if (key === "className") return "class";
    if (SVG_CAMEL_ATTRS.has(key)) return key;
    return key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}
export function updateDom(dom, prevProps, nextProps) {
    // remove old props
    Object.keys(prevProps)
        .filter((key) => !isChildrenProp(key) && isChanged(key, prevProps, nextProps))
        .forEach((key) => {
            if (isEventProp(key)) {
                dom.removeEventListener(eventNameOf(key), prevProps[key]);
            } else if (!(key in nextProps)) {
                if (isSvgNode(dom)) {
                    dom.removeAttribute(svgAttrName(key));
                } else {
                    dom[key] = "";
                }
            }
        });

    // add new props
    Object.keys(nextProps)
        .filter((key) => !isChildrenProp(key) && isChanged(key, prevProps, nextProps))
        .forEach((key) => {
            if (isEventProp(key)) {
                dom.addEventListener(eventNameOf(key), nextProps[key]);
            } else if (isSvgNode(dom)) {
                setSvgAttr(dom, key, nextProps[key]);
            } else {
                dom[key] = nextProps[key];
            }
        });
}
