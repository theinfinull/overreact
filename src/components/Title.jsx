export default function Title({ children, chapter, id }) {
    return (
        <div id={id} className="scroll-mt-28">
            <div className="font-hand text-dark text-xl font-semibold">
                Chapter <span className="text-accent">{chapter}</span>
            </div>
            <h1 className="text-5xl font-bold mb-8 tracking-tight">{children}</h1>
        </div>
    );
}
