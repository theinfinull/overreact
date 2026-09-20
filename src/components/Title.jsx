export default function Title({ children, chapter }) {
    return (
        <div>
            <div className="font-hand text-dark text-lg">
                Chapter <span className="text-accent">{chapter}</span>
            </div>
            <h1 className="text-5xl font-bold mb-8">{children}</h1>
        </div>
    );
}
