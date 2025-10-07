import { Outlet } from "react-router-dom";
import PageTransition from "../PageTransition";
import { Navbar } from "../Navbar";
import Footer from "../Footer";
import ScrollToTop from "../animation/ScrollToTop";

export const AppLayout = () => {
    return (
        <div>
            <Navbar />
            <ScrollToTop />
            <PageTransition>
                <Outlet />
            </PageTransition>
            <Footer />
        </div>
    )
};
