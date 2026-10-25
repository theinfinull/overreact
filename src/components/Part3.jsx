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
            <Title id="reconciliation" chapter="Three">
                Reconciliation
            </Title>
            <p>
                We can put a tree on screen. Cool. But a webapp isn't a screenshot. Text changes, buttons appear, and
                people type into inputs. If every update rebuilt the DOM from nothing, each existing node would be
                discarded along with its focus and its unsaved input.
            </p>
            <p>
                To avoid that, we compare what we want next with what we already have. The new element tree describes
                the UI we're aiming for, and the old fibers remember the UI we last committed. Set them side by side and
                it becomes clear which nodes can be reused, which need to be created, and which should be removed, so
                the DOM only changes where it actually has to. This comparison is called reconciliation.
            </p>
            <ReconciliationDemo />
            <SubTitle id="previous-tree">Comparing The Trees</SubTitle>
            <p>
                After committing, save <code>wipRoot</code> as <code>currentRoot</code>. It’s your snapshot of what’s on
                screen. On the next render, the new root points its <code>alternate</code> at it, and a fresh{" "}
                <code>deletions</code> array starts collecting old fibers that don’t survive into the new tree.
            </p>

            <p>
                In <code>performUnitOfWork</code>, swap the child-building loop for{" "}
                <code>reconcileChildren(fiber, fiber.props.children)</code>. Traversal doesn’t change. Child creation
                just gets to look at the old tree first.
            </p>

            <p>
                For now, children match by position. First new child against first old child, second against second, and
                so on. Each position ends up in one of three cases:
            </p>
            <ol className="effect-list">
                <li data-effect="update" data-sign="~">
                    <code>UPDATE</code> - Same type, keep the old DOM node and give the new fiber its new props.
                </li>
                <li data-effect="placement" data-sign="+">
                    <code>PLACEMENT</code> - New element, different type (or no old fiber). Create a fresh fiber.
                </li>
                <li data-effect="deletion" data-sign="−">
                    <code>DELETION</code> - Old fiber, different type (or no new element). Mark the old fiber and push
                    it onto <code>deletions</code>.
                </li>
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
                children that need removing. Those deletions live in a separate list because they won't be in the new
                tree.
            </p>
            <Callout icon={AlertCircle} color="yellow">
                These examples match children by position. Reorderable lists need stable keys and move handling, which
                we're skipping. Think of it as the diff with the hard parts removed.
            </Callout>
            <SubTitle id="updating-dom">Applying The Changes</SubTitle>
            <p>
                Reusing a node is only half the job. The <code>updateDom(dom, previous, next)</code> helper clears
                removed props, assigns changed ones, and swaps out changed event listeners. Remove the old listener
                before adding the new one, or a click fires both. The full helper is in the source below.
            </p>

            <p>
                New nodes go through the same path. createDom calls <code>updateDom(dom, {"{}"}, fiber.props)</code>,
                and empty previous props mean everything counts as new.
            </p>

            <p>
                The commit phase then carries out the plan. <code>deletions.forEach(commitWork)</code> runs first, then
                <code>commitWork(wipRoot.child)</code>. A new node gets inserted before the next already-mounted sibling
                when there is one. Plain appending would put a replacement in the wrong spot whenever it isn’t the last
                child.
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
                A second render now updates the first instead of rebuilding from scratch. Next, function components,
                They let us split our UI into reusable pieces and actually scale our code
            </p>
            <ChapterSource
                eyebrow="Version Three"
                title="Source Till Now"
                zipHref="/example/overreact-chap3.zip"
                stackblitzHref="https://stackblitz.com/edit/overreact-chap3?file=src%2Fmain.jsx"
            >
                Here's the complete project at this stopping point. Download it, unzip it, and run
                <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
