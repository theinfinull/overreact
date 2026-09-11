import Hero from "./components/Hero";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
    return (
        <div className="min-h-svh overflow-x-hidden min-[90rem]:border-x min-[90rem]:border-dark2">
            <Header />
            <Hero />

            {/* fixme: dummy area, remove this afterwards */}
            <div className="relative h-screen w-full bg-light">
                <div className="section-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            </div>

            <Footer />
        </div>
    );
}
