import PartSection from "../components/PartSection";
import CodeBlock from "../components/CodeBlock";
import Collapsible from "../components/Collapsible";

const reconcileCode = `export const PLACEMENT = "PLACEMENT";
export const UPDATE = "UPDATE";
export const DELETION = "DELETION";

export function reconcileChildren(parentFiber, elements, deletions) {
    let oldFiber = parentFiber.alternate?.child ?? null;
    let previousSibling = null;

    elements.forEach((element, index) => {
        const sameType = oldFiber && oldFiber.type === element.type;

        const fiber = sameType
            ? { ...oldFiber, props: element.props, alternate: oldFiber,
                effectTag: UPDATE, parent: parentFiber }
            : { type: element.type, key: element.key, props: element.props,
                dom: null, parent: parentFiber, alternate: null, effectTag: PLACEMENT };

        if (!sameType && oldFiber) {
            oldFiber.effectTag = DELETION;
            deletions.push(oldFiber);
        }

        if (index === 0) parentFiber.child = fiber;
        else previousSibling.sibling = fiber;
        previousSibling = fiber;

        oldFiber = oldFiber?.sibling ?? null;
    });

    while (oldFiber) {
        oldFiber.effectTag = DELETION;
        deletions.push(oldFiber);
        oldFiber = oldFiber.sibling;
    }
}`;

const updateDomCode = `function updateDom(dom, prevProps, nextProps) {
    // Remove stale event listeners before adding new ones.
    // An inline arrow is a new reference every render — without this,
    // you accumulate handlers each time the component re-renders.
    Object.keys(prevProps)
        .filter(key => key.startsWith("on"))
        .filter(key => prevProps[key] !== nextProps[key])
        .forEach(key => {
            dom.removeEventListener(key.slice(2).toLowerCase(), prevProps[key]);
        });

    // Remove props that no longer exist
    Object.keys(prevProps)
        .filter(key => !key.startsWith("on") && key !== "children")
        .filter(key => !(key in nextProps))
        .forEach(key => { dom[key] = ""; });

    // Set new or changed props
    Object.keys(nextProps)
        .filter(key => !key.startsWith("on") && key !== "children")
        .filter(key => prevProps[key] !== nextProps[key])
        .forEach(key => { dom[key] = nextProps[key]; });

    // Add new event listeners
    Object.keys(nextProps)
        .filter(key => key.startsWith("on"))
        .filter(key => prevProps[key] !== nextProps[key])
        .forEach(key => {
            dom.addEventListener(key.slice(2).toLowerCase(), nextProps[key]);
        });
}`;

