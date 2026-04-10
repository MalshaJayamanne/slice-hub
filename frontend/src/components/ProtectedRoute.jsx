import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ role }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("authUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
