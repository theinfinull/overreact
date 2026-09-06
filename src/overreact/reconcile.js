export const PLACEMENT = "PLACEMENT";
export const UPDATE = "UPDATE";
export const DELETION = "DELETION";

/**
 * Builds the child fibers of `parentFiber` by diffing `elements` against the
 * children of the previously rendered tree. Fibers that are no longer rendered
 * are tagged and pushed onto `deletions` for the commit phase to unmount.
 *
 * Keyed elements are matched by key, so they survive being reordered. Unkeyed
 * elements are matched by position among the previous unkeyed children.
 */
export function reconcileChildren(parentFiber, elements, deletions) {
    const previous = previousChildren(parentFiber);
    const remove = (fiber) => {
        fiber.effectTag = DELETION;
        deletions.push(fiber);
    };

    let previousSibling = null;

    elements.forEach((element, index) => {
        let oldFiber = previous.claim(element);
        if (oldFiber && oldFiber.type !== element.type) {
            remove(oldFiber);
            oldFiber = null;
        }

        const fiber = createFiber(element, parentFiber, oldFiber);
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

    for (let fiber = parentFiber.alternate?.child ?? null; fiber; fiber = fiber.sibling) {
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
    };
}
