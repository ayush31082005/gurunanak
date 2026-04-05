import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CallBanner from "../home/CallBanner";

const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="min-h-[calc(100vh-114px)] overflow-x-hidden pt-[114px] md:min-h-[calc(100vh-94px)] md:pt-[94px] lg:min-h-[calc(100vh-98px)] lg:pt-[98px]">
        <Outlet />
      </main>
      <Footer />
      <CallBanner />
    </div>
  );
};

export default MainLayout;
