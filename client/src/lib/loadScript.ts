const carregados = new Set<string>();

export function loadScript(src: string): Promise<void> {
  if (carregados.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existente = document.querySelector(`script[src="${src}"]`);
    if (existente) { carregados.add(src); resolve(); return; }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => { carregados.add(src); resolve(); };
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(script);
  });
}
