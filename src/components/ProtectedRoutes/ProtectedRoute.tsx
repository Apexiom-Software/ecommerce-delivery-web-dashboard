import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { whoAmI } from "../../services/authService";
import { store } from "../../app/redux/store";
import { getTokenMemorySafe } from "../../utils/authStorage";
import { setAuthTokens } from "../../app/redux/slices/authSlice";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Récupérer token depuis Redux ou sessionStorage
        const accessToken =
          store.getState().auth.accessToken || getTokenMemorySafe();
        if (!accessToken) throw new Error("No access token");

        // Remettre token dans Redux si nécessaire
        if (!store.getState().auth.accessToken) {
          store.dispatch(setAuthTokens({ accessToken, refreshToken: null }));
        }

        await whoAmI(); // Vérifie côté backend
        setStatus("authenticated");
      } catch (error) {
        console.error("Authentication check failed:", error);
        setStatus("unauthenticated");
      }
    };

    checkAuth();
  }, []);

  // Redirection sécurisée dans useEffect
  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/", { replace: true });
    }
  }, [status, navigate]);

  if (status === "checking") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return status === "authenticated" ? <>{children}</> : null;
}
