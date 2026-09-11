export default function Navbar() {
    return (
        <nav className="fixed inset-x-0 top-0 z-50 m-4 flex items-center justify-between overflow-hidden rounded-lg px-4 py-2 text-white">
            {/* Left: Logo */}
            <a href="/" className="flex items-center gap-2 text-md font-semibold shrink-0 rounded-full">
                <img src="/favicon-512.png" alt="" className="size-6 shrink-0 rounded-md" />
                <span>Overreact</span>
            </a>

            {/* Right: Nav Links */}
            <div className="flex items-center gap-8 text-sm font-normal text-white">
                <a href="#">The Blog</a>
                <a href="#">Who Made This?</a>
            </div>
        </nav>
    );
}
