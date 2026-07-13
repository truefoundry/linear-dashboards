"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { weeklyCompletedUrl, missingEstimateUrl, missingDueDateUrl, missingBothUrl } from "@/lib/linearUrls";

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
  teamUrl: string;
  completedStateIds: string[];
}

const SERIES = [
  { dataKey: "Complete", color: "#10B981" },
  { dataKey: "No Due Date Only", color: "#0284C7" },
  { dataKey: "No Estimate Only", color: "#7C3AED" },
  { dataKey: "Missing Both", color: "#E11D48" },
];

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
        <p><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1.5 align-middle" /><span className="text-slate-400">Complete (both set): </span><span className="text-slate-200">{d.Complete}</span></p>
        <p><span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-500 mr-1.5 align-middle" /><span className="text-slate-400">No due date only: </span><span className="text-slate-200">{d["No Due Date Only"]} ({d._missingDueDatePct}%)</span></p>
        <p><span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-500 mr-1.5 align-middle" /><span className="text-slate-400">No estimate only: </span><span className="text-slate-200">{d["No Estimate Only"]} ({d._missingPointsPct}%)</span></p>
        <p><span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 mr-1.5 align-middle" /><span className="text-slate-400">Missing both: </span><span className="text-slate-200">{d._missingBoth}</span></p>
      </div>
      <p className="text-slate-500 text-xs pt-1">Click segment to open in Linear ↗</p>
    </div>
  );
}

export default function DataQualityChart({ data, teamUrl, completedStateIds }: Props) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const stacked = toStackedData(data);

  function toggleSeries(key: string, multi: boolean) {
    setHidden(prev => {
      if (multi) {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        if (next.size === SERIES.length) return new Set();
        return next;
      }
      const isSolo = prev.size === SERIES.length - 1 && !prev.has(key);
      if (isSolo) return new Set();
      return new Set(SERIES.map(s => s.dataKey).filter(k => k !== key));
    });
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={stacked} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={false} />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
        <Legend content={() => (
          <ul className="flex justify-center gap-5 pt-1">
            {SERIES.map(s => (
              <li key={s.dataKey}
                className={`flex items-center gap-1.5 text-xs cursor-pointer select-none transition-opacity ${hidden.has(s.dataKey) ? "opacity-30" : "opacity-100"}`}
                onClick={e => toggleSeries(s.dataKey, e.metaKey || e.ctrlKey)}>
                <span className="w-3 h-2.5 rounded-sm inline-block" style={{ background: s.color }} />
                <span className="text-slate-400">{s.dataKey}</span>
              </li>
            ))}
          </ul>
        )} />
        <Bar dataKey="Complete" stackId="q" fill="#10B981" radius={[0,0,0,0]} cursor="pointer"
          hide={hidden.has("Complete")}
          onClick={(data: unknown) => { const d = data as StackedRow; openLinear(weeklyCompletedUrl(teamUrl, d.weekStartISO, d.weekEndISO, completedStateIds)); }} />
        <Bar dataKey="No Due Date Only" stackId="q" fill="#0284C7" radius={[0,0,0,0]} cursor="pointer"
          hide={hidden.has("No Due Date Only")}
          onClick={(data: unknown) => { const d = data as StackedRow; openLinear(missingDueDateUrl(teamUrl, d.weekStartISO, d.weekEndISO, completedStateIds)); }} />
        <Bar dataKey="No Estimate Only" stackId="q" fill="#7C3AED" radius={[0,0,0,0]} cursor="pointer"
          hide={hidden.has("No Estimate Only")}
          onClick={(data: unknown) => { const d = data as StackedRow; openLinear(missingEstimateUrl(teamUrl, d.weekStartISO, d.weekEndISO, completedStateIds)); }} />
        <Bar dataKey="Missing Both" stackId="q" fill="#E11D48" radius={[4,4,0,0]} cursor="pointer"
          hide={hidden.has("Missing Both")}
          onClick={(data: unknown) => { const d = data as StackedRow; openLinear(missingBothUrl(teamUrl, d.weekStartISO, d.weekEndISO, completedStateIds)); }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
