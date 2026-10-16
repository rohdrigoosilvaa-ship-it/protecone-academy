import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import type { Categoria, Usuario } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input, Label } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

interface ConfigPadrao {
  percentualMinimoAulaPadrao: number;
  notaMinimaQuizPadrao: number;
  notaMinimaProvaPadrao: number;
  maxTentativasPadrao: number;
  numQuestoesProvaPadrao: number;
}

export function ConfiguracoesPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Configurações</h1>
      <p className="mt-1 text-[var(--color-gray-mid)]">Ajustes gerais da plataforma.</p>

      <div className="mt-6 space-y-6">
        <SecaoCategorias />
        <SecaoAdministradores />
        <SecaoRegrasPadrao />
      </div>
    </div>
  );
}

function SecaoCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEditado, setNomeEditado] = useState("");

  const carregar = () => api<Categoria[]>("GET", "/api/categorias").then(setCategorias);
  useEffect(() => { carregar(); }, []);

  const criar = async () => {
    if (!novaCategoria.trim()) return;
    await api("POST", "/api/categorias", { nome: novaCategoria });
    setNovaCategoria("");
    carregar();
  };

  const salvarEdicao = async (id: number) => {
    if (!nomeEditado.trim()) return;
    await api("PUT", `/api/categorias/${id}`, { nome: nomeEditado });
    setEditandoId(null);
    carregar();
  };

  const excluir = async (categoria: Categoria) => {
    if (!confirm(`Excluir a categoria "${categoria.nome}"? Cursos nessa categoria ficam sem categoria.`)) return;
    await api("DELETE", `/api/categorias/${categoria.id}`);
    carregar();
  };

  return (
    <Card>
      <h3 className="mb-1 text-sm font-bold text-[var(--color-ink)]">Categorias de cursos</h3>
      <p className="mb-4 text-xs text-[var(--color-gray-mid)]">Usadas para organizar e filtrar o catálogo de treinamentos.</p>

      <div className="space-y-2">
        {categorias.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-gray-light)] px-3 py-2">
            {editandoId === cat.id ? (
              <>
                <Input className="py-1.5" value={nomeEditado} onChange={(e) => setNomeEditado(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && salvarEdicao(cat.id)} />
                <button onClick={() => salvarEdicao(cat.id)} className="text-[var(--color-green)] hover:text-[var(--color-green-dark)]"><Check size={16} /></button>
                <button onClick={() => setEditandoId(null)} className="text-[var(--color-gray-mid)] hover:text-[var(--color-ink)]"><X size={16} /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-semibold text-[var(--color-ink)]">{cat.nome}</span>
                <button onClick={() => { setEditandoId(cat.id); setNomeEditado(cat.nome); }} className="text-[var(--color-gray-mid)] hover:text-[var(--color-green)]"><Pencil size={14} /></button>
                <button onClick={() => excluir(cat)} className="text-[var(--color-gray-mid)] hover:text-[var(--color-status-critical)]"><Trash2 size={14} /></button>
              </>
            )}
          </div>
        ))}
        {categorias.length === 0 && <p className="text-sm text-[var(--color-gray-mid)]">Nenhuma categoria cadastrada ainda.</p>}
      </div>

      <div className="mt-3 flex gap-2">
        <Input placeholder="Nova categoria…" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} onKeyDown={(e) => e.key === "Enter" && criar()} />
        <Button variant="secondary" onClick={criar}><Plus size={16} /></Button>
      </div>
    </Card>
  );
}

