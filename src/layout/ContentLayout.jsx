export default function ContentLayout({children}) {
    return (
        <div className="content relative min-h-screen w-full bg-light text-dark">
            <div className="section-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="mx-auto w-full max-w-prose px-6 py-16 sm:px-10 sm:py-20 relative z-10">{children}</div>
        </div>
    );
}
