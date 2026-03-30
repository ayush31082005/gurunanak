import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CallBanner from "../home/CallBanner";

const MainLayout = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg">
      <Header />
      <main className="min-h-screen pt-0">
        <Outlet />
      </main>
      <Footer />
      <CallBanner />
    </div>
  );
};

export default MainLayout;
