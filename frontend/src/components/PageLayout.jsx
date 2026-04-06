import { Outlet } from "react-router-dom";

import Footer from "./Footer";
import Navbar from "./Navbar";

function PageLayout() {
  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#1A1A1A]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PageLayout;
