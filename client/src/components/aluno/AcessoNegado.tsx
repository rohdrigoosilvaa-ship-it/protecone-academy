import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/Button";

// mostrado quando o backend recusa acesso ao curso (403) — matrícula
// inexistente, cancelada ou expirada. O bloqueio de verdade acontece no
// backend (seção 8 do fluxo de acesso); isto é só a mensagem correspondente.
export function AcessoNegado() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)] bg-white p-8 text-center">
      <ShieldAlert size={36} className="mx-auto mb-4 text-[var(--color-status-critical)]" />
      <h2 className="text-lg font-bold text-[var(--color-ink)]">Acesso não autorizado a este curso.</h2>
      <p className="mt-2 text-sm text-[var(--color-gray-mid)]">
        Você não tem uma matrícula ativa neste treinamento. Entre em contato com o administrador para receber acesso.
      </p>
      <Link to="/treinamentos" className="mt-5 inline-block">
        <Button variant="secondary">Voltar para Meus cursos</Button>
      </Link>
    </div>
  );
}
