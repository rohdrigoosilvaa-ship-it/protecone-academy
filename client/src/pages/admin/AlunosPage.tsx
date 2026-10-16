import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Download } from "lucide-react";
import { api } from "../../lib/api";
import { baixarCsv } from "../../lib/csv";
import type { Usuario } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Label, Select } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

export function AlunosPage() {
  const [termo, setTermo] = useState("");
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  const buscar = () => api<Usuario[]>("GET", `/api/relatorios/alunos/busca?q=${encodeURIComponent(termo)}`).then(setAlunos);
  useEffect(() => { buscar(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">Alunos</h1>
          <p className="mt-1 text-[var(--color-gray-mid)]">Gerencie as contas de alunos e administradores.</p>
        </div>
        <div className="flex gap-2">
          {alunos.length > 0 && (
            <Button variant="secondary" onClick={() => baixarCsv("alunos", alunos.map((a) => ({ Nome: a.nome, "E-mail": a.email, Perfil: a.perfil, Status: a.ativo ? "Ativo" : "Inativo" })))}>
              <Download size={16} /> Exportar CSV
            </Button>
          )}
          <Button onClick={() => setModalAberto(true)}><Plus size={16} /> Novo usuário</Button>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Input placeholder="Buscar por nome ou e-mail…" value={termo} onChange={(e) => setTermo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscar()} />
        <Button variant="secondary" onClick={buscar}><Search size={16} /></Button>
      </div>

      <Card className="mt-4 p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-gray-light)] text-left text-xs font-bold uppercase text-[var(--color-gray-mid)]">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((a) => (
              <tr key={a.id} className="border-b border-[var(--color-gray-light)] last:border-0">
                <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">{a.nome}</td>
                <td className="px-4 py-3 text-[var(--color-gray-mid)]">{a.email}</td>
                <td className="px-4 py-3"><Link to={`/admin/alunos/${a.id}`} className="font-semibold text-[var(--color-green)] hover:underline">Ver relatório</Link></td>
              </tr>
            ))}
            {alunos.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-[var(--color-gray-mid)]">Nenhum aluno encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <NovoUsuarioModal aberto={modalAberto} onFechar={() => setModalAberto(false)} onCriado={buscar} />
    </div>
  );
}

function NovoUsuarioModal({ aberto, onFechar, onCriado }: { aberto: boolean; onFechar: () => void; onCriado: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<"ALUNO" | "ADMIN">("ALUNO");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const criar = async () => {
    setErro(""); setSalvando(true);
    try {
      await api("POST", "/api/usuarios", { nome, email, senha, perfil });
      setNome(""); setEmail(""); setSenha(""); setPerfil("ALUNO");
      onCriado();
      onFechar();
    } catch (e: any) { setErro(e.message || "Erro ao criar usuário"); }
    setSalvando(false);
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Novo usuário">
      <Label>Nome completo</Label>
      <Input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
      <div className="h-3" />
      <Label>E-mail</Label>
      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="h-3" />
      <Label>Senha</Label>
      <Input type="text" value={senha} onChange={(e) => setSenha(e.target.value)} />
      <div className="h-3" />
      <Label>Perfil</Label>
      <Select value={perfil} onChange={(e) => setPerfil(e.target.value as "ALUNO" | "ADMIN")}>
        <option value="ALUNO">Aluno</option>
        <option value="ADMIN">Administrador</option>
      </Select>
      {erro && <p className="mt-3 text-sm text-[var(--color-status-critical-fg)]">{erro}</p>}
      <Button className="mt-4 w-full" onClick={criar} disabled={salvando}>{salvando ? "Criando…" : "Criar usuário"}</Button>
    </Modal>
  );
}
