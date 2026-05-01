import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Pizza } from "lucide-react";

import { clearAuthSession, getAuthUser, isCustomer } from "../utils/auth";
import useToast from "../hooks/useToast";

function Navbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const token = localStorage.getItem("token");
  const [navbarSearch, setNavbarSearch] = useState("");
  const user = getAuthUser();
  const canUseCart = token && isCustomer(user);

  const handleLogout = () => {
    clearAuthSession();
    toast.info("You have been signed out.", "Signed out");
    navigate("/login");
  };

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
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
      <div className="page-shell">
        <div className="flex h-[88px] items-center justify-between gap-4">
          <Link to="/" className="group flex shrink-0 items-center">
            <div className="rounded-[1.45rem] bg-[#FF3B30] p-4 text-white shadow-lg shadow-primary/20 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-6">
              <Pizza size={24} />
            </div>

            <div className="ml-4">
              <span className="block text-[2.15rem] font-extrabold leading-none tracking-[-0.05em] text-[#1A1A1A]">
                Slice<span className="text-[#FF3B30]">Hub</span>
              </span>
              <span className="mt-1 hidden text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 sm:block">
                Marketplace Workspace
              </span>
            </div>
          </Link>

          <div className="mx-6 hidden max-w-[42rem] flex-1 lg:flex">
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full"
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search restaurants..."
                value={navbarSearch}
                onChange={(event) => setNavbarSearch(event.target.value)}
                className="input-surface border-slate-200 bg-white py-4 pl-14 pr-24 text-[15px] shadow-sm"
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 min-w-[68px] -translate-y-1/2 rounded-[1rem] bg-contrast px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-primary"
              >
                Go
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

            {token && user?.role === "customer" ? (
              <Link
                to="/orders"
                className="hidden rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 md:inline-flex"
              >
                Orders
              </Link>
            ) : null}
            {canUseCart ? (
              <Link
                to="/cart"
                className="relative rounded-[1.4rem] border border-slate-200/70 bg-white px-4 py-3 text-slate-500 shadow-sm transition hover:border-white hover:bg-white hover:text-slate-900"
              >
                <ShoppingCart size={22} />

                {cartCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] font-black text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : null}
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-[1.4rem] border border-slate-200/70 bg-white px-4 py-3 text-slate-500 shadow-sm transition hover:border-white hover:bg-white hover:text-slate-900"
                >
                  <User size={22} />
                  <span className="hidden text-sm font-semibold sm:inline">
                    Account
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-2xl bg-contrast px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
