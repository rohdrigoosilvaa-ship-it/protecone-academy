import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Input";

export function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (usuario) return <Navigate to="/dashboard" replace />;

  const entrar = async () => {
    setErro("");
    setCarregando(true);
    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (e: any) {
      setErro(e.message || "Falha ao entrar");
    }
    setCarregando(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-institutional-deep)] px-4">
      <div className="w-full max-w-md rounded-[var(--radius-card-xl)] bg-white p-8 shadow-[var(--shadow-card-lg)]">
        <div className="mb-6 flex justify-center">
          <img src="/logo/protechub.png" alt="ProtecHub - Conhecimento que protege" className="h-28 w-auto object-contain" />
        </div>
        <h1 className="mb-1 text-xl font-bold text-[var(--color-ink)]">Entrar</h1>
        <p className="mb-6 text-sm text-[var(--color-gray-mid)]">Acesse com seu e-mail e senha para continuar seus treinamentos.</p>

        <Label>E-mail</Label>
        <Input type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} />
        <div className="h-3" />
        <Label>Senha</Label>
        <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} />

        {erro && <p className="mt-3 rounded-[var(--radius-btn)] bg-[var(--color-status-critical-soft)] px-3 py-2 text-sm text-[var(--color-status-critical-fg)]">{erro}</p>}

        <Button className="mt-6 w-full" onClick={entrar} disabled={carregando}>
          {carregando ? "Entrando…" : "Entrar"}
        </Button>

        <a href="/certificados/validar" className="mt-5 block text-center text-xs font-semibold text-[var(--color-gray-mid)] hover:text-[var(--color-green)]">
          Validar um certificado
        </a>
      </div>
    </div>
  );
}
