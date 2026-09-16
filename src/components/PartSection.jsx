import Pipeline from "./Pipeline.jsx";

export default function PartSection({ id, partNumber, paperLabel, title, subtitle, currentPart, children }) {
    const showPipeline = typeof currentPart === "number" && currentPart >= 1 && currentPart <= 9;

    return (
        <section id={id} className="relative py-16 md:py-24 border-b border-dark2">
            <div className="mx-auto max-w-3xl px-6 sm:px-10">
                <div className="mb-8">
                    <p className="font-mono text-xs tracking-widest text-dark3 uppercase mb-3">{paperLabel}</p>
                    <div className="flex items-baseline gap-3 mb-2">
                        {partNumber !== "abstract" && partNumber !== undefined && (
                            <span className="font-mono text-sm text-dark3 shrink-0">
                                {typeof partNumber === "number" ? `§${partNumber}` : `§${partNumber}`}
                            </span>
                        )}
                        <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-light">{title}</h2>
                    </div>
                    {subtitle && <p className="text-light3 text-sm mt-1">{subtitle}</p>}
                    {showPipeline && <Pipeline currentPart={currentPart} />}
                </div>
                <div className="prose-content space-y-6 text-light2 leading-relaxed">
                    {children}
                </div>
            </div>
        </section>
    );
}