function SecaoAdministradores() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = () => api<Usuario[]>("GET", "/api/usuarios").then((us) => setUsuarios(us.filter((u) => u.perfil === "ADMIN")));
  useEffect(() => { carregar(); }, []);

  const alternarAtivo = async (usuario: Usuario) => {
    await api("PATCH", `/api/usuarios/${usuario.id}`, { ativo: !usuario.ativo });
    carregar();
  };

  const criar = async () => {
    setErro(""); setSalvando(true);
    try {
      await api("POST", "/api/usuarios", { nome, email, senha, perfil: "ADMIN" });
      setNome(""); setEmail(""); setSenha("");
      setModalAberto(false);
      carregar();
    } catch (e: any) { setErro(e.message || "Erro ao criar administrador"); }
    setSalvando(false);
  };

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--color-ink)]">Usuários administradores</h3>
        <Button variant="secondary" onClick={() => setModalAberto(true)}><Plus size={15} /> Novo administrador</Button>
      </div>
      <p className="mb-4 text-xs text-[var(--color-gray-mid)]">Quem tem acesso ao painel administrativo completo.</p>

      <div className="space-y-2">
        {usuarios.map((u) => (
          <div key={u.id} className="flex items-center gap-3 rounded-[var(--radius-btn)] border border-[var(--color-gray-light)] px-3 py-2">
            <ShieldCheck size={16} className="text-[var(--color-green)]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[var(--color-ink)]">{u.nome}</div>
              <div className="truncate text-xs text-[var(--color-gray-mid)]">{u.email}</div>
            </div>
            <button onClick={() => alternarAtivo(u)}>
              <Badge tom={u.ativo ? "verde" : "critico"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
            </button>
          </div>
        ))}
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Novo administrador">
        <Label>Nome completo</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        <div className="h-3" />
        <Label>E-mail</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="h-3" />
        <Label>Senha</Label>
        <Input value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro && <p className="mt-3 text-sm text-[var(--color-status-critical-fg)]">{erro}</p>}
        <Button className="mt-4 w-full" onClick={criar} disabled={salvando}>{salvando ? "Criando…" : "Criar administrador"}</Button>
      </Modal>
    </Card>
  );
}

function SecaoRegrasPadrao() {
  const [config, setConfig] = useState<ConfigPadrao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { api<ConfigPadrao>("GET", "/api/configuracoes").then(setConfig); }, []);

  if (!config) return null;

  const campo = (k: keyof ConfigPadrao, v: number) => setConfig((c) => c && { ...c, [k]: v });

  const salvar = async () => {
    setSalvando(true); setMsg("");
    try {
      await api("PUT", "/api/configuracoes", config);
      setMsg("Salvo com sucesso.");
      setTimeout(() => setMsg(""), 2000);
    } finally { setSalvando(false); }
  };

  return (
    <Card>
      <h3 className="mb-1 text-sm font-bold text-[var(--color-ink)]">Regras padrão para novos cursos</h3>
      <p className="mb-4 text-xs text-[var(--color-gray-mid)]">Aplicadas automaticamente ao clicar em "Novo curso" — cada curso pode ajustar depois, individualmente.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>% mínimo assistido p/ concluir aula</Label>
          <Input type="number" min={1} max={100} value={config.percentualMinimoAulaPadrao} onChange={(e) => campo("percentualMinimoAulaPadrao", Number(e.target.value))} />
        </div>
        <div>
          <Label>Nota mínima do quiz (%)</Label>
          <Input type="number" min={0} max={100} value={config.notaMinimaQuizPadrao} onChange={(e) => campo("notaMinimaQuizPadrao", Number(e.target.value))} />
        </div>
        <div>
          <Label>Nota mínima da prova final (%)</Label>
          <Input type="number" min={0} max={100} value={config.notaMinimaProvaPadrao} onChange={(e) => campo("notaMinimaProvaPadrao", Number(e.target.value))} />
        </div>
        <div>
          <Label>Número de tentativas</Label>
          <Input type="number" min={1} value={config.maxTentativasPadrao} onChange={(e) => campo("maxTentativasPadrao", Number(e.target.value))} />
        </div>
        <div>
          <Label>Nº de questões da prova final</Label>
          <Input type="number" min={1} value={config.numQuestoesProvaPadrao} onChange={(e) => campo("numQuestoesProvaPadrao", Number(e.target.value))} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar regras padrão"}</Button>
        {msg && <span className="text-sm font-semibold text-[var(--color-green)]">{msg}</span>}
      </div>
    </Card>
  );
}
