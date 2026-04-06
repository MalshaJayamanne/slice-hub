import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-2xl font-black tracking-tight text-[#1A1A1A]">
          Slice<span className="text-[#FF3B30]">Hub</span>
        </Link>

        <div className="flex items-center gap-5 text-sm font-semibold text-gray-700">
          <Link to="/" className="transition hover:text-[#FF3B30]">
            Home
          </Link>
          {token ? (
            <>
              <Link to="/dashboard" className="transition hover:text-[#FF3B30]">
                Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="transition hover:text-[#FF3B30]">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="transition hover:text-[#FF3B30]">
                Login
              </Link>
              <Link to="/register" className="transition hover:text-[#FF3B30]">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
