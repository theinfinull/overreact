import { useEffect, useState } from "../overreact";

const SECTIONS = [
    { id: "introduction", label: "Introduction", depth: 2 },
    { id: "parsing-rendering", label: "Parsing & Rendering", depth: 2 },
    { id: "swapping-out-react", label: "Swapping Out React", depth: 3 },
    { id: "create-element", label: "Implementing createElement", depth: 3 },
    { id: "jsx-compiler", label: "Telling Your Compiler", depth: 3 },
    { id: "render", label: "Implementing render", depth: 3 },
];

const railClass = "pointer-events-none col-start-1 row-start-1 self-start overflow-visible opacity-0";

export default function SectionNav() {
    const [activeId, setActiveId] = useState(SECTIONS[0].id);

    useEffect(() => watchSectionNav(setActiveId), []);

    return (
        <aside className="hidden w-58 shrink-0 self-stretch min-[72rem]:block">
            <nav className="sticky top-28 z-10" aria-label="Sections" id="section-nav">
                <p className="mb-3 ms-4.25 font-mono text-xs font-medium leading-none tracking-wider text-dark/40 uppercase">
                    Contents
                </p>
                <div className="grid min-h-0 max-h-[calc(100vh-10rem)] grid-cols-1 overflow-y-auto" id="section-nav-wrap">
                    <svg className={railClass} id="section-nav-rail" aria-hidden="true" />
                    <svg
                        className={`${railClass} transition-[clip-path] duration-300 ease-out [clip-path:polygon(0_0,0_0,0_0,0_0)]`}
                        id="section-nav-progress"
                        aria-hidden="true"
                    />
                    <div className="relative col-start-1 row-start-1 flex flex-col" id="section-nav-links">
                        {SECTIONS.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className={`relative block py-1.5 text-[0.8125rem] leading-snug no-underline transition-colors duration-150 ${item.depth <= 2 ? "ps-5" : "ps-7"} ${activeId === item.id ? "text-accent" : "text-dark/45 hover:text-dark"}`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </nav>
        </aside>
    );
}

function watchSectionNav(setActiveId) {
    const nav = document.getElementById("section-nav");
    const links = Array.from(document.querySelectorAll("#section-nav-links a"));
    const mutedRail = document.getElementById("section-nav-rail");
    const activeRail = document.getElementById("section-nav-progress");

    if (!nav || links.length === 0 || !mutedRail || !activeRail) {
        return undefined;
    }

    const offset = 120;
    let currentId = "";
    let frame = 0;
    const segments = [];

    const depthX = (depth) => (depth <= 2 ? 8 : 16);
    const headingOf = (id) => document.getElementById(id);

    const activeHeadingId = () => {
        let current = SECTIONS[0].id;
        for (const item of SECTIONS) {
            const heading = headingOf(item.id);
            if (heading && heading.getBoundingClientRect().top - offset <= 0) {
                current = item.id;
            }
        }
        return current;
    };

    const drawRails = () => {
        segments.length = 0;
        let path = "";
        let width = 0;
        let height = 0;
        let previous = -1;

        links.forEach((link, index) => {
            const item = SECTIONS[index];
            if (!item) return;

            const x = depthX(item.depth) + 0.5;
            const styles = getComputedStyle(link);
            const start = link.offsetTop + parseFloat(styles.paddingTop);
            const end = link.offsetTop + link.clientHeight - parseFloat(styles.paddingBottom);

            width = Math.max(x + 8, width);
            height = Math.max(height, end);

            if (previous === -1) {
                path += ` M${x} ${start} L${x} ${end}`;
            } else {
                const prior = segments[previous];
                path += ` C ${prior[2]} ${start - 4} ${x} ${prior[1] + 4} ${x} ${start} L${x} ${end}`;
            }

            segments.push([start, end, x]);
            previous = index;
        });

        [mutedRail, activeRail].forEach((rail, index) => {
            rail.setAttribute("viewBox", `0 0 ${width} ${height}`);
            rail.setAttribute("width", String(width));
            rail.setAttribute("height", String(height));
            rail.style.opacity = "1";
            rail.replaceChildren();

            const track = document.createElementNS("http://www.w3.org/2000/svg", "path");
            track.setAttribute("d", path);
            track.setAttribute("fill", "none");
            track.setAttribute("stroke-width", "1");
            track.setAttribute(
                "stroke",
                index === 0
                    ? "color-mix(in oklab, var(--color-dark) 16%, transparent)"
                    : "var(--color-accent)",
            );
            rail.appendChild(track);
        });

        clipActiveRail(currentId || SECTIONS[0].id);
    };

    const clipActiveRail = (id) => {
        const index = SECTIONS.findIndex((item) => item.id === id);
        const segment = segments[index];
        if (!segment) {
            activeRail.style.clipPath = "polygon(0 0, 0 0, 0 0, 0 0)";
            return;
        }
        const [start, end] = segment;
        activeRail.style.clipPath = `polygon(0 ${start}px, 100% ${start}px, 100% ${end}px, 0 ${end}px)`;
    };

    const activate = (id) => {
        if (id === currentId) return;
        currentId = id;
        clipActiveRail(id);
        setActiveId(id);
    };

    const releaseFromFooter = () => {
        const footer = document.querySelector("footer");
        nav.style.transform = "";
        if (!footer) return;

        const stopAt = (footer.firstElementChild ?? footer).getBoundingClientRect().top;
        const risen = window.innerHeight - stopAt;
        if (risen > 0) nav.style.transform = `translateY(${-risen}px)`;
    };

    const sync = () => {
        activate(activeHeadingId());
        releaseFromFooter();
    };

    const scheduleDraw = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            drawRails();
            sync();
        });
    };

    const resize = new ResizeObserver(scheduleDraw);
    const list = document.getElementById("section-nav-links");
    const wrap = document.getElementById("section-nav-wrap");
    if (list) resize.observe(list);
    if (wrap) resize.observe(wrap);

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("hashchange", sync);

    const start = async () => {
        if ("fonts" in document) await document.fonts.ready.catch(() => undefined);
        scheduleDraw();
    };
    start();

    return () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        window.removeEventListener("scroll", sync);
        window.removeEventListener("hashchange", sync);
    };
}
