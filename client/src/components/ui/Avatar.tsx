function iniciais(nome?: string) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] || "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function Avatar({ nome, size = 34 }: { nome?: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[var(--color-green)] font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {iniciais(nome)}
    </div>
  );
}
