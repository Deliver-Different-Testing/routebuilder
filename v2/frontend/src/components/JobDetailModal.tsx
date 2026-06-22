import { Job } from '../lib/mockData';

interface Props {
  job: Job;
  variants?: string[];
}

export default function JobDetailModal({ job, variants }: Props) {
  const tabList = variants ?? [
    job.jobNo?.replace(/DEL$/, '') ?? job.id,
    job.jobNo?.replace(/DEL$/, '2') ?? '',
    job.jobNo?.replace(/DEL$/, 'MR2') ?? '',
  ].filter(Boolean);
  const activeTab = job.jobNo ?? job.id;

  const pricing = `$${(job.weightKg * 1.2 + 5).toFixed(2)}`;

  return (
    <div className="flex flex-col h-full text-xs">
      <div className="bg-gray-700 text-white px-3 py-1.5 flex items-center justify-between">
        <span className="font-semibold text-[11px]">Detail for Job {job.jobNo ?? job.id}</span>
        <div className="flex items-center gap-1">
          <button className="text-white hover:bg-white/10 px-1 rounded">🖨️</button>
          <button className="text-white hover:bg-white/10 px-1 rounded">↗</button>
          <button className="text-white hover:bg-white/10 px-1 rounded">⋮</button>
        </div>
      </div>

      <div className="bg-white flex-1 overflow-auto">
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px]">
            {tabList.map((t, i) => (
              <span
                key={i}
                className={`pb-1 ${t === activeTab ? 'text-brand-cyan font-semibold border-b-2 border-brand-cyan' : 'text-gray-500'}`}
              >
                {t}
              </span>
            ))}
            <span className="text-brand-cyan font-semibold pb-1 border-b-2 border-brand-cyan">*DEL</span>
          </div>
          <button className="bg-brand-cyan hover:brightness-110 text-white text-[10px] font-semibold px-3 py-1.5 rounded shadow-sm flex items-center gap-1">
            ⇄ TRANSFER ROUTE
          </button>
        </div>

        <div className="grid grid-cols-6 gap-px bg-gray-200 mx-3 mb-2 border border-gray-200">
          <Stat k="PRICING" v={pricing} highlight />
          <Stat k="CREATED" v={`${job.dDate?.slice(0, 5) ?? '11/06'} 08:40`} />
          <Stat k="READY" v={`${job.readyAt}:00`} />
          <Stat k="PICKUP WINDOW" v={`${job.windowStart}:00 - ${job.windowEnd}:00`} />
          <Stat k="PICKED UP" v="—" />
          <Stat k="DISPATCHED" v="—" />
          <Stat k="POD TIME" v="—" />
          <Stat k="POD NAME" v="—" />
          <div className="bg-gray-50 col-span-4" />
        </div>

        <div className="grid grid-cols-2 gap-2 mx-3 mb-3">
          <div className="border border-gray-200">
            <div className="bg-blue-500 text-white text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 flex items-center gap-1">
              ↑ PICKUP
            </div>
            <div className="bg-white">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="font-medium text-[11px]">{job.pickup}</div>
                <div className="text-gray-500 text-[10px]">{job.suburb ?? 'Auckland'}</div>
              </div>
              <Field label="COMPANY" v={job.client ?? '—'} />
              <Field label="CONTACT" v="—" icon="👤" />
              <Field label="PHONE" v="—" icon="📞" />
            </div>
          </div>
          <div className="border border-gray-200">
            <div className="bg-emerald-500 text-white text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 flex items-center gap-1">
              ↓ DELIVERY
            </div>
            <div className="bg-white">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="font-medium text-[11px]">{job.delivery}</div>
                <div className="text-gray-500 text-[10px]">{job.suburb ?? 'Auckland'}</div>
              </div>
              <Field label="RECIPIENT" v="—" />
              <Field label="CONTACT" v="—" icon="👤" />
              <Field label="PHONE" v="—" icon="📞" />
              <Field label="EMAIL" v="ops@example.co.nz" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className={`px-2 py-1.5 ${highlight ? 'bg-amber-50 border-t-2 border-amber-400' : 'bg-white'}`}>
      <div className="text-[8.5px] uppercase tracking-wider text-gray-500 font-semibold">{k}</div>
      <div className={`text-[11px] font-semibold mt-0.5 ${highlight ? 'text-brand-dark' : 'text-brand-dark'}`}>{v}</div>
    </div>
  );
}

function Field({ label, v, icon }: { label: string; v: string; icon?: string }) {
  return (
    <div className="px-3 py-1.5 border-b border-gray-100 last:border-b-0">
      <div className="text-[8.5px] uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1">
        {icon && <span>{icon}</span>}{label}
      </div>
      <div className="text-[11px] font-medium text-brand-dark">{v}</div>
    </div>
  );
}
