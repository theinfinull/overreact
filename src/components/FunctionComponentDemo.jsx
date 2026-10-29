import { ChevronLeft, ChevronRight, Pause, Play } from "lucide";
import { useEffect } from "../overreact";
import Icon from "./Icon";

const PEOPLE = [
    { name: "Ada", role: "Manager", image: "/images/avatars/ada.webp" },
    { name: "Linus", role: "Analyst", image: "/images/avatars/linus.webp" },
    { name: "Grace", role: "Engineer", image: "/images/avatars/grace.webp" },
];

// `shown` is how many cards are on screen; the newest one is the person in the code line
const STEPS = [
    {
        shown: 0,
        text: "Functional components let you build reusable, self-contained blocks of UI. Build one once and use it anywhere.",
    },
    {
        shown: 1,
        text: "Pass in some props and you get a component back.",
    },
    {
        shown: 2,
        text: "Change the props and you get a different one.",
    },
    { shown: 3, text: "And you can keep reusing it as many times as you like." },
];

const TICK_MS = 2200;
const HOLD_END_MS = 3200;

const BUTTON_CLASS =
    "grid size-10 cursor-pointer touch-manipulation place-items-center rounded-full text-dark/55 transition-colors duration-150 [-webkit-tap-highlight-color:transparent] hover:bg-dark/5 hover:text-dark focus-visible:bg-dark/5 focus-visible:text-dark focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent active:bg-dark/9";

// each card's slot is reserved up front, so nothing shifts as cards appear
const CARD_CLASS =
    "flex h-full flex-col overflow-hidden rounded-lg border border-light2 bg-white text-xs text-dark sm:rounded-xl sm:text-[13px] " +
    "shadow-[0_1px_2px_rgb(0_0_0/0)] transition-[opacity,translate,box-shadow] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] " +
    "data-hidden:translate-y-1.5 data-hidden:opacity-0 " +
    "data-[state=current]:shadow-[0_2px_4px_rgb(0_0_0/0.06),0_14px_28px_-10px_rgb(0_0_0/0.22)]";

const PROPS = ["name", "role", "image"];

const propValues = (person) => ({
    name: person?.name ?? "",
    role: person?.role ?? "",
    image: person ? `${person.name.toLowerCase()}.jpg` : "",
});

const domId = (part, index) => `function-demo-${part}-${index}`;

