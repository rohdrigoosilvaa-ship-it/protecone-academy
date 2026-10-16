// Extrai o ID de vídeo de um link colado (YouTube/Vimeo), aceitando também
// o ID puro. Evita o erro comum de colar a URL inteira no campo — o player
// (YT.Player / Vimeo.Player) exige só o ID e fica com a tela preta em
// silêncio quando recebe uma URL.
export function extrairIdVideo(provedor: "YOUTUBE" | "VIMEO" | "URL", valor: string): string {
  const v = valor.trim();
  if (!v) return v;

  if (provedor === "YOUTUBE") {
    const padroes = [
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{6,})/,
    ];
    for (const p of padroes) {
      const m = v.match(p);
      if (m) return m[1];
    }
    try {
      const url = new URL(v);
      const vParam = url.searchParams.get("v");
      if (vParam) return vParam;
    } catch { /* não é uma URL — provavelmente já é o ID puro */ }
    return v;
  }

  // VIMEO
  const m = v.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return m[1];
  try {
    const url = new URL(v);
    const partes = url.pathname.split("/").filter(Boolean);
    const ultima = partes[partes.length - 1];
    if (ultima && /^\d+$/.test(ultima)) return ultima;
  } catch { /* já é o ID puro */ }
  return v;
}
