import { Outlet } from "react-router-dom";
import PageTransition from "../PageTransition";
import { Navbar } from "../Navbar";
import Footer from "../Footer";

export const AppLayout = () => {
    return (
        <div>
            <Navbar />
            <PageTransition>
                <Outlet />
            </PageTransition>
            <Footer />
        </div>
    )
};
