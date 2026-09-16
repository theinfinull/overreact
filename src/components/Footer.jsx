import Icon from "./Icon";
import { ArrowUpRight } from "lucide";

const TERMS = [
    "createElement",
    "fiber",
    "workLoop",
    "reconcile",
    "commitRoot",
    "useState",
    "useEffect",
    "requestIdleCallback",
];

const GITHUB_REPO = "https://github.com/theinfinull/overreact";
const PORTFOLIO = "https://theinfinull.com";

function MarqueeTrack({ suffix }) {
    const items = [...TERMS, ...TERMS];

    return (
        <div className="flex shrink-0 items-center">
            {items.map((term, index) => (
                <span key={`${suffix}-${term}-${index}`} className="flex shrink-0 items-center">
                    <span className="px-5 text-[13px] font-medium tracking-wide whitespace-nowrap text-dark sm:px-6 sm:text-sm">
                        {term}
                    </span>
                    <span className="size-1.5 shrink-0 rounded-full bg-dark/50" />
                </span>
            ))}
        </div>
    );
}

function ContactCard() {
    return (
        <a
            href={PORTFOLIO}
            target="_blank"
            rel="noopener noreferrer"
            className="w-48 shrink-0 rounded-3xl bg-light p-1.5 transition-transform hover:scale-105 hover:-rotate-2"
        >
            <div className="overflow-hidden rounded-2xl">
                <img src="/pics/me.jpg" alt="Sedhu Madhav" className="aspect-square size-full object-cover" />
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-1.5 px-0.5 pb-px">
                <div className="flex items-center gap-0.5">
                    <img
                        src="/pics/infinull.webp"
                        alt=""
                        className="size-5 shrink-0 rounded-full object-cover object-[45%_center]"
                    />
                    <span className="truncate text-[0.65rem] font-medium text-dark">@theinfinull</span>
                </div>
                <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-dark px-2 py-1 text-[0.65rem] font-medium text-light">
                    About Me
                    <Icon icon={ArrowUpRight} size={11} strokeWidth={2.4} />
                </div>
            </div>
        </a>
    );
}

export default function Footer() {
    return (
        <footer className="relative bg-dark">
            <div className="absolute inset-x-0 top-0 z-10 -translate-y-1/2" aria-hidden="true">
                <div className="relative w-[115%] ml-[-7.5%] -rotate-2 overflow-hidden py-2.5 sm:py-3 border-b-16 border-dark">
                    <img
                        src="/hero-background.jpg"
                        alt=""
                        className="pointer-events-none absolute inset-0 size-full object-cover object-[50%_8%] hue-rotate-240"
                    />
                    <div className="relative flex w-max animate-marquee">
                        <MarqueeTrack suffix="a" />
                        <MarqueeTrack suffix="b" />
                    </div>
                </div>
            </div>

            <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 px-8 pt-20 pb-16 text-center sm:px-12 md:flex-row md:items-end md:justify-between md:pb-20 md:text-left">
                <div className="max-w-sm">
                    <a href="/" className="inline-flex items-center gap-1.5 font-semibold">
                        <img src="/overreact.svg" alt="" className="size-6 shrink-0" />
                        <span>Overreact</span>
                    </a>
                    <p className="mt-3 text-sm leading-relaxed text-light2">
                        A lightweight implementation of React. Check out the source code on{" "}
                        <a
                            href={GITHUB_REPO}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="highlight-violet-800"
                        >
                            Github
                        </a>.
                    </p>
                    <p className="mt-3 text-xs text-dark3">
                        Last updated September 2026. React 19 comparisons.
                    </p>
                </div>

                <ContactCard />
            </div>
        </footer>
    );
}
