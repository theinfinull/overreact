export default function Hero() {
    return (
        <section className="relative h-screen w-full">
            {/* Background Image */}
            <img
                src="/hero-background.jpg"
                alt=""
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 size-full object-cover object-[85%_center] hue-rotate-240"
            />

            {/* Hero Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-start justify-center px-6 sm:px-10 md:px-12 md:items-center">
                {/* Top Spacing */}
                <div className="shrink-0 h-4 xs:h-0 md:h-12" aria-hidden="true" />

                {/* Pulsating Badge */}
                <div className="mb-7 hidden md:block">
                    <span className="inline-flex items-center gap-2.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium tracking-widest text-bg backdrop-blur-sm">
                        <span className="relative flex size-2 shrink-0" aria-hidden="true">
                            <span className="absolute inline-flex size-full rounded-full bg-violet-500 opacity-75 animate-ping" />
                            <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
                        </span>
                        A DO-IT-YOURSELF REACT GUIDE
                    </span>
                </div>

                <img
                    src="/hero-mascot.svg"
                    alt=""
                    className="-my-12 -ml-10 max-h-64 sm:-my-16 sm:-ml-11 sm:max-h-72 md:-my-18 md:mx-5 md:max-h-82"
                />

                <h1 className="text-[clamp(2.75rem,9vw+0.75rem,3.25rem)] xs:text-[clamp(3rem,2rem+3.5vw,5rem)] leading-14 xs:leading-tight font-bold text-left md:text-center max-w-[16ch] text-balance">
                    How{" "}
                    <span className="relative inline-block border-x-2 border-violet-600 bg-violet-200/30 px-2 leading-none text-bg/90 before:absolute before:-top-1.5 before:-left-1.25 before:size-2 before:rounded-full before:bg-violet-600 before:content-[''] after:absolute after:-right-1.25 after:-bottom-1.5 after:size-2 after:rounded-full after:bg-violet-600 after:content-['']">
                        React
                    </span>{" "}
                    Works{" "}
                    <span className="md:bg-linear-to-b md:from-white md:via-white md:to-gray-700 md:bg-clip-text md:text-transparent">
                        Under The Hood?
                    </span>
                </h1>

                <p className="font-hand text-lede mt-6 w-[32ch] max-w-full text-left font-light tracking-wide text-gray-200 xs:w-[46ch] md:text-center">
                    I got tired of hearing <span className="highlight-violet-800">"React handles that for you"</span>,
                    so I opened the hood and rebuilt the engine. Scroll down and we’ll take the whole thing apart.
                </p>

                <div className="mt-8 flex flex-col items-start gap-4 xs:flex-row xs:items-center md:mt-10">
                    <a
                        href="#story"
                        className="rounded-full border-2 border-white bg-white px-4.5 py-1.5 font-bold text-bg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        Pop the hood
                    </a>
                    <a
                        href="https://github.com/theinfinull/overreact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border-2 border-white bg-bg px-4.5 py-1.5 font-medium transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        Read the source
                    </a>
                </div>

                <p className="font-hand mt-16 text-left text-xl tracking-wide text-violet-300 md:mt-10 md:text-center">
                    fun fact: this entire page is rendered <br />
                    <span className="highlight-violet-800 text-gray-200">by Overreact</span>, not React.
                </p>

                {/* Bottom Spacing */}
                <div className="shrink-0 h-0 xs:h-2 md:h-0" aria-hidden="true" />
            </div>
        </section>
    );
}
