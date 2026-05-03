import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCart } from "../context/CartContext";

function PageLayout() {
  const { cartCount } = useCart();

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#FF4F40]/10 blur-3xl pointer-events-none" />
      <div className="absolute right-[-10rem] top-[14rem] h-80 w-80 rounded-full bg-[#FF4F40]/5 blur-3xl pointer-events-none" />

      <Navbar cartCount={cartCount} />

      <main className="app-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PageLayout;
