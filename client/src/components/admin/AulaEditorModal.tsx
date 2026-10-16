import { useEffect, useState } from "react";
import { Paperclip, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { extrairIdVideo } from "../../lib/videoId";
import type { Aula, Material, TipoConteudoAula, ProvedorVideo } from "../../lib/types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Label, Select, Textarea } from "../ui/Input";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  moduloId: number;
  aula: Aula | null; // null = criar
  onSalvo: () => void;
}

const vazio = {
  nome: "", descricao: "", tipo: "VIDEO" as TipoConteudoAula, provedorVideo: "YOUTUBE" as ProvedorVideo,
  videoId: "", videoUrl: "", conteudoTexto: "", duracaoSegundos: "" as number | "",
};

export function AulaEditorModal({ aberto, onFechar, moduloId, aula, onSalvo }: Props) {
  const [form, setForm] = useState(vazio);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [novoMaterial, setNovoMaterial] = useState({ nome: "", url: "" });

  useEffect(() => {
    if (aula) {
      setForm({
        nome: aula.nome, descricao: aula.descricao || "", tipo: aula.tipo,
        provedorVideo: aula.provedorVideo || "YOUTUBE", videoId: aula.videoId || "", videoUrl: aula.videoUrl || "",
        conteudoTexto: aula.conteudoTexto || "", duracaoSegundos: aula.duracaoSegundos ?? "",
      });
      setMateriais(aula.materiais || []);
    } else {
      setForm(vazio);
      setMateriais([]);
    }
  }, [aula, aberto]);

  const campo = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const salvar = async () => {
    if (!form.nome.trim()) return;
    setSalvando(true);
    try {
      const corpo = {
        ...form,
        // rede de segurança: normaliza de novo aqui mesmo se o campo tiver sido
        // preenchido de um jeito que não passou pelo onChange (ex.: autofill)
        videoId: form.provedorVideo !== "URL" ? extrairIdVideo(form.provedorVideo, form.videoId) : form.videoId,
        duracaoSegundos: form.duracaoSegundos === "" ? null : Number(form.duracaoSegundos),
      };
      if (aula) await api("PUT", `/api/aulas/${aula.id}`, corpo);
      else await api("POST", `/api/aulas/modulo/${moduloId}`, corpo);
      onSalvo();
      onFechar();
    } finally { setSalvando(false); }
  };

  const adicionarMaterial = async () => {
    if (!aula || !novoMaterial.nome.trim() || !novoMaterial.url.trim()) return;
    const m = await api<Material>("POST", `/api/materiais/aula/${aula.id}`, { nome: novoMaterial.nome, tipo: "LINK", url: novoMaterial.url });
    setMateriais((ms) => [...ms, m]);
    setNovoMaterial({ nome: "", url: "" });
  };

  const removerMaterial = async (id: number) => {
    await api("DELETE", `/api/materiais/${id}`);
    setMateriais((ms) => ms.filter((m) => m.id !== id));
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo={aula ? "Editar aula" : "Nova aula"} largura="max-w-xl">
      <div className="space-y-4">
        <div>
          <Label>Nome da aula</Label>
          <Input value={form.nome} onChange={(e) => campo("nome", e.target.value)} autoFocus />
        </div>
        <div>
          <Label>Descrição (opcional)</Label>
          <Textarea rows={2} value={form.descricao} onChange={(e) => campo("descricao", e.target.value)} />
        </div>
        <div>
          <Label>Tipo de conteúdo</Label>
          <Select value={form.tipo} onChange={(e) => campo("tipo", e.target.value)}>
            <option value="VIDEO">Vídeo</option>
            <option value="TEXTO">Texto</option>
            <option value="PDF">PDF</option>
            <option value="IMAGEM">Imagem</option>
            <option value="LINK">Link externo</option>
          </Select>
        </div>

        {form.tipo === "VIDEO" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Provedor</Label>
              <Select value={form.provedorVideo} onChange={(e) => campo("provedorVideo", e.target.value)}>
                <option value="YOUTUBE">YouTube (não listado)</option>
                <option value="VIMEO">Vimeo</option>
                <option value="URL">Link direto (.mp4)</option>
              </Select>
            </div>
            <div>
              <Label>Duração (segundos, opcional)</Label>
              <Input type="number" value={form.duracaoSegundos} onChange={(e) => campo("duracaoSegundos", e.target.value ? Number(e.target.value) : "")} />
            </div>
            {form.provedorVideo === "URL" ? (
              <div className="col-span-2">
                <Label>URL do vídeo (.mp4)</Label>
                <Input value={form.videoUrl} onChange={(e) => campo("videoUrl", e.target.value)} placeholder="https://…/video.mp4" />
              </div>
            ) : (
              <div className="col-span-2">
                <Label>{form.provedorVideo === "YOUTUBE" ? "Link ou ID do vídeo do YouTube" : "Link ou ID do vídeo do Vimeo"}</Label>
                <Input
                  value={form.videoId}
                  onChange={(e) => campo("videoId", e.target.value)}
                  onBlur={(e) => campo("videoId", extrairIdVideo(form.provedorVideo, e.target.value))}
                  placeholder={form.provedorVideo === "YOUTUBE" ? "cole o link ou só o ID, ex.: dQw4w9WgXcQ" : "cole o link ou só o ID, ex.: 76979871"}
                />
                <p className="mt-1 text-xs text-[var(--color-gray-mid)]">
                  Pode colar o link inteiro (ex.: youtu.be/…) — o ID é extraído automaticamente. {form.provedorVideo === "YOUTUBE" && "Deixe o vídeo como \"não listado\" no YouTube."}
                </p>
              </div>
            )}
          </div>
        )}

        {form.tipo === "TEXTO" && (
          <div>
            <Label>Conteúdo</Label>
            <Textarea rows={6} value={form.conteudoTexto} onChange={(e) => campo("conteudoTexto", e.target.value)} />
          </div>
        )}

        {(form.tipo === "PDF" || form.tipo === "IMAGEM" || form.tipo === "LINK") && (
          <div>
            <Label>{form.tipo === "LINK" ? "URL do link externo" : `URL do arquivo (${form.tipo})`}</Label>
            <Input value={form.videoUrl} onChange={(e) => campo("videoUrl", e.target.value)} placeholder="https://…" />
          </div>
        )}

        {aula && (
          <div>
            <Label>Materiais complementares</Label>
            <ul className="mb-2 space-y-1.5">
              {materiais.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-sm">
                  <Paperclip size={13} className="text-[var(--color-gray-mid)]" />
                  <a href={m.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-[var(--color-green)] hover:underline">{m.nome}</a>
                  <button onClick={() => removerMaterial(m.id)} className="text-[var(--color-gray-mid)] hover:text-[var(--color-status-critical)]"><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input placeholder="Nome" value={novoMaterial.nome} onChange={(e) => setNovoMaterial((n) => ({ ...n, nome: e.target.value }))} />
              <Input placeholder="URL" value={novoMaterial.url} onChange={(e) => setNovoMaterial((n) => ({ ...n, url: e.target.value }))} />
              <Button type="button" variant="secondary" onClick={adicionarMaterial}>+</Button>
            </div>
          </div>
        )}

        <Button className="w-full" onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar aula"}</Button>
      </div>
    </Modal>
  );
}
