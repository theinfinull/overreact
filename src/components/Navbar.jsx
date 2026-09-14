const BLUR_STEPS = [
    "z-[1] backdrop-blur-[64px] mask-[linear-gradient(to_bottom,#000_0%,transparent_12.5%)]",
    "z-[2] backdrop-blur-[32px] mask-[linear-gradient(to_bottom,#000_0%,#000_12.5%,transparent_25%)]",
    "z-[2] backdrop-blur-[16px] mask-[linear-gradient(to_bottom,transparent_0%,#000_12.5%,#000_25%,transparent_37.5%)]",
    "z-[3] backdrop-blur-[8px] mask-[linear-gradient(to_bottom,transparent_12.5%,#000_25%,#000_37.5%,transparent_50%)]",
    "z-[4] backdrop-blur-[4px] mask-[linear-gradient(to_bottom,transparent_25%,#000_37.5%,#000_50%,transparent_62.5%)]",
    "z-[5] backdrop-blur-[2px] mask-[linear-gradient(to_bottom,transparent_37.5%,#000_50%,#000_62.5%,transparent_75%)]",
    "z-[6] backdrop-blur-[1px] mask-[linear-gradient(to_bottom,transparent_50%,#000_62.5%,#000_75%,transparent_87.5%)]",
    "z-[7] backdrop-blur-[0.5px] mask-[linear-gradient(to_bottom,transparent_62.5%,#000_75%,#000_87.5%,transparent_100%)]",
];

export default function Navbar() {
    return (
        <header className="fixed inset-x-0 top-0 z-50">
            {/* backdrop blur */}
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-1 h-22 origin-top" aria-hidden="true">
                <div className="relative z-0 h-full w-full">
                    {BLUR_STEPS.map((step) => (
                        <div key={step} className={`absolute inset-0 mask-no-repeat mask-size-[100%_100%] ${step}`} />
                    ))}
                </div>
            </div>

            {/* navbar content */}
            <nav className="relative m-4 flex items-center justify-between rounded-lg px-4 py-2 text-white">
                {/* left: logo + sitename */}
                <a href="/" className="flex items-center gap-1.5 text-md font-semibold shrink-0 rounded-full">
                    <img src="/overreact.svg" alt="" className="size-6 shrink-0" />
                    <span>Overreact</span>
                </a>

                {/* right: navs */}
                <div className="flex items-center gap-8 text-sm font-normal text-white">
                    <a href="#">The Blog</a>
                    <a href="#">Who Made This?</a>
                </div>
            </nav>
        </header>
    );
}
