import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = (user?.role || user?.roleName)?.toUpperCase();
    
    if (!userRole) {
      return <Navigate to="/login" replace />;
    }

    const isAllowed = allowedRoles.some(
      (role) => role.toUpperCase() === userRole
    );

    if (!isAllowed) {
      if (userRole === "ADMIN") {
        return <Navigate to="/admin/profile" replace />;
      } else if (userRole === "HOTEL_MANAGER" || userRole === "MANAGER") {
        return <Navigate to="/manager/hotel-profile" replace />;
      } else if (userRole === "USER") {
        return <Navigate to="/user/profile" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

