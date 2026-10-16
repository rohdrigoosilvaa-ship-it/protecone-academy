import { useRef, useState, type ReactNode } from "react";
import { GripVertical } from "lucide-react";

interface Props<T extends { id: number }> {
  itens: T[];
  onReordenar: (novaOrdem: T[]) => void;
  renderItem: (item: T, arrastando: boolean) => ReactNode;
}

// drag-and-drop nativo HTML5 (sem biblioteca extra) — seção 19 do escopo:
// reordenar módulos/aulas arrastando.
export function DragList<T extends { id: number }>({ itens, onReordenar, renderItem }: Props<T>) {
  const [arrastandoId, setArrastandoId] = useState<number | null>(null);
  const ordemRef = useRef<T[]>(itens);
  ordemRef.current = itens;

  const onDrop = (idDestino: number) => {
    if (arrastandoId === null || arrastandoId === idDestino) return;
    const lista = [...ordemRef.current];
    const origemIdx = lista.findIndex((i) => i.id === arrastandoId);
    const destinoIdx = lista.findIndex((i) => i.id === idDestino);
    const [movido] = lista.splice(origemIdx, 1);
    lista.splice(destinoIdx, 0, movido);
    onReordenar(lista);
    setArrastandoId(null);
  };

  return (
    <div className="space-y-2">
      {itens.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setArrastandoId(item.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(item.id)}
          className={`flex items-start gap-2 ${arrastandoId === item.id ? "opacity-50" : ""}`}
        >
          <span className="mt-2.5 cursor-grab text-[var(--color-gray-mid)]"><GripVertical size={16} /></span>
          <div className="flex-1">{renderItem(item, arrastandoId === item.id)}</div>
        </div>
      ))}
    </div>
  );
}
