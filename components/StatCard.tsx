interface Props {
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ label, value, sub }: Props) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/60">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-100 mt-1">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}
