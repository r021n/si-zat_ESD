import { useNavigate, useLocation } from "react-router-dom";

export function useAppBack() {
  const navigate = useNavigate();
  const location = useLocation();

  return (defaultPath: string = "/menu") => {
    const fromPath = (location.state as { from?: string })?.from;
    if (fromPath) {
      navigate(fromPath);
    } else {
      navigate(defaultPath);
    }
  };
}


