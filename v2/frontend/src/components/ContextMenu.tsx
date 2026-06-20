import { useEffect, useRef } from 'react';

export interface MenuItem {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface Props {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-[2000] bg-white border border-gray-300 shadow-lg py-0.5 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="border-t border-gray-200 my-0.5" />
        ) : (
          <button
            key={i}
            onClick={() => { if (!item.disabled) { item.onClick?.(); onClose(); } }}
            disabled={item.disabled}
            className={`w-full text-left text-xs px-3 py-1.5 ${
              item.disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-brand-dark hover:bg-amber-50'
            }`}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
