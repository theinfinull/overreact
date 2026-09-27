export default function SubTitle({ children, id }) {
    return (
        <div id={id} className="scroll-mt-28">
            <h1 className="text-2xl font-bold mb-8">{children}</h1>
        </div>
    );
}
