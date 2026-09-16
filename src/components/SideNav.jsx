import { useState, useEffect } from "/src/overreact";

const NAV_ITEMS = [
    { id: "abstract", label: "Abstract", paperLabel: "Abstract" },
    { id: "part-1", label: "JSX is a lie", paperLabel: "Method §1" },
    { id: "part-2", label: "Pixels, finally", paperLabel: "Method §2" },
    { id: "part-3", label: "The 16.7ms problem", paperLabel: "Method §3" },
    { id: "part-4", label: "A stack you can put down", paperLabel: "Method §4" },
    { id: "part-5", label: "Don't let them see you working", paperLabel: "Method §5" },
    { id: "part-6", label: "Spot the difference", paperLabel: "Method §6" },
    { id: "part-7", label: "Components aren't real", paperLabel: "Method §7" },
    { id: "part-8", label: "Your state lives in an array", paperLabel: "Method §8" },
    { id: "part-8-5", label: "The art of doing nothing", paperLabel: "Method §8.5" },
    { id: "part-9", label: "Limitations & future work", paperLabel: "Limitations" },
    { id: "discussion", label: "The diff is a choice", paperLabel: "Discussion" },
    { id: "conclusion", label: "Future work", paperLabel: "Future work" },
    { id: "glossary", label: "Glossary", paperLabel: "Appendix A" },
    { id: "source-map", label: "Source map", paperLabel: "Appendix B" },
    { id: "credits", label: "Credits", paperLabel: "Related work" },
];

export default function SideNav() {
    const [activeId, setActiveId] = useState("");

    useEffect(() => {
        const observers = [];

        NAV_ITEMS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveId(id);
                        }
                    });
                },
                { rootMargin: "-10% 0px -85% 0px", threshold: 0.1 }
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav className="hidden xl:block fixed top-24 left-[max(1rem,calc((100%-90rem)/2+1rem))] w-52 z-40" aria-label="Section navigation">
            <ul className="space-y-0.5">
                {NAV_ITEMS.map(({ id, label, paperLabel }) => {
                    const isActive = activeId === id;
                    return (
                        <li key={id}>
                            <button
                                onClick={() => scrollTo(id)}
                                className={`w-full text-left pl-3 pr-2 py-1.5 border-l-2 transition-colors ${
                                    isActive
                                        ? "border-accent text-accent"
                                        : "border-transparent text-dark3 hover:text-light3 hover:border-dark3"
                                }`}
                            >
                                <p className="text-[10px] font-mono tracking-wide opacity-60 truncate">{paperLabel}</p>
                                <p className="text-xs truncate">{label}</p>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
