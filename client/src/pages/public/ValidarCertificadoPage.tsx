import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";

interface Resultado {
  valido: boolean;
  codigo?: string;
  nome?: string;
  curso?: string;
  cargaHoraria?: string;
  emitidoEm?: string;
}

// página pública — sem login (seção 15 do escopo)
export function ValidarCertificadoPage() {
  const [params] = useSearchParams();
  const [codigo, setCodigo] = useState(params.get("codigo") || "");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [buscando, setBuscando] = useState(false);

  const buscar = async () => {
    if (!codigo.trim()) return;
    setBuscando(true);
    setResultado(null);
    try {
      const r = await api<Resultado>("GET", `/api/certificados/validar/${encodeURIComponent(codigo.trim())}`);
      setResultado(r);
    } catch (e) {
      setResultado({ valido: false });
    }
    setBuscando(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-institutional-deep)] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center text-white">
          <img src="/logo/logo-reverse.png" alt="ProtecSeg" className="h-16 w-auto object-contain" />
          <div className="mt-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-green)]">Validação de certificado</div>
        </div>

        <Card>
          <Label>Código do certificado</Label>
          <div className="flex gap-2">
            <Input placeholder="PSA-2026-000001" value={codigo} onChange={(e) => setCodigo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscar()} />
            <Button onClick={buscar} disabled={buscando}>{buscando ? "…" : "Validar"}</Button>
          </div>

          {resultado && (
            <div className="mt-5">
              {resultado.valido ? (
                <div className="rounded-[var(--radius-card)] bg-[var(--color-green-light)] p-4">
                  <div className="mb-3 flex items-center gap-2 font-bold text-[var(--color-green-dark)]">
                    <CheckCircle2 size={20} /> Certificado válido
                  </div>
                  <dl className="space-y-1.5 text-sm">
                    <Linha label="Nome" valor={resultado.nome} />
                    <Linha label="Curso" valor={resultado.curso} />
                    <Linha label="Carga horária" valor={resultado.cargaHoraria} />
                    <Linha label="Data" valor={resultado.emitidoEm ? new Date(resultado.emitidoEm).toLocaleDateString("pt-BR") : "—"} />
                    <Linha label="Status" valor="Concluído" />
                  </dl>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-status-critical-soft)] p-4 font-bold text-[var(--color-status-critical-fg)]">
                  <XCircle size={20} /> Certificado não encontrado
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className="flex justify-between border-b border-[var(--color-green-100)] py-1 last:border-0">
      <dt className="text-[var(--color-gray-mid)]">{label}</dt>
      <dd className="font-semibold text-[var(--color-ink)]">{valor}</dd>
    </div>
  );
}
