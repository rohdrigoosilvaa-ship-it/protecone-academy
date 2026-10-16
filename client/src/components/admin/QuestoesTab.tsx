import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Dificuldade, Modulo, Questao } from "../../lib/types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input, Label, Select, Textarea } from "../ui/Input";

const DIFICULDADE_TOM = { FACIL: "verde", MEDIO: "atencao", DIFICIL: "critico" } as const;

export function QuestoesTab({ cursoId, modulos }: { cursoId: number; modulos: Modulo[] }) {
  const [questoes, setQuestoes] = useState<Questao[] | null>(null);
  const [filtroModulo, setFiltroModulo] = useState<string>("");
  const [filtroDificuldade, setFiltroDificuldade] = useState<Dificuldade | "">("");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Questao | "novo" | null>(null);

  const carregar = () => {
    const params = new URLSearchParams({ cursoId: String(cursoId) });
    if (filtroModulo === "geral") params.set("bancoGeral", "true");
    else if (filtroModulo) params.set("moduloId", filtroModulo);
    api<Questao[]>("GET", `/api/questoes?${params}`).then(setQuestoes);
  };
  useEffect(() => { carregar(); }, [cursoId, filtroModulo]);

  const questoesFiltradas = useMemo(() => {
    if (!questoes) return [];
    const termo = busca.trim().toLowerCase();
    return questoes.filter((q) => {
      if (termo && !q.enunciado.toLowerCase().includes(termo)) return false;
      if (filtroDificuldade && q.dificuldade !== filtroDificuldade) return false;
      return true;
    });
  }, [questoes, busca, filtroDificuldade]);

  const excluir = async (id: number) => {
    if (!confirm("Excluir esta questão?")) return;
    await api("DELETE", `/api/questoes/${id}`);
    carregar();
  };

  return (
    <div>
      <Card className="mb-4 flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Label>Buscar</Label>
          <Search size={16} className="pointer-events-none absolute left-3 top-[34px] text-[var(--color-gray-mid)]" />
          <Input className="pl-9" placeholder="Buscar por enunciado…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div>
          <Label>Módulo</Label>
          <Select value={filtroModulo} onChange={(e) => setFiltroModulo(e.target.value)}>
            <option value="">Todas as questões do curso</option>
            <option value="geral">Banco geral (só prova final)</option>
            {modulos.map((m) => <option key={m.id} value={m.id}>{m.nome} (quiz do módulo)</option>)}
          </Select>
        </div>
        <div>
          <Label>Dificuldade</Label>
          <Select value={filtroDificuldade} onChange={(e) => setFiltroDificuldade(e.target.value as Dificuldade | "")}>
            <option value="">Todas</option>
            <option value="FACIL">Fácil</option>
            <option value="MEDIO">Médio</option>
            <option value="DIFICIL">Difícil</option>
          </Select>
        </div>
        <Button onClick={() => setEditando("novo")}><Plus size={16} /> Nova questão</Button>
      </Card>

      <p className="mb-3 text-xs text-[var(--color-gray-mid)]">
        Questões com módulo definido aparecem no quiz daquele módulo. Todas as questões do curso (com ou sem módulo) entram no sorteio da prova final.
      </p>

      <div className="space-y-3">
        {questoes?.length === 0 && <p className="text-sm text-[var(--color-gray-mid)]">Nenhuma questão cadastrada ainda.</p>}
        {questoes && questoes.length > 0 && questoesFiltradas.length === 0 && <p className="text-sm text-[var(--color-gray-mid)]">Nenhuma questão encontrada com esses filtros.</p>}
        {questoesFiltradas.map((q) => (
          <Card key={q.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge tom={DIFICULDADE_TOM[q.dificuldade]}>{q.dificuldade}</Badge>
                  <Badge tom="cinza">{q.moduloId ? modulos.find((m) => m.id === q.moduloId)?.nome || "Módulo" : "Banco geral"}</Badge>
                </div>
                <p className="font-semibold text-[var(--color-ink)]">{q.enunciado}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {q.alternativas.map((alt, i) => (
                    <li key={i} className={i === q.respostaCorretaIndex ? "font-semibold text-[var(--color-green-dark)]" : "text-[var(--color-gray-mid)]"}>
                      {i === q.respostaCorretaIndex ? "✓ " : "— "}{alt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditando(q)} className="text-[var(--color-gray-mid)] hover:text-[var(--color-green)]"><Pencil size={15} /></button>
                <button onClick={() => excluir(q.id)} className="text-[var(--color-gray-mid)] hover:text-[var(--color-status-critical)]"><Trash2 size={15} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editando && (
        <QuestaoModal
          cursoId={cursoId}
          modulos={modulos}
          questao={editando === "novo" ? null : editando}
          onFechar={() => setEditando(null)}
          onSalvo={() => { setEditando(null); carregar(); }}
        />
      )}
    </div>
  );
}

function QuestaoModal({ cursoId, modulos, questao, onFechar, onSalvo }: { cursoId: number; modulos: Modulo[]; questao: Questao | null; onFechar: () => void; onSalvo: () => void }) {
  const [enunciado, setEnunciado] = useState(questao?.enunciado || "");
  const [alternativas, setAlternativas] = useState<string[]>(questao?.alternativas || ["", "", "", ""]);
  const [respostaCorretaIndex, setRespostaCorretaIndex] = useState(questao?.respostaCorretaIndex ?? 0);
  const [explicacao, setExplicacao] = useState(questao?.explicacao || "");
  const [dificuldade, setDificuldade] = useState<Dificuldade>(questao?.dificuldade || "MEDIO");
  const [pontuacao, setPontuacao] = useState(questao?.pontuacao ?? 1);
  const [moduloId, setModuloId] = useState<string>(questao?.moduloId ? String(questao.moduloId) : "");
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!enunciado.trim() || alternativas.some((a) => !a.trim())) return;
    setSalvando(true);
    const corpo = { enunciado, alternativas, respostaCorretaIndex, explicacao, dificuldade, pontuacao, moduloId: moduloId ? Number(moduloId) : null };
    try {
      if (questao) await api("PUT", `/api/questoes/${questao.id}`, corpo);
      else await api("POST", `/api/questoes/curso/${cursoId}`, corpo);
      onSalvo();
    } finally { setSalvando(false); }
  };

  return (
    <Modal aberto onFechar={onFechar} titulo={questao ? "Editar questão" : "Nova questão"} largura="max-w-xl">
      <div className="space-y-4">
        <div>
          <Label>Enunciado</Label>
          <Textarea rows={2} value={enunciado} onChange={(e) => setEnunciado(e.target.value)} autoFocus />
        </div>
        <div>
          <Label>Alternativas (marque a correta)</Label>
          <div className="space-y-2">
            {alternativas.map((alt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" checked={respostaCorretaIndex === i} onChange={() => setRespostaCorretaIndex(i)} />
                <Input value={alt} onChange={(e) => setAlternativas((a) => a.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Alternativa ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>Explicação (mostrada após responder)</Label>
          <Textarea rows={2} value={explicacao} onChange={(e) => setExplicacao(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Dificuldade</Label>
            <Select value={dificuldade} onChange={(e) => setDificuldade(e.target.value as Dificuldade)}>
              <option value="FACIL">Fácil</option>
              <option value="MEDIO">Médio</option>
              <option value="DIFICIL">Difícil</option>
            </Select>
          </div>
          <div>
            <Label>Pontuação</Label>
            <Input type="number" min={1} value={pontuacao} onChange={(e) => setPontuacao(Number(e.target.value))} />
          </div>
          <div>
            <Label>Pertence ao módulo</Label>
            <Select value={moduloId} onChange={(e) => setModuloId(e.target.value)}>
              <option value="">Banco geral</option>
              {modulos.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </Select>
          </div>
        </div>
        <Button className="w-full" onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar questão"}</Button>
      </div>
    </Modal>
  );
}
