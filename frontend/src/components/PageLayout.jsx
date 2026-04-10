import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function PageLayout() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen p-4">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default PageLayout;
