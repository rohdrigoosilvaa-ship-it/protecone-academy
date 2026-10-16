import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { api } from "../../lib/api";
import { arquivoParaDataUri } from "../../lib/imageResize";
import type { Categoria, Curso } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Label, Select, Textarea } from "../../components/ui/Input";

export function DadosGeraisTab({ curso, onAtualizado }: { curso: Curso; onAtualizado: (c: Curso) => void }) {
  const [form, setForm] = useState(curso);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const inputCapaRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm(curso); }, [curso.id]);
  useEffect(() => { api<Categoria[]>("GET", "/api/categorias").then(setCategorias); }, []);

  const campo = (k: keyof Curso, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const salvar = async (patch?: Partial<Curso>) => {
    setSalvando(true); setMsg("");
    try {
      const corpo = patch || form;
      const atualizado = await api<Curso>("PUT", `/api/cursos/${curso.id}`, corpo);
      onAtualizado(atualizado);
      setForm(atualizado);
      setMsg("Salvo com sucesso.");
      setTimeout(() => setMsg(""), 2000);
    } finally { setSalvando(false); }
  };

  const selecionarCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setEnviandoCapa(true);
    try {
      const dataUri = await arquivoParaDataUri(file);
      campo("imagemCapaUrl", dataUri);
    } catch {
      setMsg("Não foi possível carregar essa imagem.");
    } finally {
      setEnviandoCapa(false);
    }
  };

  const criarCategoria = async () => {
    const nome = prompt("Nome da nova categoria:");
    if (!nome) return;
    const cat = await api<Categoria>("POST", "/api/categorias", { nome });
    setCategorias((c) => [...c, cat].sort((a, b) => a.nome.localeCompare(b.nome)));
    campo("categoriaId", cat.id);
  };

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="mb-4 text-sm font-bold text-[var(--color-ink)]">Dados do curso</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome do curso</Label>
            <Input value={form.nome} onChange={(e) => campo("nome", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Descrição</Label>
            <Textarea rows={3} value={form.descricao} onChange={(e) => campo("descricao", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Imagem de capa</Label>
            <input ref={inputCapaRef} type="file" accept="image/*" className="hidden" onChange={selecionarCapa} />
            {form.imagemCapaUrl ? (
              <div className="flex items-center gap-3">
                <img src={form.imagemCapaUrl} className="h-20 w-32 rounded-[var(--radius-card)] border border-[var(--color-gray-light)] object-cover" />
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="secondary" onClick={() => inputCapaRef.current?.click()} disabled={enviandoCapa}>
                    {enviandoCapa ? "Carregando…" : "Trocar imagem"}
                  </Button>
                  <button type="button" onClick={() => campo("imagemCapaUrl", null)} className="flex items-center gap-1 text-xs font-semibold text-[var(--color-status-critical-fg)] hover:underline">
                    <X size={12} /> Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputCapaRef.current?.click()}
                disabled={enviandoCapa}
                className="flex h-24 w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-gray-light)] text-sm font-semibold text-[var(--color-gray-mid)] transition hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
              >
                <ImagePlus size={18} /> {enviandoCapa ? "Carregando…" : "Enviar imagem de capa"}
              </button>
            )}
          </div>
          <div>
            <Label>Carga horária</Label>
            <Input value={form.cargaHoraria} onChange={(e) => campo("cargaHoraria", e.target.value)} placeholder="ex.: 4hrs, 8hrs, 2h30" />
          </div>
          <div>
            <Label>Instrutor</Label>
            <Input value={form.instrutor || ""} onChange={(e) => campo("instrutor", e.target.value)} placeholder="Nome do instrutor responsável" />
          </div>
          <div>
            <Label>Categoria</Label>
            <div className="flex gap-2">
              <Select value={form.categoriaId ?? ""} onChange={(e) => campo("categoriaId", e.target.value ? Number(e.target.value) : null)}>
                <option value="">Sem categoria</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
              <Button type="button" variant="secondary" onClick={criarCategoria}>+</Button>
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => campo("status", e.target.value)}>
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="ARQUIVADO">Arquivado</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 text-sm font-bold text-[var(--color-ink)]">Apresentação do curso</h3>
        <p className="mb-4 text-xs text-[var(--color-gray-mid)]">Mostrado na página do curso para o aluno.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Objetivos do curso</Label>
            <Textarea rows={3} value={form.objetivos || ""} onChange={(e) => campo("objetivos", e.target.value)} placeholder="O que o aluno vai aprender" />
          </div>
          <div>
            <Label>Público-alvo</Label>
            <Textarea rows={3} value={form.publicoAlvo || ""} onChange={(e) => campo("publicoAlvo", e.target.value)} placeholder="Para quem é este treinamento" />
          </div>
          <div>
            <Label>Pré-requisitos</Label>
            <Textarea rows={3} value={form.preRequisitos || ""} onChange={(e) => campo("preRequisitos", e.target.value)} placeholder="O que o aluno precisa saber antes" />
          </div>
          <div>
            <Label>Competências desenvolvidas</Label>
            <Textarea rows={3} value={form.competencias || ""} onChange={(e) => campo("competencias", e.target.value)} placeholder="O que o aluno será capaz de fazer" />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 text-sm font-bold text-[var(--color-ink)]">Regras de aprovação</h3>
        <p className="mb-4 text-xs text-[var(--color-gray-mid)]">Valem para todos os módulos, quizzes e a prova final deste curso.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>% mínimo assistido p/ concluir aula</Label>
            <Input type="number" min={1} max={100} value={form.percentualMinimoAula} onChange={(e) => campo("percentualMinimoAula", Number(e.target.value))} />
          </div>
          <div>
            <Label>Nota mínima do quiz (%)</Label>
            <Input type="number" min={0} max={100} value={form.notaMinimaQuiz} onChange={(e) => campo("notaMinimaQuiz", Number(e.target.value))} />
          </div>
          <div>
            <Label>Nota mínima da prova final (%)</Label>
            <Input type="number" min={0} max={100} value={form.notaMinimaProva} onChange={(e) => campo("notaMinimaProva", Number(e.target.value))} />
          </div>
          <div>
            <Label>Número de tentativas (quiz e prova)</Label>
            <Input type="number" min={1} value={form.maxTentativas} onChange={(e) => campo("maxTentativas", Number(e.target.value))} />
          </div>
          <div>
            <Label>Tempo da prova (minutos, opcional)</Label>
            <Input type="number" min={0} value={form.tempoProvaMinutos ?? ""} onChange={(e) => campo("tempoProvaMinutos", e.target.value ? Number(e.target.value) : null)} placeholder="Sem limite" />
          </div>
          <div>
            <Label>Nº de questões da prova final</Label>
            <Input type="number" min={1} value={form.numQuestoesProva} onChange={(e) => campo("numQuestoesProva", Number(e.target.value))} />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <input type="checkbox" checked={form.certificadoHabilitado} onChange={(e) => campo("certificadoHabilitado", e.target.checked)} />
          Emitir certificado ao aprovar
        </label>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={() => salvar()} disabled={salvando}>{salvando ? "Salvando…" : "Salvar alterações"}</Button>
        {msg && <span className="text-sm font-semibold text-[var(--color-green)]">{msg}</span>}
      </div>
    </div>
  );
}
