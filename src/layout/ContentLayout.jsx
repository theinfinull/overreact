import SectionNav from "../components/SectionNav";

export default function ContentLayout({ children }) {
    return (
        <div className="content relative min-h-screen w-full bg-light text-dark">
            <div className="section-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative z-10 mx-auto flex w-full max-w-page items-stretch justify-center gap-12 px-6 py-16 sm:px-10 sm:py-20 min-[72rem]:gap-16">
                <SectionNav />
                <div id="story" className="w-full min-w-0 max-w-prose">
                    {children}
                </div>
                <div className="hidden w-[14.5rem] shrink-0 min-[72rem]:block" />
            </div>
        </div>
    );
}
