export const PLACEMENT = "PLACEMENT";
export const UPDATE = "UPDATE";
export const DELETION = "DELETION";

/**
 * builds child fibers for `parentFiber` by diffing `elements` against the
 * previous tree (`parentFiber.alternate`). unmatched fibers are tagged DELETION.
 *
 * keyed elements match by key; unkeyed elements match by position. a matched
 * fiber that now sits before one we already kept is flagged `moved`, so the
 * commit phase knows to reposition its dom.
 */
export function reconcileChildren(parentFiber, elements, deletions) {
    const previous = previousChildren(parentFiber);
    const remove = (fiber) => {
        fiber.effectTag = DELETION;
        deletions.push(fiber);
    };

    let previousSibling = null;
    let lastKeptIndex = 0;

    elements.forEach((element, index) => {
        let oldFiber = previous.claim(element);
        if (oldFiber && oldFiber.type !== element.type) {
            remove(oldFiber);
            oldFiber = null;
        }

        const fiber = createFiber(element, parentFiber, oldFiber);
        if (oldFiber) {
            const oldIndex = previous.indexOf(oldFiber);
            if (oldIndex < lastKeptIndex) fiber.moved = true;
            else lastKeptIndex = oldIndex;
        }
        if (index === 0) {
            parentFiber.child = fiber;
        } else {
            previousSibling.sibling = fiber;
        }
        previousSibling = fiber;
    });

    previous.unclaimed().forEach(remove);
}

function previousChildren(parentFiber) {
    const keyed = new Map();
    const unkeyed = [];
    const positions = new Map();

    for (let fiber = parentFiber.alternate?.child ?? null; fiber; fiber = fiber.sibling) {
        positions.set(fiber, positions.size);
        if (fiber.key == null) {
            unkeyed.push(fiber);
        } else {
            keyed.set(fiber.key, fiber);
        }
    }

    let nextUnkeyed = 0;

    return {
        claim(element) {
            if (element.key == null) {
                return unkeyed[nextUnkeyed++] ?? null;
            }
            const fiber = keyed.get(element.key) ?? null;
            keyed.delete(element.key);
            return fiber;
        },
        indexOf(fiber) {
            return positions.get(fiber);
        },
        unclaimed() {
            return [...keyed.values(), ...unkeyed.slice(nextUnkeyed)];
        },
    };
}

function createFiber(element, parent, alternate) {
    return {
        type: element.type,
        key: element.key,
        props: element.props,
        dom: alternate?.dom ?? null,
        parent,
        alternate,
        effectTag: alternate ? UPDATE : PLACEMENT,
        moved: false,
    };
}
