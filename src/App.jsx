import Hero from "./components/Hero";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContentLayout from "./layout/ContentLayout";
import Intro from "./components/Intro";
import Part1 from "./components/Part1";

export default function App() {
    return (
        <div className="min-h-svh overflow-x-hidden min-[90rem]:border-x min-[90rem]:border-dark2">
            <Header />
            <Hero />

            <ContentLayout>
                <Intro />
                <Part1 />
            </ContentLayout>

            <Footer />
        </div>
    );
}
