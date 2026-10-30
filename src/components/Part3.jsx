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
            <CodeBlock title="render.js">{`
                let currentRoot = null // the last tree we committed
                let deletions = []

                function render(element, container) {
                    wipRoot = {
                        dom: container,
                        props: {
                            children: [element],
                        },
                        alternate: currentRoot,
                    }
                    deletions = []
                    nextUnitOfWork = wipRoot
                    scheduleWork()
                }
            `}</CodeBlock>

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
                Reusing a node is only half the job. The <code>updateDom(dom, previous, next)</code> helper makes the
                reused node match its new props: it clears the ones that disappeared, assigns the ones that changed, and
                swaps changed event listeners.
            </p>
            <CodeBlock title="updateDom.js">{`
                const isEvent = (key) => key.startsWith("on")
                const isProperty = (key) => key !== "children" && !isEvent(key)
                const eventType = (key) => key.slice(2).toLowerCase()

                function updateDom(dom, previous, next) {
                    // remove changed listeners before adding new ones, or both would fire
                    Object.keys(previous)
                        .filter(isEvent)
                        .filter((key) => previous[key] !== next[key])
                        .forEach((key) => dom.removeEventListener(eventType(key), previous[key]))

                    // clear removed props
                    Object.keys(previous)
                        .filter(isProperty)
                        .filter((key) => !(key in next))
                        .forEach((key) => {
                            dom[key] = ""
                        })

                    // assign changed props
                    Object.keys(next)
                        .filter(isProperty)
                        .filter((key) => previous[key] !== next[key])
                        .forEach((key) => {
                            dom[key] = next[key]
                        })

                    // add changed listeners
                    Object.keys(next)
                        .filter(isEvent)
                        .filter((key) => previous[key] !== next[key])
                        .forEach((key) => dom.addEventListener(eventType(key), next[key]))
                }
            `}</CodeBlock>
            <p>
                Event props like <code>onClick</code> get their own path. Assigning <code>dom.onClick</code> wouldn't do
                anything, so we turn the name into an event type (<code>onClick</code> becomes <code>click</code>) and
                use <code>addEventListener</code>. That also lets us call <code>removeEventListener</code> on the old
                handler, which is why it has to come before adding the new one. Skip that and a click fires both.
            </p>

            <p>
                New nodes go through the same path. <code>createDom</code> calls{" "}
                <code>{"updateDom(dom, {}, fiber.props)"}</code>, and with empty previous props, everything counts as
                new.
            </p>

            <p>
                The commit phase then carries out the plan. First <code>deletions.forEach(commitWork)</code> removes the
                dead nodes, then <code>commitWork(wipRoot.child)</code> places and updates the rest, and finally{" "}
                <code>wipRoot</code> becomes <code>currentRoot</code>, ready to be the "old tree" next time.
            </p>
            <CodeBlock title="commitRoot.js">{`
                function commitRoot() {
                    deletions.forEach(commitWork)
                    commitWork(wipRoot.child)
                    currentRoot = wipRoot
                    wipRoot = null
                    deletions = []
                }
            `}</CodeBlock>
            <p>
                A new node gets inserted before its next already-mounted sibling, when there is one. Plain appending
                would put a replacement in the wrong spot whenever it isn’t the last child. We skip siblings that are
                also brand new, since they aren't on the page yet.
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

                // the first later sibling already on the page, or null to append
                function nextMountedDom(fiber) {
                    for (let sibling = fiber.sibling; sibling; sibling = sibling.sibling) {
                        if (sibling.effectTag !== "PLACEMENT") return sibling.dom
                    }
                    return null
                }
            `}</CodeBlock>

            <p>
                A second render now updates the first one instead of rebuilding from scratch. Next, function components.
                They let us split our UI into reusable pieces and actually scale our code.
            </p>
            <ChapterSource
                eyebrow="Version Three"
                title="Source Till Now"
                zipHref="/examples/overreact-chap3.zip"
                stackblitzHref="https://stackblitz.com/edit/overreact-chap3?file=src%2Fmain.jsx"
            >
                Here's the complete project at this stopping point. Download it, unzip it, and run{" "}
                <code>npm install</code> then <code>npm run dev</code>.
            </ChapterSource>
        </div>
    );
}