export default function FunctionComponentDemo() {
    useEffect(() => animateProfiles(), []);

    return (
        <figure className="group/walk mb-8" id="function-demo">
            <div className="overflow-hidden rounded-2xl border border-light2 bg-light">
                <div className="flex min-h-60 flex-col items-center justify-center gap-5 px-4 py-6 sm:px-6 sm:py-7">
                    <div className="w-full max-w-144 overflow-hidden rounded-[10px] border border-light2 bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.18)]">
                        <div className="flex h-8.5 items-center gap-1.5 border-b border-light2 bg-neutral-50 px-3">
                            <i className="size-2.25 rounded-full bg-light3" />
                            <i className="size-2.25 rounded-full bg-light3" />
                            <i className="size-2.25 rounded-full bg-light3" />
                            <span className="-mb-px ml-2.5 self-end rounded-t-md border border-b-0 border-light2 bg-white px-3 py-1.5 text-[11px] text-dark3">
                                App.jsx
                            </span>
                        </div>
                        <pre className="m-0 overflow-x-auto px-4 py-3.5 font-mono text-xs leading-[1.7] whitespace-pre">
                            <code id="function-demo-code" className="block text-zinc-500">
                                {"<"}
                                <span className="text-green-700">ProfileCard</span>
                                {PROPS.map((prop) => [
                                    " ",
                                    <span key={prop} className="text-sky-700">
                                        {prop}
                                    </span>,
                                    "=",
                                    <span key={`${prop}-value`} className="text-amber-700">
                                        "<span id={domId("prop", prop)} />"
                                    </span>,
                                ])}
                                {" />"}
                            </code>
                        </pre>
                    </div>

                    <div className="grid w-full max-w-144 grid-cols-3 gap-2 sm:gap-3">
                        {PEOPLE.map((person, i) => (
                            <div key={person.name} className="min-w-0 rounded-lg bg-gray-100 sm:rounded-xl">
                                <div id={domId("card", i)} className={CARD_CLASS} data-hidden>
                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        loading="lazy"
                                        className="block aspect-square w-full border-b border-light2 bg-gray-100 object-cover"
                                    />
                                    <div className="flex min-w-0 flex-col gap-0.5 px-2 pt-2 pb-2.5 sm:px-3 sm:pt-2.5 sm:pb-3">
                                        <b className="truncate">{person.name}</b>
                                        <span className="truncate text-[11px] text-dark/55 sm:text-xs">
                                            {person.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-light2 px-5 pt-4 pb-3">
                    <div id="function-demo-caption" className="mb-2 min-h-13 text-base leading-relaxed text-dark/75" />

                    <div className="flex items-center gap-4">
                        <div className="flex flex-1 items-center gap-1" aria-hidden="true">
                            {STEPS.map((_, index) => (
                                <span
                                    key={String(index)}
                                    id={domId("tick", index)}
                                    className="h-0.5 max-w-6 flex-1 rounded-full bg-light2 transition-colors duration-300 data-[state=done]:bg-light3 data-[state=current]:bg-accent"
                                />
                            ))}
                        </div>
                        <div className="-me-2 flex items-center">
                            <button
                                type="button"
                                id="function-demo-prev"
                                className={BUTTON_CLASS}
                                aria-label="Previous step"
                            >
                                <Icon icon={ChevronLeft} size={18} />
                            </button>
                            <button
                                type="button"
                                id="function-demo-play"
                                className={BUTTON_CLASS}
                                aria-label="Play or pause"
                            >
                                <Icon icon={Pause} size={16} className="hidden group-data-playing/walk:block" />
                                <Icon icon={Play} size={16} className="block group-data-playing/walk:hidden" />
                            </button>
                            <button
                                type="button"
                                id="function-demo-next"
                                className={BUTTON_CLASS}
                                aria-label="Next step"
                            >
                                <Icon icon={ChevronRight} size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <figcaption className="mt-2 text-center text-xs text-gray-500">
                fig 4.1 - One function, different data
            </figcaption>
        </figure>
    );
}

// steps are applied straight to the DOM: a state-driven tick would re-render the whole app every frame.
function animateProfiles() {
    const root = document.getElementById("function-demo");
    if (!root) return undefined;

    const byId = (id) => document.getElementById(id);
    const code = byId("function-demo-code");
    const caption = byId("function-demo-caption");
    const playButton = byId("function-demo-play");
    const prevButton = byId("function-demo-prev");
    const nextButton = byId("function-demo-next");

    let step = 0;
    let playing = true;
    let visible = false;
    let timer = 0;

    const setState = (el, state) => {
        if (!el) return;
        if (state) el.dataset.state = state;
        else delete el.dataset.state;
    };

    const apply = () => {
        const current = STEPS[step];
        const values = propValues(PEOPLE[current.shown - 1]);

        if (PROPS.some((prop) => byId(domId("prop", prop)).textContent !== values[prop])) {
            PROPS.forEach((prop) => {
                byId(domId("prop", prop)).textContent = values[prop];
            });
            code.animate(
                [
                    { opacity: 0, transform: "translateY(4px)" },
                    { opacity: 1, transform: "none" },
                ],
                {
                    duration: 350,
                    easing: "ease-out",
                },
            );
        }

        PEOPLE.forEach((_, i) => {
            const card = byId(domId("card", i));
            card.toggleAttribute("data-hidden", i >= current.shown);
            setState(card, i === current.shown - 1 ? "current" : undefined);
        });

        STEPS.forEach((_, index) => {
            setState(byId(domId("tick", index)), index === step ? "current" : index < step ? "done" : undefined);
        });

        if (caption.textContent !== current.text) {
            caption.textContent = current.text;
            caption.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 350,
                easing: "ease-out",
            });
        }
        root.toggleAttribute("data-playing", playing);
    };

    const schedule = () => {
        clearTimeout(timer);
        if (!playing || !visible) return;
        const delay = step === STEPS.length - 1 ? HOLD_END_MS : TICK_MS;
        timer = setTimeout(() => {
            step = (step + 1) % STEPS.length;
            apply();
            schedule();
        }, delay);
    };

    const goTo = (next) => {
        step = (next + STEPS.length) % STEPS.length;
        playing = false;
        apply();
        schedule();
    };

    const onPlay = () => {
        playing = !playing;
        if (playing && step === STEPS.length - 1) step = 0;
        apply();
        schedule();
    };
    const onPrev = () => goTo(step - 1);
    const onNext = () => goTo(step + 1);

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
