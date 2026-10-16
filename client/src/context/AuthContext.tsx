import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "../lib/api";
import type { Usuario } from "../lib/types";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      if (!getToken()) { setCarregando(false); return; }
      try {
        const r = await api<{ usuario: Usuario }>("GET", "/api/auth/me");
        setUsuario(r.usuario);
      } catch {
        setToken(null);
      }
      setCarregando(false);
    })();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const r = await api<{ token: string; usuario: Usuario }>("POST", "/api/auth/login", { email, senha });
    setToken(r.token);
    setUsuario(r.usuario);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
  }, []);

  return <AuthContext.Provider value={{ usuario, carregando, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
