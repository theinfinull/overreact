import { useEffect } from "../overreact";
import { playSteps, setDataState } from "../util/stepPlayer";
import StepControls from "./StepControls";

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

                <StepControls prefix="function-demo" count={STEPS.length} />
            </div>
            <figcaption className="mt-2 text-center text-xs text-gray-500">
                fig 4.1 - One function, different data
            </figcaption>
        </figure>
    );
}

function animateProfiles() {
    const byId = (id) => document.getElementById(id);

    return playSteps({
        prefix: "function-demo",
        steps: STEPS,
        onStep: (current) => {
            const values = propValues(PEOPLE[current.shown - 1]);

            if (PROPS.some((prop) => byId(domId("prop", prop)).textContent !== values[prop])) {
                PROPS.forEach((prop) => {
                    byId(domId("prop", prop)).textContent = values[prop];
                });
                byId("function-demo-code").animate(
                    [
                        { opacity: 0, transform: "translateY(4px)" },
                        { opacity: 1, transform: "none" },
                    ],
                    { duration: 350, easing: "ease-out" },
                );
            }

            PEOPLE.forEach((_, i) => {
                const card = byId(domId("card", i));
                card.toggleAttribute("data-hidden", i >= current.shown);
                setDataState(card, i === current.shown - 1 ? "current" : undefined);
            });
        },
    });
}
