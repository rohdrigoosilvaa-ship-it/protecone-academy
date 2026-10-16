import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Curso } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Select, Label } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";

interface RelatorioCurso {
  curso: Curso;
  numAlunos: number;
  concluidos: number;
  andamento: number;
  cancelados: number;
  expirados: number;
  reprovados: number;
  taxaConclusaoPct: number;
  taxaAprovacaoPct: number;
  notaMedia: number | null;
  tempoMedioDias: number | null;
}

export function RelatoriosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoId, setCursoId] = useState<string>("");
  const [relatorio, setRelatorio] = useState<RelatorioCurso | null>(null);

  useEffect(() => { api<Curso[]>("GET", "/api/cursos").then((c) => { setCursos(c); if (c[0]) setCursoId(String(c[0].id)); }); }, []);
  useEffect(() => { if (cursoId) api<RelatorioCurso>("GET", `/api/relatorios/cursos/${cursoId}`).then(setRelatorio); }, [cursoId]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Relatório por curso</h1>
      <p className="mt-1 text-[var(--color-gray-mid)]">Acompanhamento de conclusão e aprovação por treinamento.</p>

      <div className="mt-5 max-w-xs">
        <Label>Curso</Label>
        <Select value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
          {cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
      </div>

      {!relatorio ? <Spinner /> : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Indicador label="Alunos matriculados" valor={relatorio.numAlunos} />
          <Indicador label="Concluídos" valor={relatorio.concluidos} />
          <Indicador label="Em andamento" valor={relatorio.andamento} />
          <Indicador label="Cancelados" valor={relatorio.cancelados} />
          <Indicador label="Expirados" valor={relatorio.expirados} />
          <Indicador label="Reprovações na prova final" valor={relatorio.reprovados} />
          <Indicador label="Taxa de conclusão" valor={`${relatorio.taxaConclusaoPct}%`} />
          <Indicador label="Taxa de aprovação" valor={`${relatorio.taxaAprovacaoPct}%`} />
          <Indicador label="Nota média (prova final)" valor={relatorio.notaMedia != null ? `${relatorio.notaMedia}%` : "—"} />
          <Indicador label="Tempo médio de conclusão" valor={relatorio.tempoMedioDias != null ? `${relatorio.tempoMedioDias} dias` : "—"} />
        </div>
      )}
    </div>
  );
}

function Indicador({ label, valor }: { label: string; valor: string | number }) {
  return (
    <Card>
      <div className="text-2xl font-extrabold text-[var(--color-ink)]">{valor}</div>
      <div className="mt-1 text-xs font-semibold text-[var(--color-gray-mid)]">{label}</div>
    </Card>
  );
}
