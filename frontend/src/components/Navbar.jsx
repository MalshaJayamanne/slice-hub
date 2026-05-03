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

          <div className="mx-4 hidden max-w-md flex-1 lg:flex">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                value={navbarSearch}
                onChange={(event) => setNavbarSearch(event.target.value)}
                className="w-full rounded-2xl border border-slate-200/60 bg-white/60 py-2.5 pl-12 pr-20 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 focus:border-[#FF4F40] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF4F40]/10"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#FF4F40]"
              >
                Find
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
            >
              Home
            </Link>

            {token && user?.role === "customer" && (
              <Link
                to="/orders"
                className="hidden rounded-xl px-4 py-2.5 text-[15px] font-semibold text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 md:inline-flex"
              >
                Orders
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-orange-50 hover:text-orange-500 hover:shadow-sm"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#FF4F40] text-[10px] font-black text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            

            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/60 bg-white/60 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-orange-50 hover:text-orange-500 hover:shadow-sm sm:w-auto sm:px-4"
                >
                  <User size={20} />
                  <span className="ml-2 hidden text-[15px] font-semibold sm:inline">Account</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden rounded-xl px-4 py-2.5 text-[15px] font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 sm:inline-flex"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#FF4F40] hover:shadow-lg hover:shadow-[#FF4F40]/25"
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

