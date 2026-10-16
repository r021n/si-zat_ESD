import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface EnrollGuardProps {
  children?: React.ReactNode;
}

export default function EnrollGuard({ children }: EnrollGuardProps) {
  const { user } = useAuthStore();

  if (!user) return null;

  return children ? <>{children}</> : <Outlet />;
}
