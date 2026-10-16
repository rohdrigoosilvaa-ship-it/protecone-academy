import { useEffect, useState } from "react";
import { Award, Download } from "lucide-react";
import { api, apiDownload } from "../../lib/api";
import type { Certificado } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";

export function CertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[] | null>(null);

  useEffect(() => { api<Certificado[]>("GET", "/api/certificados/minhas").then(setCertificados); }, []);

  if (!certificados) return <Spinner />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Meus certificados</h1>
      <p className="mt-1 text-[var(--color-gray-mid)]">Treinamentos concluídos com aprovação.</p>

      {certificados.length === 0 ? (
        <EmptyState className="mt-6" icone={<Award size={32} />} titulo="Nenhum certificado ainda" descricao="Conclua um treinamento e sua prova final para receber o certificado." />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {certificados.map((c) => (
            <Card key={c.id} className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-green-100)] text-[var(--color-green-dark)]">
                <Award size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[var(--color-ink)]">{c.curso.nome}</div>
                <div className="mt-1 text-xs text-[var(--color-gray-mid)]">
                  {c.cargaHoraria} · {new Date(c.emitidoEm).toLocaleDateString("pt-BR")}
                </div>
                <div className="mt-1 font-mono text-xs text-[var(--color-gray-mid)]">{c.codigo}</div>
                <Button variant="secondary" className="mt-3" onClick={() => apiDownload(`/api/certificados/${c.id}/pdf`, `certificado-${c.codigo}.pdf`)}>
                  <Download size={15} /> Baixar PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
