import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Pizza } from "lucide-react";

function Navbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [navbarSearch, setNavbarSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("authUser"));
  } catch (_error) {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (
      location.pathname === "/restaurants" &&
      Object.prototype.hasOwnProperty.call(location.state || {}, "initialSearch")
    ) {
      setNavbarSearch(location.state?.initialSearch || "");
    }
  }, [location.pathname, location.state]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate("/restaurants", {
      state: {
        initialSearch: navbarSearch.trim(),
      },
    });
  };

  return (
    <div className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "py-2" : "py-4"} px-4 sm:px-6 lg:px-8`}>
      <div className="w-full">
        <nav className={`relative flex h-[80px] w-full items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/70 px-4 backdrop-blur-2xl transition-all duration-300 sm:px-6 ${scrolled ? "shadow-lg shadow-slate-200/50" : "shadow-sm shadow-slate-100/50"}`}>
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-gradient-to-br from-[#FF4F40] to-[#E63E30] text-white shadow-lg shadow-[#FF4F40]/30 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12">
              <Pizza size={22} fill="currentColor" />
            </div>

            <div className="hidden sm:block">
              <span className="block font-display text-2xl font-bold leading-none tracking-tight text-slate-900">
                Slice<span className="text-[#FF4F40]">Hub</span>
              </span>
            </div>
          </Link>

          <div className="mx-6 hidden max-w-lg flex-1 lg:flex">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                value={navbarSearch}
                onChange={(event) => setNavbarSearch(event.target.value)}
                className="w-full rounded-2xl border border-slate-200/60 bg-white/60 py-3 pl-14 pr-24 text-[15px] font-semibold text-slate-700 placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-900 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/30"
              >
                Find
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className={`hidden rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 sm:inline-flex ${
                location.pathname === "/" ? "bg-primary/5 text-primary" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Home
            </Link>

            {token && user?.role === "customer" && (
              <Link
                to="/orders"
                className={`hidden rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 md:inline-flex ${
                  location.pathname === "/orders" ? "bg-primary/5 text-primary" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Orders
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 text-slate-600 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:text-primary hover:shadow-xl hover:shadow-primary/10"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] font-black text-white shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
            

            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 text-slate-600 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:text-primary hover:shadow-xl hover:shadow-primary/10 sm:w-auto sm:px-5"
                >
                  <User size={20} />
                  <span className="ml-2.5 hidden text-sm font-bold sm:inline">Account</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-all hover:bg-red-50 hover:text-red-500 hover:-translate-y-0.5 sm:inline-flex"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-primary hover:shadow-xl hover:shadow-primary/30"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;

