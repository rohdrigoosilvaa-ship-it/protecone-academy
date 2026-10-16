import { useEffect, useState } from "react";
import { ChevronDown, FileText, Image, Link2, Pencil, Plus, Trash2, Video } from "lucide-react";
import { api } from "../../lib/api";
import type { Aula, Modulo } from "../../lib/types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { DragList } from "../ui/DragList";
import { AulaEditorModal } from "./AulaEditorModal";

const ICONE_TIPO = { VIDEO: Video, TEXTO: FileText, PDF: FileText, IMAGEM: Image, LINK: Link2 };

export function ModulosAulasTab({ cursoId }: { cursoId: number }) {
  const [modulos, setModulos] = useState<Modulo[] | null>(null);
  const [abertoId, setAbertoId] = useState<number | null>(null);
  const [aulasPorModulo, setAulasPorModulo] = useState<Record<number, Aula[]>>({});
  const [novoModuloNome, setNovoModuloNome] = useState("");
  const [modalModulo, setModalModulo] = useState<Modulo | null>(null);
  const [editorAula, setEditorAula] = useState<{ moduloId: number; aula: Aula | null } | null>(null);

  const carregarModulos = () => api<Modulo[]>("GET", `/api/modulos/curso/${cursoId}`).then(setModulos);
  useEffect(() => { carregarModulos(); }, [cursoId]);

  const carregarAulas = async (moduloId: number) => {
    const aulas = await api<Aula[]>("GET", `/api/aulas/modulo/${moduloId}`);
    setAulasPorModulo((m) => ({ ...m, [moduloId]: aulas }));
  };

  const toggle = (moduloId: number) => {
    const abrir = abertoId !== moduloId;
    setAbertoId(abrir ? moduloId : null);
    if (abrir && !aulasPorModulo[moduloId]) carregarAulas(moduloId);
  };

  const criarModulo = async () => {
    if (!novoModuloNome.trim()) return;
    await api("POST", `/api/modulos/curso/${cursoId}`, { nome: novoModuloNome });
    setNovoModuloNome("");
    carregarModulos();
  };

  const excluirModulo = async (id: number) => {
    if (!confirm("Excluir este módulo e todas as suas aulas?")) return;
    await api("DELETE", `/api/modulos/${id}`);
    carregarModulos();
  };

  const excluirAula = async (moduloId: number, id: number) => {
    if (!confirm("Excluir esta aula?")) return;
    await api("DELETE", `/api/aulas/${id}`);
    carregarAulas(moduloId);
  };

  const reordenarModulos = async (novaOrdem: Modulo[]) => {
    setModulos(novaOrdem);
    await api("PUT", `/api/modulos/curso/${cursoId}/reordenar`, { ids: novaOrdem.map((m) => m.id) });
  };

  const reordenarAulas = async (moduloId: number, novaOrdem: Aula[]) => {
    setAulasPorModulo((m) => ({ ...m, [moduloId]: novaOrdem }));
    await api("PUT", `/api/aulas/modulo/${moduloId}/reordenar`, { ids: novaOrdem.map((a) => a.id) });
  };

  if (!modulos) return null;

  return (
    <div>
      <Card className="mb-4 flex gap-2">
        <Input placeholder="Nome do novo módulo" value={novoModuloNome} onChange={(e) => setNovoModuloNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && criarModulo()} />
        <Button onClick={criarModulo}><Plus size={16} /> Adicionar módulo</Button>
      </Card>

      <DragList
        itens={modulos}
        onReordenar={reordenarModulos}
        renderItem={(modulo) => (
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => toggle(modulo.id)} className="flex flex-1 items-center gap-2 text-left">
                <ChevronDown size={16} className={`transition ${abertoId === modulo.id ? "rotate-180" : ""}`} />
                <span className="font-bold text-[var(--color-ink)]">{modulo.nome}</span>
              </button>
              <button onClick={() => setModalModulo(modulo)} className="text-[var(--color-gray-mid)] hover:text-[var(--color-green)]"><Pencil size={15} /></button>
              <button onClick={() => excluirModulo(modulo.id)} className="text-[var(--color-gray-mid)] hover:text-[var(--color-status-critical)]"><Trash2 size={15} /></button>
            </div>

            {abertoId === modulo.id && (
              <div className="border-t border-[var(--color-gray-light)] bg-[var(--color-gray-subtle)] p-4">
                {aulasPorModulo[modulo.id] ? (
                  <>
                    <DragList
                      itens={aulasPorModulo[modulo.id]}
                      onReordenar={(nova) => reordenarAulas(modulo.id, nova)}
                      renderItem={(aula) => {
                        const Icone = ICONE_TIPO[aula.tipo];
                        return (
                          <div className="flex items-center gap-2 rounded-[var(--radius-btn)] bg-white px-3 py-2 text-sm">
                            <Icone size={15} className="shrink-0 text-[var(--color-green)]" />
                            <span className="flex-1 truncate font-semibold text-[var(--color-ink)]">{aula.nome}</span>
                            <button onClick={() => setEditorAula({ moduloId: modulo.id, aula })} className="text-[var(--color-gray-mid)] hover:text-[var(--color-green)]"><Pencil size={14} /></button>
                            <button onClick={() => excluirAula(modulo.id, aula.id)} className="text-[var(--color-gray-mid)] hover:text-[var(--color-status-critical)]"><Trash2 size={14} /></button>
                          </div>
                        );
                      }}
                    />
                    <Button variant="secondary" className="mt-3" onClick={() => setEditorAula({ moduloId: modulo.id, aula: null })}>
                      <Plus size={15} /> Nova aula
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-[var(--color-gray-mid)]">Carregando…</p>
                )}
              </div>
            )}
          </Card>
        )}
      />

      {modalModulo && (
        <EditarModuloModal
          modulo={modalModulo}
          onFechar={() => setModalModulo(null)}
          onSalvo={() => { setModalModulo(null); carregarModulos(); }}
        />
      )}

      {editorAula && (
        <AulaEditorModal
          aberto
          onFechar={() => setEditorAula(null)}
          moduloId={editorAula.moduloId}
          aula={editorAula.aula}
          onSalvo={() => carregarAulas(editorAula.moduloId)}
        />
      )}
    </div>
  );
}

function EditarModuloModal({ modulo, onFechar, onSalvo }: { modulo: Modulo; onFechar: () => void; onSalvo: () => void }) {
  const [nome, setNome] = useState(modulo.nome);
  const [descricao, setDescricao] = useState(modulo.descricao || "");
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setSalvando(true);
    try { await api("PUT", `/api/modulos/${modulo.id}`, { nome, descricao }); onSalvo(); }
    finally { setSalvando(false); }
  };

  return (
    <Modal aberto onFechar={onFechar} titulo="Editar módulo">
      <Input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
      <div className="h-3" />
      <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição (opcional)" />
      <Button className="mt-4 w-full" onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Button>
    </Modal>
  );
}
