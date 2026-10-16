import { useEffect, useState } from "react";
import { Award, RefreshCw } from "lucide-react";
import { api, apiDownload } from "../../lib/api";
import type { Certificado } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";

export function CertificadosAdminPage() {
  const [certificados, setCertificados] = useState<Certificado[] | null>(null);

  const carregar = () => api<Certificado[]>("GET", "/api/certificados").then(setCertificados);
  useEffect(() => { carregar(); }, []);

  const reemitir = async (id: number) => {
    if (!confirm("Gerar um novo código para este certificado?")) return;
    await api("POST", `/api/certificados/${id}/reemitir`);
    carregar();
  };

  if (!certificados) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Certificados</h1>
      <p className="mt-1 text-[var(--color-gray-mid)]">{certificados.length} certificados emitidos.</p>

      <Card className="mt-6 p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-gray-light)] text-left text-xs font-bold uppercase text-[var(--color-gray-mid)]">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Curso</th>
              <th className="px-4 py-3">Emitido em</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {certificados.map((c) => (
              <tr key={c.id} className="border-b border-[var(--color-gray-light)] last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-gray-mid)]">{c.codigo}</td>
                <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">{c.usuario?.nome}</td>
                <td className="px-4 py-3">{c.curso.nome}</td>
                <td className="px-4 py-3 text-[var(--color-gray-mid)]">{new Date(c.emitidoEm).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => apiDownload(`/api/certificados/${c.id}/pdf`, `certificado-${c.codigo}.pdf`)} className="flex items-center gap-1 text-xs font-semibold text-[var(--color-green)] hover:underline">
                      <Award size={13} /> PDF
                    </button>
                    <button onClick={() => reemitir(c.id)} className="flex items-center gap-1 text-xs font-semibold text-[var(--color-gray-mid)] hover:text-[var(--color-ink)]">
                      <RefreshCw size={13} /> Reemitir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {certificados.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-gray-mid)]">Nenhum certificado emitido ainda.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
