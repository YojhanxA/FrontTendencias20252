import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { isAuthenticated, loadingAuth } = useAuth();

  // ⏳ Esperar AuthContext (evita 401 inicial)
  if (loadingAuth) return null;

  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}
