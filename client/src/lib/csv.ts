// Exportação simples de CSV, gerada no navegador a partir de dados já
// carregados na tela — sem depender de biblioteca nova nem de endpoint novo.
export function baixarCsv(nomeArquivo: string, linhas: Record<string, string | number>[]) {
  if (!linhas.length) return;
  const colunas = Object.keys(linhas[0]);
  const escapar = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const conteudo = [colunas.join(";"), ...linhas.map((l) => colunas.map((c) => escapar(l[c])).join(";"))].join("\n");
  const blob = new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo.endsWith(".csv") ? nomeArquivo : `${nomeArquivo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
