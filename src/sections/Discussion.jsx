import PartSection from "../components/PartSection";

export default function Discussion() {
    return (
        <PartSection
            id="discussion"
            partNumber={null}
            paperLabel="Discussion"
            title="The diff is a choice, not a law"
            subtitle="Solid, Svelte, Vue, and the 2013 tradeoff"
            currentPart={null}
        >
            <p className="text-xl text-light2 leading-relaxed mb-8">
                Everything on this page rests on one decision made in 2013: describe the whole UI every time, then
                diff. Solid, Svelte and Vue each decided otherwise.
            </p>

            <p className="text-light2 leading-relaxed mb-10">And they're not wrong.</p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">The original decision</h2>

            <p className="text-light2 leading-relaxed mb-4">
                React's programming model: describe the UI as a pure function of state. Call it every time state
                changes. Diff the result against the previous description. Apply the minimum set of DOM changes.
            </p>

            <p className="text-light2 leading-relaxed mb-8">
                The appeal is a single mental model for all UI: <code className="font-mono text-accent text-sm">
                (state) {"=>"} UI</code>. The cost is runtime work — producing the description and running the diff,
                on every state change, in proportion to the size of the UI.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">Solid — fine-grained reactivity</h2>

            <p className="text-light2 leading-relaxed mb-4">
                Components run once. Signals wire specific DOM nodes to specific values. When a signal changes, the
                DOM node it's wired to updates. That's it. No diff. No reconciler. Nothing from Parts 3 through 6
                exists in Solid.
            </p>

            <p className="text-light2 leading-relaxed mb-8">
                The tradeoff: reactivity propagates into your component code. You write{" "}
                <code className="font-mono text-accent text-sm">count()</code> not{" "}
                <code className="font-mono text-accent text-sm">count</code>. The UI is no longer a pure function of
                state — it's a network of subscriptions. Reactive and non-reactive values are a distinction you have
                to carry in your head.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">Svelte — compile the diff away</h2>

            <p className="text-light2 leading-relaxed mb-4">
                The Svelte compiler knows at build time which DOM operations a state change can cause. It emits
                exactly those operations — nothing more. The work React does at runtime happens at build time. The
                output is lightweight, imperative JavaScript that needs no runtime library to interpret it.
            </p>

            <p className="text-light2 leading-relaxed mb-8">
                The tradeoff: the compiler must understand your component statically. Dynamic patterns — components
                that behave differently depending on runtime conditions — require escape hatches. Some React patterns
                don't have direct Svelte equivalents.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">Vue — reactivity with compiler hints</h2>

            <p className="text-light2 leading-relaxed mb-8">
                Vue keeps a virtual DOM but the compiler annotates which parts of a template can change. The diff
                skips static subtrees. The result is a hybrid: the programming model flexibility of a virtual DOM
                with some of the runtime efficiency of a compiler. Vue 3's Vapor mode extends this further toward
                the compiled-no-vdom approach.
            </p>

            <h2 className="text-2xl font-semibold text-light mt-4 mb-4">The honest comparison</h2>

            <p className="text-light2 leading-relaxed mb-4">
                React's design pays a runtime cost to get a simpler programming model and a component system that
                doesn't require a compiler to be correct. Signals are faster and more precise but reactivity leaks
                into your code as a concept you manage explicitly. Neither is wrong. They're different points on the
                same tradeoff curve.
            </p>

            <p className="text-light2 leading-relaxed mb-8">
                React's own direction with the compiler is a partial move toward the compiled approach — which
                suggests the tradeoff will narrow. The React Compiler doesn't change the reconciler, but it removes
                the need to write memoization by hand. Svelte's approach started at the other end. They're converging.
            </p>

            <div className="p-6 rounded-lg border border-accent/20 bg-accent/5 mt-8">
                <h3 className="text-lg font-semibold text-light mb-3">The payoff</h3>
                <p className="text-light2 leading-relaxed">
                    The rules of hooks, the render-purity requirement, keys, and memoization are all consequences of
                    that single 2013 decision. Not arbitrary rules. Not framework quirks. Bills coming due for a
                    tradeoff that made sense at the time and mostly still does.
                </p>
                <p className="text-light3 text-sm mt-3 leading-relaxed">
                    If you've worked through this site, you can now trace any React rule back to its cause. That's
                    the point of knowing how something works.
                </p>
            </div>
        </PartSection>
    );
}
