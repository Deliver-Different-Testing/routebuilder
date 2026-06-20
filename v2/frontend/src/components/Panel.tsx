import { ReactNode } from 'react';

interface Props {
  title: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function Panel({ title, actions, className = '', children }: Props) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full min-h-0 overflow-hidden ${className}`}>
      <div className="panel-drag-handle bg-gray-600 text-white px-3 py-1.5 flex items-center justify-between shrink-0 cursor-move rounded-t-lg">
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
        <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>{actions}</div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
