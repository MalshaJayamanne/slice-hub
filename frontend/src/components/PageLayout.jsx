import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCart } from "../context/CartContext";

function PageLayout() {
  const { cartCount } = useCart();

  return (
    <div>
      <Navbar cartCount={cartCount} />

      <main className="min-h-screen p-4">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PageLayout;
