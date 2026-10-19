export default function Title({ children, chapter, id, flush }) {
    const isFinalChapter = chapter === "final";
    return (
        <div id={id} className={`scroll-mt-28 ${flush ? "" : "mt-24"}`}>
            <div className="font-hand text-dark text-xl font-semibold">
                {isFinalChapter ? "Final " : "Chapter "}
                <span className="text-accent">{isFinalChapter ? "Chapter" : chapter}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight">{children}</h2>
        </div>
    );
}
