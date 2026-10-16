import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getAccessStatusApi } from "../../api/api";
import { isAdmin } from "../../utils/auth";
import LoadingScreen from "../common/LoadingScreen";

interface AccessGuardProps {
  children?: React.ReactNode;
}

export default function AccessGuard({ children }: AccessGuardProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Admins bypass access control locks
      if (isAdmin(user)) {
        setChecking(false);
        return;
      }

      try {
        const res = await getAccessStatusApi();
        if (res.isLocked) {
          navigate("/locked", { replace: true });
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error("Gagal memeriksa status akses:", err);
        // Fail open on network/server error to avoid lockouts
        setChecking(false);
      }
    };

    const path = location.pathname;
    if (path === "/" || path === "/auth" || path === "/locked") {
      setChecking(false);
      return;
    }

    checkAccess();
  }, [location.pathname, user, navigate]);

  if (checking) {
    return <LoadingScreen message="Memeriksa Akses..." />;
  }

  return children ? <>{children}</> : <Outlet />;
}
