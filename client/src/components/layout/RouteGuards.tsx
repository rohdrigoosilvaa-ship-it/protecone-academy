import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../ui/Spinner";

export function RequireAuth() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <Spinner />;
  if (!usuario) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <Spinner />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.perfil !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