export default function Part6() {
    return (
        <PartSection
            id="part-6"
            partNumber={6}
            paperLabel="Method — Part 6"
            title="Spot the difference"
            subtitle="reconciliation, effect tags, and keys"
            currentPart={6}
        >
            <p className="text-xl text-light2 leading-relaxed mb-8">
                Given the previous tree and the next one, what's the minimum set of DOM operations?
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                First renders are easy. Second renders are React.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-10 mb-4">Two trees, one diff</h2>

            <p className="text-light2 leading-relaxed mb-4">
                Keep a reference to the last committed tree (
                <code className="font-mono text-accent text-sm">currentRoot</code>). Give each fiber an{" "}
                <code className="font-mono text-accent text-sm">alternate</code> pointer to its counterpart from the
                previous render. Two trees, swapped each commit — the same double-buffering from Part 5, now
                used for diffing.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                <code className="font-mono text-accent text-sm">reconcileChildren</code> compares the old fiber list
                against the new element list, position by position, and stamps each result with an effect tag:
            </p>

            <ul className="text-light2 leading-relaxed mb-6 space-y-2 pl-4">
                <li>
                    Same <code className="font-mono text-accent text-sm">type</code> →{" "}
                    <strong className="text-light">UPDATE</strong> — reuse the DOM node, only change props
                </li>
                <li>
                    Different type, new element exists →{" "}
                    <strong className="text-light">PLACEMENT</strong> — create a new DOM node
                </li>
                <li>
                    Different type, old fiber exists →{" "}
                    <strong className="text-light">DELETION</strong> — remove the DOM node
                </li>
            </ul>

            <p className="text-light2 leading-relaxed mb-6">
                Deletions can't be tagged on a node that isn't in the new tree. They go into a separate{" "}
                <code className="font-mono text-accent text-sm">deletions</code> array, processed first at commit
                before anything is added or updated.
            </p>

            <CodeBlock code={reconcileCode} language="js" filename="reconcile.js" />

            <h2 className="text-2xl font-semibold text-light mt-12 mb-4">Updating props</h2>

            <p className="text-light2 leading-relaxed mb-4">
                An UPDATE fiber doesn't need a new DOM node — just new props. The tricky part is event listeners.
                An inline arrow function is a new reference on every render. Without removing the old listener first,
                you end up with ten handlers after ten renders, all firing on the same click.
            </p>

            <CodeBlock code={updateDomCode} language="js" filename="dom.js" />

            <h2 className="text-2xl font-semibold text-light mt-12 mb-4">Keys</h2>

            <p className="text-light2 leading-relaxed mb-4">
                The diff so far compares by position. Reorder a list of ten items and every node at every position
                mismatches. Every node is rebuilt. DOM state — focus, typed values, scroll position, animation
                progress — is lost.
            </p>

            <div className="p-5 rounded-lg border border-accent/30 bg-accent/5 my-6">
                <p className="text-light font-medium mb-1 text-sm uppercase tracking-wide">Predict first</p>
                <p className="text-light2 leading-relaxed text-sm">
                    How many DOM nodes get rebuilt if you insert one item at the top of a list of ten, with no keys?
                    Most people guess one.
                </p>
                <p className="text-light font-semibold mt-3">The answer is all eleven.</p>
                <p className="text-light3 text-sm mt-2">
                    Every existing node shifts down one position. None match their old counterpart.
                    Every node is a PLACEMENT. The old ten are all DELETIONS.
                </p>
            </div>

            <p className="text-light2 leading-relaxed mb-4">
                Keys fix this. When you provide a key, the reconciler matches old fiber to new element by key
                instead of by index. The same reorder of ten items becomes ten moves instead of ten rebuilds.
            </p>

            <p className="text-light2 leading-relaxed mb-4">
                Index-as-key is the special case where keys provide no new information. When the index and the
                element always move together, keying by index is identical to no keys at all.
            </p>

            <p className="text-light2 leading-relaxed mb-6">
                One more thing worth knowing: React doesn't diff across element types. If a{" "}
                <code className="font-mono text-accent text-sm">div</code> becomes a{" "}
                <code className="font-mono text-accent text-sm">span</code>, React unmounts the entire subtree and
                mounts fresh. That's the O(n) heuristic. The exact tree diff algorithm is O(n³) and not worth it for
                any realistic UI tree.
            </p>

            <div className="mt-10 p-6 rounded-lg border border-dark2 bg-dark2/30">
                <h3 className="text-lg font-semibold text-light mb-2">Where this breaks</h3>
                <p className="text-light2 leading-relaxed">
                    Everything so far assumes{" "}
                    <code className="font-mono text-accent text-sm">fiber.type</code> is a string. Pass a function
                    component and the renderer crashes immediately — it tries to create a DOM element from a function,
                    which doesn't work, and then tries to call{" "}
                    <code className="font-mono text-accent text-sm">reconcileChildren</code> on props it doesn't have.
                </p>
            </div>

            <Collapsible summary="Real React — ReactChildFiber.js" variant="footnote">
                <p className="text-light3 leading-relaxed text-sm">
                    React renamed <code className="font-mono text-xs">effectTag</code> to{" "}
                    <code className="font-mono text-xs">flags</code> — a bitmask rather than a string, so multiple
                    flags can coexist on one fiber. The flags include Placement, Update, ChildDeletion, Snapshot,
                    Passive (for effects), Layout, and more. The keyed reconciliation builds a Map of old keyed fibers
                    and uses a two-pass algorithm. Source:{" "}
                    <code className="font-mono text-xs">packages/react-reconciler/src/ReactChildFiber.js</code> and{" "}
                    <code className="font-mono text-xs">packages/react-reconciler/src/ReactFiberFlags.js</code>.
                </p>
            </Collapsible>

            <Collapsible summary="If you're coding along" variant="warning">
                <p className="text-light3 leading-relaxed text-sm mb-3">
                    Two bugs that almost everyone hits. First: the deletions array must be reset between renders. If
                    you forget, deletions from previous renders accumulate and apply again, removing DOM nodes that
                    were just added. The symptom is content that appears for one frame and then vanishes.
                </p>
                <p className="text-light3 leading-relaxed text-sm">
                    Second: when implementing the keyed version, don't forget to mark unclaimed old fibers as
                    deletions — the ones with a key in the old tree that has no matching key in the new tree. Without
                    this, removed keyed items stay in the DOM indefinitely.
                </p>
            </Collapsible>
        </PartSection>
    );
}
