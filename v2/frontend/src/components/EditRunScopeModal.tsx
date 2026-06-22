import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EditRunScopeModal({ open, onClose }: Props) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5); // 0=Jan, 5=June
  const [day, setDay] = useState(15);

  if (!open) return null;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells: { day: number; muted: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDay + 1, muted: true });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white border border-gray-300 shadow-2xl p-5 grid grid-cols-2 gap-6 w-[640px]"
      >
        <div className="space-y-4">
          <Field label="Select Client" options={['Select…', 'WOOP', 'STRYK', 'UCLKT', 'FARON', 'UCLGE']} />
          <Field label="Region"        options={['Select…', 'Central', 'City Old', 'Christchurch Regional', 'Truck', 'Auckland Cool']} />
          <Field label="Speed"         options={['Select…', '1hr', '2hr', '3hr', 'Same-day', 'Overnight']} />
          <Field label="Our Ref"       options={['Select…', 'Default', 'Custom A', 'Custom B']} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2 text-xs">
            <button onClick={prevMonth} className="text-brand-cyan hover:underline">prev</button>
            <span className="font-semibold text-brand-dark">{monthNames[month]} {year}</span>
            <button onClick={nextMonth} className="text-brand-cyan hover:underline">next</button>
          </div>
          <div className="grid grid-cols-7 gap-px text-[10px] text-center">
            {dayNames.map(d => (
              <div key={d} className="font-semibold text-gray-500 py-1">{d}</div>
            ))}
            {cells.map((c, i) => {
              const isSelected = !c.muted && c.day === day;
              return (
                <button
                  key={i}
                  onClick={() => !c.muted && setDay(c.day)}
                  className={`py-1 ${
                    c.muted ? 'text-gray-300' :
                    isSelected ? 'bg-red-500 text-white font-semibold' :
                    'text-brand-dark hover:bg-amber-50'
                  }`}
                  disabled={c.muted}
                >
                  {c.day}
                </button>
              );
            })}
          </div>
        </div>
        <div className="col-span-2 flex justify-start gap-2 pt-2 border-t border-gray-200">
          <button onClick={onClose} className="text-xs font-semibold bg-brand-cyan text-white px-4 py-1.5 rounded hover:brightness-110">Done</button>
          <button onClick={onClose} className="text-xs font-semibold text-gray-500 hover:text-brand-dark px-4 py-1.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold text-brand-dark mb-1">{label}:</div>
      <select className="w-full text-xs rounded border-gray-300 py-1.5">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
