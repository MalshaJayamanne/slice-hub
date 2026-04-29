import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCart } from "../context/CartContext";

function PageLayout() {
  const { cartCount } = useCart();

  return (
    <div className="relative">
      <div className="floating-orb left-[-8rem] top-[-6rem] h-72 w-72 bg-orange-200/30" />
      <div className="floating-orb right-[-10rem] top-[14rem] h-80 w-80 bg-red-200/20" />

      <Navbar cartCount={cartCount} />

      <main className="app-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PageLayout;
