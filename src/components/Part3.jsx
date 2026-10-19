import { AlertCircle } from "lucide";
import Callout from "./Callout";
import ChapterSource from "./ChapterSource";
import CodeBlock from "./CodeBlock";
import ReconciliationDemo from "./ReconciliationDemo";
import SubTitle from "./SubTitle";
import Title from "./Title";

export default function Part3() {
    return (
        <div>
            <Title id="reconciliation" chapter="Three">Reconciliation</Title>
            <p>
                We can put a tree on screen. Nice. But an app isn't a screenshot - text changes, buttons appear,
                and people type into inputs. Rebuilding everything on each update would throw away those DOM nodes,
                along with things like focus and whatever the user was typing.
            </p>
            <p>
                So let's compare what we want next with what we already have. That comparison is called
                reconciliation. The element tree describes the next UI; the old fibers remember the last committed one.
                Put them side by side and we can decide what to keep, add, or remove.
            </p>
            <ReconciliationDemo />
            <SubTitle id="previous-tree">Comparing The Trees</SubTitle>
            <p>
                After committing, save <code>wipRoot</code> as <code>currentRoot</code>. On the next render,
                set the new root's <code>alternate</code> to currentRoot. Also start a fresh <code>deletions</code>
                array to collect old fibers that won't belong in the new tree.
            </p>

            <p>
                Replace the child-building loop in performUnitOfWork with{" "}
                <code>reconcileChildren(fiber, fiber.props.children)</code>. Traversal stays the same; child creation now checks the old tree.
            </p>

            <p>
                For this version, children match by position. Compare the first new child with the first old child,
                the second with the second, and so on. At each position we've got three possibilities:
            </p>
            <ol>
                <li>Same type: keep the old DOM node, give the new fiber its new props, and mark it <code>UPDATE</code>.</li>
                <li>New element, different type (or no old fiber): make a fiber marked <code>PLACEMENT</code>.</li>
                <li>Old fiber, different type (or no new element): mark the old fiber <code>DELETION</code>.</li>
            </ol>
            <CodeBlock title="reconcileChildren.js">{`
                function reconcileChildren(parent, elements) {
                    let oldFiber = parent.alternate?.child
                    let previousSibling = null
                    let index = 0

                    while (index < elements.length || oldFiber) {
                        const element = elements[index]
                        const sameType = oldFiber && element && oldFiber.type === element.type
                        let newFiber = null

                        if (sameType) {
                            newFiber = {
                                type: oldFiber.type,
                                props: element.props,
                                dom: oldFiber.dom,
                                parent,
                                alternate: oldFiber,
                                effectTag: "UPDATE",
                            }
                        } else if (element) {
                            newFiber = {
                                type: element.type,
                                props: element.props,
                                dom: null,
                                parent,
                                alternate: null,
                                effectTag: "PLACEMENT",
                            }
                        }

                        if (oldFiber && !sameType) {
                            oldFiber.effectTag = "DELETION"
                            deletions.push(oldFiber)
                        }
                        if (newFiber) {
                            if (!previousSibling) parent.child = newFiber
                            else previousSibling.sibling = newFiber
                            previousSibling = newFiber
                        }
                        oldFiber = oldFiber?.sibling
                        index++
                    }
                }
            `}</CodeBlock>
            <p>
                Notice the loop keeps going even after the new elements run out. Otherwise we'd never notice the old
                children that need removing. Those deletions live in a separate list because they won't be in the new tree.
            </p>
            <Callout icon={AlertCircle} color="orange">
                These examples match children by position. Reorderable lists need stable keys and move handling;
                this is a teaching diff, not React's full algorithm.
            </Callout>
            <SubTitle id="updating-dom">Applying The Changes</SubTitle>
            <p>
                Reusing a node is half the job. Our <code>updateDom(dom, previous, next)</code> helper clears
                removed props, assigns changed values, and replaces changed event listeners. Remove the old listener
                before adding the new one, or a click could call both. The complete helper is in the source below.
            </p>

            <p>
                For new nodes, createDom calls <code>updateDom(dom, {"{}"}, fiber.props)</code> - empty previous
                props mean everything is new. These examples handle simple DOM properties and events, not all React DOM behavior.
            </p>

            <p>
                The commit phase carries out the plan: <code>deletions.forEach(commitWork)</code> first,
                then <code>commitWork(wipRoot.child)</code>. New nodes go before the next already-mounted sibling when there is one - just appending
                would put a replacement in the wrong place if it wasn't the last child.
            </p>
            <CodeBlock title="commitWork.js">{`
                function commitWork(fiber) {
                    if (!fiber) return
                    const parentDom = fiber.parent.dom

                    if (fiber.effectTag === "DELETION") {
                        parentDom.removeChild(fiber.dom)
                        return // don't wander into the old fiber's siblings
                    }
                    if (fiber.effectTag === "PLACEMENT") {
                        parentDom.insertBefore(fiber.dom, nextMountedDom(fiber))
                    } else if (fiber.effectTag === "UPDATE") {
                        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
                    }
                    commitWork(fiber.child)
                    commitWork(fiber.sibling)
                }
            `}</CodeBlock>

            <p>
                Now a second render updates the first one. Our UI has a past, and we finally know how to use it.
                Next, let's give those trees a nicer way to grow: functions.
            </p>
            <ChapterSource
                eyebrow="Chapter Three source"
                title="Chapter Three — final version"
                zipHref="/examples/part3.zip"
            >
                Here's the complete project at this stopping point. Download it, unzip it, and run 
                <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
