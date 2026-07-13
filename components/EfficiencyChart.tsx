"use client";

import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { weeklyCompletedUrl, weeklyLateUrl, weeklyOnTimeUrl } from "@/lib/linearUrls";

interface DataPoint {
  week: string;
  weekStartISO: string;
  weekEndISO: string;
  withDueDate: number;
  onTime: number;
  late: number;
  onTimeRate: number | null;
}

interface Props {
  data: DataPoint[];
  teamUrl: string;
  completedStateIds: string[];
}

const SERIES = [
  { dataKey: "onTime", name: "On Time", color: "#059669", shape: "bar" as const },
  { dataKey: "late", name: "Late", color: "#E11D48", shape: "bar" as const },
  { dataKey: "onTimeRate", name: "On-Time Rate %", color: "#FBBF24", shape: "line" as const },
];

function openLinear(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: DataPoint }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DataPoint;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1 shadow-xl">
      <p className="font-semibold text-slate-100">{label}</p>
      <p className="text-slate-400">With due date: <span className="text-slate-200">{d.withDueDate}</span></p>
      <p className="text-emerald-400">On time: <span className="text-slate-200">{d.onTime}</span></p>
      <p className="text-rose-400">Late: <span className="text-slate-200">{d.late}</span></p>
      <p className="text-amber-400">On-time rate: <span className="text-slate-200">{d.onTimeRate != null ? `${d.onTimeRate}%` : "—"}</span></p>
      {d.withDueDate === 0 && <p className="text-slate-500 italic text-xs">No issues had a due date</p>}
      <p className="text-slate-500 text-xs pt-1">Click bar to open in Linear ↗</p>
    </div>
  );
}

function RateDot(props: {
  cx?: number; cy?: number; payload?: DataPoint;
  teamUrl: string; completedStateIds: string[];
}) {
  const { cx = 0, cy = 0, payload, teamUrl, completedStateIds } = props;
  if (!payload || payload.onTimeRate == null) return null;
  return (
    <circle cx={cx} cy={cy} r={4} fill="#FBBF24" strokeWidth={0} style={{ cursor: "pointer" }}
      onClick={() => openLinear(weeklyCompletedUrl(teamUrl, payload.weekStartISO, payload.weekEndISO, completedStateIds))}
    />
  );
}

export default function EfficiencyChart({ data, teamUrl, completedStateIds }: Props) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

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
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
        <Legend content={() => (
          <ul className="flex justify-center gap-5 pt-1">
            {SERIES.map(s => (
              <li key={s.dataKey}
                className={`flex items-center gap-1.5 text-xs cursor-pointer select-none transition-opacity ${hidden.has(s.dataKey) ? "opacity-30" : "opacity-100"}`}
                onClick={e => toggleSeries(s.dataKey, e.metaKey || e.ctrlKey)}>
                {s.shape === "bar"
                  ? <span className="w-3 h-2.5 rounded-sm inline-block" style={{ background: s.color }} />
                  : <span className="w-4 h-0.5 inline-block" style={{ background: s.color }} />}
                <span className="text-slate-400">{s.name}</span>
              </li>
            ))}
          </ul>
        )} />
        <Bar yAxisId="left" dataKey="onTime" name="On Time" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} cursor="pointer"
          hide={hidden.has("onTime")}
          onClick={(data: unknown) => {
            const d = data as DataPoint;
            openLinear(weeklyOnTimeUrl(teamUrl, d.weekStartISO, d.weekEndISO, completedStateIds));
          }}
        />
        <Bar yAxisId="left" dataKey="late" name="Late" stackId="a" fill="#E11D48" radius={[4, 4, 0, 0]} cursor="pointer"
          hide={hidden.has("late")}
          onClick={(data: unknown) => {
            const d = data as DataPoint;
            openLinear(weeklyLateUrl(teamUrl, d.weekStartISO, d.weekEndISO, completedStateIds));
          }}
        />
        <Line
          yAxisId="right" type="monotone" dataKey="onTimeRate" name="On-Time Rate %"
          stroke="#FBBF24" strokeWidth={2}
          hide={hidden.has("onTimeRate")}
          dot={(props: object) => <RateDot {...(props as Parameters<typeof RateDot>[0])} teamUrl={teamUrl} completedStateIds={completedStateIds} />}
          activeDot={{ r: 6 }}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
