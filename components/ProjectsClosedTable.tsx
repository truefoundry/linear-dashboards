"use client";

interface ClosedProject {
  id: string;
  name: string;
  url: string;
  completedAt: string;
  targetDate: string | null;
  lead: { id: string; name: string; email: string } | null;
  onTime: boolean | null;
}

interface Props {
  projects: ClosedProject[];
}

function OnTimeBadge({ onTime }: { onTime: boolean | null }) {
  if (onTime === null) {
    return <span className="text-xs text-slate-500">—</span>;
  }
  return onTime ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      On time
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
      Late
    </span>
  );
}

export default function ProjectsClosedTable({ projects }: Props) {
  if (projects.length === 0) {
    return <p className="text-sm text-slate-500 py-4 text-center">No projects closed in this period.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60">
            <th className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">Project</th>
            <th className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">Lead</th>
            <th className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">Target Date</th>
            <th className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">Completed</th>
            <th className="text-left text-xs text-slate-400 font-medium pb-2">On Time</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              className="border-b border-slate-700/30 hover:bg-slate-700/30 cursor-pointer transition-colors"
              onClick={() => window.open(p.url, "_blank", "noopener,noreferrer")}
            >
              <td className="py-2.5 pr-4 text-slate-200 font-medium hover:text-indigo-400 transition-colors">
                {p.name}
              </td>
              <td className="py-2.5 pr-4 text-slate-400">
                {p.lead?.name ?? <span className="text-slate-600">—</span>}
              </td>
              <td className="py-2.5 pr-4 text-slate-400">
                {p.targetDate ?? <span className="text-slate-600">—</span>}
              </td>
              <td className="py-2.5 pr-4 text-slate-400">{p.completedAt}</td>
              <td className="py-2.5">
                <OnTimeBadge onTime={p.onTime} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
