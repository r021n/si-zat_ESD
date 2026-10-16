import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { isAdmin } from "../../utils/auth";

interface AdminRouteProps {
  children?: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin(user)) {
    return <Navigate to="/menu" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
