import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Layers, Users, Search, Pencil, Copy, CloudUpload, CloudOff, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Categoria, Curso, StatusCurso } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SkeletonCards } from "../../components/ui/Skeleton";
import { Modal } from "../../components/ui/Modal";
import { Input, Label, Select, Textarea } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { ActionMenu } from "../../components/ui/ActionMenu";

const STATUS_TOM = { RASCUNHO: "cinza", PUBLICADO: "verde", ARQUIVADO: "atencao" } as const;
const STATUS_LABEL = { RASCUNHO: "Rascunho", PUBLICADO: "Publicado", ARQUIVADO: "Arquivado" } as const;

export function CursosListPage() {
  const [cursos, setCursos] = useState<Curso[] | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusCurso | "">("");
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [criando, setCriando] = useState(false);
  const navigate = useNavigate();

  const carregar = () => api<Curso[]>("GET", "/api/cursos").then(setCursos);
  useEffect(() => { carregar(); api<Categoria[]>("GET", "/api/categorias").then(setCategorias); }, []);

  const criar = async () => {
    if (!nome.trim() || !descricao.trim()) return;
    setCriando(true);
    try {
      const curso = await api<Curso>("POST", "/api/cursos", { nome, descricao });
      navigate(`/admin/cursos/${curso.id}`);
    } finally { setCriando(false); }
  };

  const duplicar = async (id: number) => {
    await api("POST", `/api/cursos/${id}/duplicar`);
    carregar();
  };

  const alternarPublicacao = async (curso: Curso) => {
    const novoStatus = curso.status === "PUBLICADO" ? "RASCUNHO" : "PUBLICADO";
    await api("PUT", `/api/cursos/${curso.id}`, { status: novoStatus });
    carregar();
  };

  const excluir = async (curso: Curso) => {
    if (!confirm(`Excluir o curso "${curso.nome}" e todo o seu conteúdo? Esta ação não pode ser desfeita.`)) return;
    await api("DELETE", `/api/cursos/${curso.id}`);
    carregar();
  };

  const cursosFiltrados = useMemo(() => {
    if (!cursos) return [];
    const termo = busca.trim().toLowerCase();
    return cursos.filter((c) => {
      if (termo && !c.nome.toLowerCase().includes(termo) && !c.descricao.toLowerCase().includes(termo)) return false;
      if (filtroCategoria && String(c.categoriaId || "") !== filtroCategoria) return false;
      if (filtroStatus && c.status !== filtroStatus) return false;
      return true;
    });
  }, [cursos, busca, filtroCategoria, filtroStatus]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">Cursos</h1>
          <p className="mt-1 text-[var(--color-gray-mid)]">Crie e gerencie os treinamentos da plataforma.</p>
        </div>
        <Button onClick={() => setModalAberto(true)}><Plus size={16} /> Novo curso</Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-mid)]" />
          <Input className="pl-9" placeholder="Buscar por nome ou descrição…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <Select className="max-w-[200px]" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
        <Select className="max-w-[180px]" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusCurso | "")}>
          <option value="">Todos os status</option>
          <option value="RASCUNHO">Rascunho</option>
          <option value="PUBLICADO">Publicado</option>
          <option value="ARQUIVADO">Arquivado</option>
        </Select>
      </div>

      {!cursos ? (
        <div className="mt-6"><SkeletonCards /></div>
      ) : cursosFiltrados.length === 0 ? (
        <EmptyState
          className="mt-6"
          titulo={cursos.length === 0 ? "Nenhum curso criado ainda" : "Nenhum curso encontrado"}
          descricao={cursos.length === 0 ? "Clique em \"Novo curso\" para começar." : "Tente ajustar a busca ou os filtros."}
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursosFiltrados.map((curso) => (
            <Card key={curso.id} className="relative h-full transition hover:border-[var(--color-green)]">
              <Link to={`/admin/cursos/${curso.id}`} className="block">
                <div className="flex items-start justify-between gap-2 pr-6">
                  <h3 className="font-bold text-[var(--color-ink)]">{curso.nome}</h3>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tom={STATUS_TOM[curso.status]}>{STATUS_LABEL[curso.status]}</Badge>
                  {curso.categoria && <Badge tom="cinza">{curso.categoria.nome}</Badge>}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--color-gray-mid)]">{curso.descricao}</p>
                <div className="mt-3 flex gap-4 text-xs font-semibold text-[var(--color-gray-mid)]">
                  <span className="flex items-center gap-1"><Layers size={13} /> {curso._count?.modulos ?? 0} módulos</span>
                  <span className="flex items-center gap-1"><Users size={13} /> {curso._count?.matriculas ?? 0} alunos</span>
                </div>
              </Link>

              <div className="absolute right-3 top-3">
                <ActionMenu
                  acoes={[
                    { label: "Editar", icon: <Pencil size={14} />, onClick: () => navigate(`/admin/cursos/${curso.id}`) },
                    { label: "Duplicar", icon: <Copy size={14} />, onClick: () => duplicar(curso.id) },
                    curso.status === "PUBLICADO"
                      ? { label: "Despublicar", icon: <CloudOff size={14} />, onClick: () => alternarPublicacao(curso) }
                      : { label: "Publicar", icon: <CloudUpload size={14} />, onClick: () => alternarPublicacao(curso) },
                    { label: "Excluir", icon: <Trash2 size={14} />, onClick: () => excluir(curso), perigo: true },
                  ]}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Novo curso">
        <Label>Nome do curso</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        <div className="h-3" />
        <Label>Descrição curta</Label>
        <Textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <Button className="mt-4 w-full" onClick={criar} disabled={criando}>{criando ? "Criando…" : "Criar curso"}</Button>
      </Modal>
    </div>
  );
}
