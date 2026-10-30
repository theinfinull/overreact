import Hero from "./components/Hero";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContentLayout from "./layout/ContentLayout";
import Intro from "./components/Intro";
import Part1 from "./components/Part1";
import Part2 from "./components/Part2";
import Part3 from "./components/Part3";
import Part4 from "./components/Part4";
import Part5 from "./components/Part5";
import Conclusion from "./components/Conclusion";
import Comments from "./components/Comments";

export default function App() {
    return (
        <div className="min-h-svh overflow-x-clip min-[90rem]:border-x min-[90rem]:border-dark2">
            <Header />
            <Hero />

            <ContentLayout>
                <Intro />
                <Part1 />
                <Part2 />
                <Part3 />
                <Part4 />
                <Part5 />
                <Conclusion />
                <Comments />
            </ContentLayout>

            <Footer />
        </div>
    );
}
