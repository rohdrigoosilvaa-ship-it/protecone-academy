import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Recolher (desktop, vira só ícones) fica lembrado entre sessões; o menu
// mobile (off-canvas) sempre começa fechado e fecha sozinho ao navegar.
export function useSidebarState(chaveArmazenamento: string) {
  const [colapsada, setColapsada] = useState(() => {
    try { return localStorage.getItem(chaveArmazenamento) === "1"; } catch { return false; }
  });
  const [mobileAberta, setMobileAberta] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileAberta(false); }, [location.pathname]);

  const alternarColapsada = () => {
    setColapsada((v) => {
      const novo = !v;
      try { localStorage.setItem(chaveArmazenamento, novo ? "1" : "0"); } catch { /* noop */ }
      return novo;
    });
  };

  return { colapsada, alternarColapsada, mobileAberta, setMobileAberta };
}
