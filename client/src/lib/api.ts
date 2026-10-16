export const API_BASE = "";

let TOKEN: string | null = typeof localStorage !== "undefined" ? localStorage.getItem("psa_token") : null;

export function getToken() {
  return TOKEN;
}

export function setToken(t: string | null) {
  TOKEN = t;
  try {
    if (t) localStorage.setItem("psa_token", t);
    else localStorage.removeItem("psa_token");
  } catch {
    /* localStorage indisponível — sessão só dura a aba atual */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (TOKEN) headers.Authorization = "Bearer " + TOKEN;
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json: any = null;
  try { json = await res.json(); } catch { /* sem corpo (204) */ }
  if (res.status === 401) setToken(null);
  if (!res.ok) throw new ApiError((json && json.erro) || "Erro", res.status);
  return json as T;
}

// baixa um arquivo (blob) autenticado — usado pelo certificado em PDF
export async function apiDownload(path: string, nomeArquivoPadrao?: string) {
  const headers: Record<string, string> = {};
  if (TOKEN) headers.Authorization = "Bearer " + TOKEN;
  const res = await fetch(API_BASE + path, { headers });
  if (!res.ok) {
    let json: any = null;
    try { json = await res.json(); } catch { /* noop */ }
    throw new ApiError((json && json.erro) || "Erro ao baixar arquivo", res.status);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const m = cd.match(/filename="?([^"]+)"?/);
  const nome = (m && m[1]) || nomeArquivoPadrao || "arquivo";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}
