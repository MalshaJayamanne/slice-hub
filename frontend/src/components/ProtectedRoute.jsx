import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("authUser"));
  } catch {
    user = null;
  }

  if (!user) return <Navigate to="/login" />;

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) return <Navigate to="/" />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
