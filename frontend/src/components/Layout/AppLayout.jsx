import { Outlet } from "react-router-dom";
// import PageTransition from "../PageTransition";
import { Navbar } from "../Navbar";
import Footer from "../Footer";
import ScrollToTop from "../animation/ScrollToTop";
// import SplashCursor from "../ui/SplashCursor";

export const AppLayout = () => {
    return (
        <div>
            <Navbar />
            <ScrollToTop />
            {/* <SplashCursor /> */}
                <Outlet />
            <Footer />
        </div>
    )
};
