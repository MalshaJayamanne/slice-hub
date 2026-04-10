import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Pizza } from "lucide-react";

function Navbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            
              <div className="bg-[#FF3B30] text-white p-3 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">
                <Pizza size={24} />
              </div>

              <span className="ml-3 text-[#1A1A1A] text-3xl font-bold tracking-tight">
                Slice<span className="text-[#FF3B30]">Hub</span>
              </span>
                        
          </Link>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-12">
            <div className="relative w-full group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary"
                size={20}
              />

              <input
                type="text"
                placeholder="Search for food..."
                className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">

            <Link
              to="/"
              className="hidden sm:block px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-black"
            >
              Home
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black"
            >
              <ShoppingCart size={22} />

              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 p-3 sm:px-4 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black"
                >
                  <User size={22} />
                  <span className="hidden sm:inline font-bold text-sm">
                    Account
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-contrast text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-primary transition-all"
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