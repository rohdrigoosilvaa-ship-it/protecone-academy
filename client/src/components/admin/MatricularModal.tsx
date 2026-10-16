import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import type { Curso, Usuario } from "../../lib/types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Label, Select } from "../ui/Input";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onMatriculado: () => void;
  // se vier pré-definido, o respectivo seletor não aparece
  cursoIdFixo?: number;
  usuarioIdFixo?: number;
}

// Modal único de matrícula — usado tanto em Admin > Alunos (curso a
// escolher) quanto na aba "Alunos" do curso (aluno(s) a escolher, com
// seleção múltipla para matrícula em massa — seção 13 do fluxo de acesso).
export function MatricularModal({ aberto, onFechar, onMatriculado, cursoIdFixo, usuarioIdFixo }: Props) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [cursoId, setCursoId] = useState<string>(cursoIdFixo ? String(cursoIdFixo) : "");
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set(usuarioIdFixo ? [usuarioIdFixo] : []));
  const [expiraEm, setExpiraEm] = useState("");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setErro(""); setMsg("");
    setCursoId(cursoIdFixo ? String(cursoIdFixo) : "");
    setSelecionados(new Set(usuarioIdFixo ? [usuarioIdFixo] : []));
    setExpiraEm("");
    if (!cursoIdFixo) api<Curso[]>("GET", "/api/cursos").then((cs) => setCursos(cs.filter((c) => c.status === "PUBLICADO")));
    if (!usuarioIdFixo) api<Usuario[]>("GET", "/api/usuarios").then((us) => setAlunos(us.filter((u) => u.perfil === "ALUNO" && u.ativo)));
  }, [aberto, cursoIdFixo, usuarioIdFixo]);

  const alternarSelecionado = (id: number) => {
    setSelecionados((s) => {
      const novo = new Set(s);
      if (novo.has(id)) novo.delete(id); else novo.add(id);
      return novo;
    });
  };

  const matricular = async () => {
    setErro(""); setMsg("");
    if (!cursoId) { setErro("Escolha um curso."); return; }
    if (selecionados.size === 0) { setErro("Escolha ao menos um aluno."); return; }
    setSalvando(true);
    try {
      const corpo = { expiraEm: expiraEm || undefined };
      if (selecionados.size === 1) {
        await api("POST", "/api/matriculas", { usuarioId: [...selecionados][0], cursoId: Number(cursoId), ...corpo });
        setMsg("Aluno matriculado com sucesso.");
      } else {
        const r = await api<{ matriculados: number[]; jaMatriculados: number[]; erros: any[] }>(
          "POST", "/api/matriculas/em-massa", { usuarioIds: [...selecionados], cursoId: Number(cursoId), ...corpo }
        );
        const partes = [];
        if (r.matriculados.length) partes.push(`${r.matriculados.length} matriculado(s)`);
        if (r.jaMatriculados.length) partes.push(`${r.jaMatriculados.length} já estava(m) matriculado(s)`);
        if (r.erros.length) partes.push(`${r.erros.length} com erro`);
        setMsg(partes.join(" · ") + ".");
      }
      onMatriculado();
      setTimeout(() => { onFechar(); }, 900);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível matricular.");
    }
    setSalvando(false);
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Matricular aluno" largura="max-w-lg">
      <div className="space-y-4">
        {!cursoIdFixo && (
          <div>
            <Label>Curso</Label>
            <Select value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
              <option value="">Selecione um curso publicado…</option>
              {cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </div>
        )}

        {!usuarioIdFixo && (
          <div>
            <Label>{selecionados.size > 1 || alunos.length > 1 ? "Alunos (selecione um ou mais)" : "Aluno"}</Label>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-[var(--radius-btn)] border border-[var(--color-gray-light)] p-2">
              {alunos.map((a) => (
                <label key={a.id} className="flex items-center gap-2 rounded-[var(--radius-btn)] px-2 py-1.5 text-sm hover:bg-[var(--color-gray-subtle)]">
                  <input type="checkbox" checked={selecionados.has(a.id)} onChange={() => alternarSelecionado(a.id)} />
                  <span className="flex-1 truncate">{a.nome}</span>
                  <span className="truncate text-xs text-[var(--color-gray-mid)]">{a.email}</span>
                </label>
              ))}
              {alunos.length === 0 && <p className="px-2 py-1 text-sm text-[var(--color-gray-mid)]">Nenhum aluno ativo cadastrado.</p>}
            </div>
          </div>
        )}

        <div>
          <Label>Data de vencimento (opcional)</Label>
          <Input type="date" value={expiraEm} onChange={(e) => setExpiraEm(e.target.value)} />
        </div>

        {erro && <p className="text-sm font-semibold text-[var(--color-status-critical-fg)]">{erro}</p>}
        {msg && <p className="text-sm font-semibold text-[var(--color-green)]">{msg}</p>}

        <Button className="w-full" onClick={matricular} disabled={salvando}>
          {salvando ? "Matriculando…" : selecionados.size > 1 ? `Matricular ${selecionados.size} selecionados` : "Matricular aluno"}
        </Button>
      </div>
    </Modal>
  );
}
