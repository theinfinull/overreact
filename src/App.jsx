import Hero from "./components/Hero";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SideNav from "./components/SideNav";
import Abstract from "./sections/Abstract";
import Part1 from "./sections/Part1";
import Part2 from "./sections/Part2";
import Part3 from "./sections/Part3";
import Part4 from "./sections/Part4";
import Part5 from "./sections/Part5";
import Part6 from "./sections/Part6";
import Part7 from "./sections/Part7";
import Part8 from "./sections/Part8";
import Part8_5 from "./sections/Part8_5";
import Part9 from "./sections/Part9";
import Discussion from "./sections/Discussion";
import Conclusion from "./sections/Conclusion";
import Glossary from "./sections/Glossary";
import Credits from "./sections/Credits";

export default function App() {
    return (
        <div className="min-h-svh overflow-x-hidden min-[90rem]:border-x min-[90rem]:border-dark2">
            <Header />
            <Hero />
            <SideNav />
            <main>
                <Abstract />
                <Part1 />
                <Part2 />
                <Part3 />
                <Part4 />
                <Part5 />
                <Part6 />
                <Part7 />
                <Part8 />
                <Part8_5 />
                <Part9 />
                <Discussion />
                <Conclusion />
                <Glossary />
                <Credits />
            </main>
            <Footer />
        </div>
    );
}
