import { useEffect } from "../overreact";

const CONTAINER_ID = "comments";

const DISCUSSION_TERM = import.meta.env.VITE_ENV === "PROD" ? "Overreact Comments" : "Overreact Comments [Dev]";

const THEME = `${location.origin}/giscus-theme.css`;

export default function Comments() {
    useEffect(() => {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        const script = document.createElement("script");
        script.src = "https://giscus.app/client.js";
        script.async = true;
        script.crossOrigin = "anonymous";
        script.dataset.repo = "theinfinull/overreact";
        script.dataset.repoId = "R_kgDOUO57JA";
        script.dataset.category = "General";
        script.dataset.categoryId = "DIC_kwDOUO57JM4DJ_xB";
        script.dataset.mapping = "specific";
        script.dataset.term = DISCUSSION_TERM;
        script.dataset.strict = "1";
        script.dataset.reactionsEnabled = "1";
        script.dataset.emitMetadata = "0";
        script.dataset.inputPosition = "top";
        script.dataset.theme = THEME;
        script.dataset.lang = "en";
        script.dataset.loading = "lazy";
        container.appendChild(script);

        return () => container.replaceChildren();
    }, []);

    return (
        <section className="mt-16 sm:mt-20">
            <h2 className="text-2xl font-semibold">Comments</h2>
            <p className="mt-2 mb-6 text-dark3">Leave your thoughts, love and hot takes below.</p>
            <div id={CONTAINER_ID} />
        </section>
    );
}
