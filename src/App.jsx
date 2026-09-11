import Navbar from "./components/Navbar";

export default function App() {
    return (
        <div>
            <Navbar />
            {/* Background */}
            <div className="relative h-screen w-screen ">
                <img
                    className="absolute inset-0 h-full w-full object-cover object-[85%_center] hue-rotate-190"
                    src="/inspirations/fire-bg.jpg"
                    alt="hero background"
                ></img>
            </div>

            {/* Hero overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-start md:items-center z-10">
                {/* hero heading */}
                <div className="p-17"></div>
                <div className="px-12 pb-7">
                    <span className="inline-flex items-center gap-2.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium tracking-widest text-bg backdrop-blur-sm">
                        <span className="relative flex size-2 shrink-0" aria-hidden="true">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-500 opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-sky-600" />
                        </span>
                        A BUILD-IT YOURSELF GUIDE
                    </span>
                </div>

                <h1 className="text-6xl font-bold text-left align-text-bottom leading-tight md:text-center md:text-7xl">
                    <span className="block px-12">
                        How{" "}
                        <span className="inline-block relative px-2 border-x-2 border-sky-600 bg-sky-200/30 text-bg/90 leading-none">
                            React
                            <span
                                className="absolute -top-1.5 -left-1.25 size-2 rounded-full bg-sky-600"
                                aria-hidden="true"
                            />
                            <span
                                className="absolute -bottom-1.5 -right-1.25 size-2 rounded-full bg-sky-600"
                                aria-hidden="true"
                            />
                        </span>{" "}
                        Works
                    </span>

                    <span className="block bg-linear-to-b from-white via-white to-gray-700 bg-clip-text text-transparent px-12">
                        Under The Hood ?
                    </span>
                </h1>
                <p className="font-serif mt-6 max-w-xl px-12 text-left text-md font-light tracking-wide text-gray-200 md:text-center">
                    I got tired of hearing <span className="font-serif highlight-pen">"React handles that for you"</span>, so I opened the hood and rebuilt the engine.
                    Scroll down and we’ll take the whole thing apart together — elements, fibers, the work loop,
                    reconciliation, and the array that hooks pretend not to be.
                </p>
                <div className="mt-10 px-12 flex flex-wrap items-center gap-4">
                    <a
                        href="#story"
                        className="text-bg rounded-full bg-white px-4.5 py-1.5 font-bold transition-transform hover:-translate-y-1 active:translate-y-0.5 border-2 border-white"
                    >
                        Pop the hood
                    </a>
                    <a
                        href="https://github.com/theinfinull/overreact"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="rounded-full bg-bg px-4.5 py-1.5 font-medium transition-transform hover:-translate-y-1 active:translate-y-0.5 border-2"
                    >
                        Read the source
                    </a>
                </div>
            </div>

            {/* fixme: dummy area, remove this afterwards */}
            <div className="h-screen w-screen"></div>
        </div>
    );
}
