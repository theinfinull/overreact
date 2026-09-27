const seen = new Set();

function blockKey(block) {
    if (block.id) return block.id;

    const section = block.parentElement;
    const story = section?.parentElement;
    if (!section || !story) return null;

    const sectionIndex = Array.from(story.children).indexOf(section);
    const blockIndex = Array.from(section.children).indexOf(block);
    return `s${sectionIndex}-${blockIndex}`;
}

export function watchReveal() {
    const story = document.getElementById("story");
    if (!story) return undefined;

    const blocks = Array.from(story.querySelectorAll(":scope > * > *"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const key = blockKey(entry.target);
                if (key) seen.add(key);
                entry.target.classList.add("is-in");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    blocks.forEach((block) => {
        const key = blockKey(block);
        block.classList.add("reveal");
        if (key && seen.has(key)) {
            block.classList.add("is-in");
            return;
        }
        observer.observe(block);
    });

    return () => observer.disconnect();
}
