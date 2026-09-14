import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

export default function App() {
    return (
        <div>
            <Navbar />
            <Hero />

            {/* fixme: dummy area, remove this afterwards */}
            <div className="h-screen w-screen"></div>
        </div>
    );
}
