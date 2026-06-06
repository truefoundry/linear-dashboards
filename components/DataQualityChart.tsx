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
import { weeklyCompletedUrl, missingEstimateUrl, missingDueDateUrl, teamIssuesUrl } from "@/lib/linearUrls";

interface DataPoint {
  week: string;
  weekStartISO: string;
  weekEndISO: string;
  total: number;
  missingPoints: number;
  missingDueDate: number;
  missingBoth: number;
  missingPointsPct: number;
  missingDueDatePct: number;
}

interface Props {
  data: DataPoint[];
  org: string;
  teamKey: string;
  completedStateIds: string[];
}

function toStackedData(data: DataPoint[]) {
  return data.map((d) => ({
    week: d.week,
    weekStartISO: d.weekStartISO,
    weekEndISO: d.weekEndISO,
    "Missing Both": d.missingBoth,
    "No Estimate Only": d.missingPoints - d.missingBoth,
    "No Due Date Only": d.missingDueDate - d.missingBoth,
    Complete: d.total - d.missingPoints - d.missingDueDate + d.missingBoth,
    _total: d.total,
    _missingPoints: d.missingPoints,
    _missingDueDate: d.missingDueDate,
    _missingBoth: d.missingBoth,
    _missingPointsPct: d.missingPointsPct,
    _missingDueDatePct: d.missingDueDatePct,
  }));
}

type StackedRow = ReturnType<typeof toStackedData>[number];

function openLinear(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: StackedRow }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1 shadow-xl">
      <p className="font-semibold text-slate-100">{label}</p>
      <p className="text-slate-400">Total completed: <span className="text-slate-200">{d._total}</span></p>
      <div className="border-t border-slate-700 pt-1 mt-1 space-y-0.5">
        <p>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1.5 align-middle" />
          <span className="text-slate-400">Complete (both set): </span>
          <span className="text-slate-200">{d.Complete}</span>
        </p>
        <p>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-500 mr-1.5 align-middle" />
          <span className="text-slate-400">No due date only: </span>
          <span className="text-slate-200">{d["No Due Date Only"]} ({d._missingDueDatePct}%)</span>
        </p>
        <p>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-500 mr-1.5 align-middle" />
          <span className="text-slate-400">No estimate only: </span>
          <span className="text-slate-200">{d["No Estimate Only"]} ({d._missingPointsPct}%)</span>
        </p>
        <p>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 mr-1.5 align-middle" />
          <span className="text-slate-400">Missing both: </span>
          <span className="text-slate-200">{d._missingBoth}</span>
        </p>
      </div>
      <p className="text-slate-500 text-xs pt-1">Click segment to open in Linear ↗</p>
    </div>
  );
}

export default function DataQualityChart({ data, org, teamKey, completedStateIds }: Props) {
  const stacked = toStackedData(data);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={stacked} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={false} />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
        <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
        <Bar dataKey="Complete" stackId="q" fill="#10B981" radius={[0, 0, 0, 0]} cursor="pointer"
          onClick={(data: unknown) => {
            const d = data as StackedRow;
            openLinear(weeklyCompletedUrl(org, teamKey, d.weekStartISO, d.weekEndISO, completedStateIds));
          }}
        />
        <Bar dataKey="No Due Date Only" stackId="q" fill="#0284C7" radius={[0, 0, 0, 0]} cursor="pointer"
          onClick={(data: unknown) => {
            const d = data as StackedRow;
            openLinear(missingDueDateUrl(org, teamKey, d.weekStartISO, d.weekEndISO, completedStateIds));
          }}
        />
        <Bar dataKey="No Estimate Only" stackId="q" fill="#7C3AED" radius={[0, 0, 0, 0]} cursor="pointer"
          onClick={(data: unknown) => {
            const d = data as StackedRow;
            openLinear(missingEstimateUrl(org, teamKey, d.weekStartISO, d.weekEndISO, completedStateIds));
          }}
        />
        <Bar dataKey="Missing Both" stackId="q" fill="#E11D48" radius={[4, 4, 0, 0]} cursor="pointer"
          onClick={(data: unknown) => {
            const d = data as StackedRow;
            openLinear(teamIssuesUrl(org, teamKey, {
              state: { id: { in: completedStateIds } },
              completedAt: { gte: d.weekStartISO, lte: d.weekEndISO },
              estimate: { null: true },
              dueDate: { null: true },
            }));
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
