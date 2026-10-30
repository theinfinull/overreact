/** sets (or clears) the `data-state` attribute that the demos' tailwind variants key off. */
export function setDataState(el, state) {
    if (!el) return;
    if (state) el.dataset.state = state;
    else delete el.dataset.state;
}

/**
 * drives a step-by-step demo: autoplay while on screen, prev/play/next buttons, the caption and the progress ticks.
 * `<StepControls prefix={...} />` renders the matching markup. `onStep(step, index)` paints the demo's own visuals.
 * steps are applied straight to the DOM: a state-driven tick would re-render the whole app every frame.
 */
export function playSteps({ prefix, steps, onStep, tickMs = 2200, holdMs = 3200 }) {
    const root = document.getElementById(prefix);
    if (!root) return undefined;

    const byId = (name) => document.getElementById(`${prefix}-${name}`);
    const caption = byId("caption");
    const playButton = byId("play");
    const prevButton = byId("prev");
    const nextButton = byId("next");
    const last = steps.length - 1;

    let index = 0;
    let playing = true;
    let visible = false;
    let timer = 0;

    const apply = () => {
        const step = steps[index];
        onStep(step, index);

        steps.forEach((_, i) => {
            setDataState(byId(`tick-${i}`), i === index ? "current" : i < index ? "done" : undefined);
        });

        if (caption.textContent !== step.text) {
            caption.textContent = step.text;
            caption.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease-out" });
        }
        root.toggleAttribute("data-playing", playing);
    };

    const schedule = () => {
        clearTimeout(timer);
        if (!playing || !visible) return;
        timer = setTimeout(
            () => {
                index = (index + 1) % steps.length;
                apply();
                schedule();
            },
            index === last ? holdMs : tickMs,
        );
    };

    const goTo = (next) => {
        index = (next + steps.length) % steps.length;
        playing = false;
        apply();
        schedule();
    };

    const onPlay = () => {
        playing = !playing;
        if (playing && index === last) index = 0;
        apply();
        schedule();
    };
    const onPrev = () => goTo(index - 1);
    const onNext = () => goTo(index + 1);

    playButton.addEventListener("click", onPlay);
    prevButton.addEventListener("click", onPrev);
    nextButton.addEventListener("click", onNext);

    const observer = new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting;
            schedule();
        },
        { threshold: 0.4 },
    );
    observer.observe(root);

    apply();

    return () => {
        clearTimeout(timer);
        observer.disconnect();
        playButton.removeEventListener("click", onPlay);
        prevButton.removeEventListener("click", onPrev);
        nextButton.removeEventListener("click", onNext);
    };
}
