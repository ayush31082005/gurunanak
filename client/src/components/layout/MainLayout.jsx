import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CallBanner from "../home/CallBanner";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="min-h-screen overflow-x-hidden pt-[114px] md:pt-[94px] lg:pt-[98px]">
        <Outlet />
      </main>
      <Footer />
      <CallBanner />
    </div>
  );
};

export default MainLayout;
