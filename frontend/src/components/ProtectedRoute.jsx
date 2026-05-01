import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../utils/auth";

const ProtectedRoute = ({ role }) => {
  const user = getAuthUser();
  const token = getAuthToken();

  if (!token || !user) return <Navigate to="/login" />;

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) return <Navigate to="/" />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
