"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  week: string;
  total: number;
  missingPoints: number;
  missingDueDate: number;
  missingBoth: number;
  missingPointsPct: number;
  missingDueDatePct: number;
}

interface Props {
  data: DataPoint[];
}

// Decompose each week into four non-overlapping stacks:
//   missingBoth        — no estimate AND no due date
//   onlyMissingPoints  — no estimate but has due date
//   onlyMissingDueDate — has estimate but no due date
//   complete           — has both
function toStackedData(data: DataPoint[]) {
  return data.map((d) => ({
    week: d.week,
    "Missing Both": d.missingBoth,
    "No Estimate Only": d.missingPoints - d.missingBoth,
    "No Due Date Only": d.missingDueDate - d.missingBoth,
    "Complete": d.total - d.missingPoints - d.missingDueDate + d.missingBoth,
    // keep originals for tooltip
    _total: d.total,
    _missingPoints: d.missingPoints,
    _missingDueDate: d.missingDueDate,
    _missingBoth: d.missingBoth,
    _missingPointsPct: d.missingPointsPct,
    _missingDueDatePct: d.missingDueDatePct,
  }));
}

type StackedRow = ReturnType<typeof toStackedData>[number];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: StackedRow }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1 shadow-xl">
      <p className="font-semibold text-slate-100">{label}</p>
      <p className="text-slate-400">
        Total completed: <span className="text-slate-200">{d._total}</span>
      </p>
      <div className="border-t border-slate-700 pt-1 mt-1 space-y-0.5">
        <p>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1.5 align-middle" />
          <span className="text-slate-400">Complete (both set): </span>
          <span className="text-slate-200">{d["Complete"]}</span>
        </p>
        <p>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-500 mr-1.5 align-middle" />
          <span className="text-slate-400">No due date only: </span>
          <span className="text-slate-200">
            {d["No Due Date Only"]} ({d._missingDueDatePct - Math.round((d._missingBoth / Math.max(d._total, 1)) * 100)}%)
          </span>
        </p>
        <p>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-500 mr-1.5 align-middle" />
          <span className="text-slate-400">No estimate only: </span>
          <span className="text-slate-200">
            {d["No Estimate Only"]} ({d._missingPointsPct - Math.round((d._missingBoth / Math.max(d._total, 1)) * 100)}%)
          </span>
        </p>
        <p>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 mr-1.5 align-middle" />
          <span className="text-slate-400">Missing both: </span>
          <span className="text-slate-200">
            {d._missingBoth} ({Math.round((d._missingBoth / Math.max(d._total, 1)) * 100)}%)
          </span>
        </p>
      </div>
    </div>
  );
}

export default function DataQualityChart({ data }: Props) {
  const stacked = toStackedData(data);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={stacked} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          axisLine={{ stroke: "#475569" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
        <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
        {/* Bottom to top: complete → no due date only → no estimate only → missing both */}
        <Bar dataKey="Complete" stackId="q" fill="#10B981" radius={[0, 0, 0, 0]} />
        <Bar dataKey="No Due Date Only" stackId="q" fill="#0284C7" radius={[0, 0, 0, 0]} />
        <Bar dataKey="No Estimate Only" stackId="q" fill="#7C3AED" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Missing Both" stackId="q" fill="#E11D48" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
