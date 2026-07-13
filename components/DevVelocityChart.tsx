"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { devIssuesUrl, devWeekUrl } from "@/lib/linearUrls";

interface DevWeek {
  week: string;
  weekStartISO: string;
  weekEndISO: string;
  count: number;
  points: number;
}

interface DevData {
  id: string;
  name: string;
  email: string;
  data: DevWeek[];
  totalCount: number;
  totalPoints: number;
}

interface Props {
  devVelocity: DevData[];
  weekLabels: string[];
  teamUrl: string;
  completedStateIds: string[];
  periodStart: string;
  periodEnd: string;
}

const COLORS = [
  "#7C3AED", "#2563EB", "#0891B2", "#059669", "#D97706",
  "#DC2626", "#9333EA", "#0284C7", "#10B981", "#F59E0B",
];

type Metric = "count" | "points";

function openLinear(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function makeClickableDot(
  dev: DevData,
  weekISOMap: Map<string, { start: string; end: string }>,
  teamUrl: string,
  completedStateIds: string[],
  color: string
) {
  return function ClickableDot(props: { cx?: number; cy?: number; payload?: { week: string } }) {
    const { cx = 0, cy = 0, payload } = props;
    if (!payload) return null;
    const wk = weekISOMap.get(payload.week);
    if (!wk) return null;
    return (
      <circle cx={cx} cy={cy} r={4} fill={color} strokeWidth={0} style={{ cursor: "pointer" }}
        onClick={() => openLinear(devWeekUrl(teamUrl, dev.email, wk.start, wk.end, completedStateIds))}
      />
    );
  };
}

export default function DevVelocityChart({ devVelocity, weekLabels, teamUrl, completedStateIds, periodStart, periodEnd }: Props) {
  const [metric, setMetric] = useState<Metric>("points");
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const allKeys = devVelocity.map(d => d.name);

  function toggleSeries(key: string, multi: boolean) {
    setHidden(prev => {
      if (multi) {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        if (next.size === allKeys.length) return new Set();
        return next;
      }
      const isSolo = prev.size === allKeys.length - 1 && !prev.has(key);
      if (isSolo) return new Set();
      return new Set(allKeys.filter(k => k !== key));
    });
  }

  const weekISOMap = new Map<string, { start: string; end: string }>();
  if (devVelocity[0]) {
    for (const wk of devVelocity[0].data) {
      weekISOMap.set(wk.week, { start: wk.weekStartISO, end: wk.weekEndISO });
    }
  }

  const chartData = weekLabels.map((week) => {
    const row: Record<string, number | string> = { week };
    for (const dev of devVelocity) {
      const wk = dev.data.find((d) => d.week === week);
      row[dev.name] = wk?.[metric] ?? 0;
    }
    return row;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMetric("points")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${metric === "points" ? "bg-violet-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
          Story Points
        </button>
        <button onClick={() => setMetric("count")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${metric === "count" ? "bg-violet-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
          Issue Count
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={false} />
          <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9" }}
            labelStyle={{ color: "#E2E8F0", fontWeight: 600 }}
            itemStyle={{ color: "#CBD5E1" }}
            cursor={{ stroke: "#475569" }}
          />
          <Legend content={() => (
            <ul className="flex flex-wrap justify-center gap-4 pt-1">
              {devVelocity.map((dev, i) => {
                const color = COLORS[i % COLORS.length];
                return (
                  <li key={dev.id}
                    className={`flex items-center gap-1.5 text-xs cursor-pointer select-none transition-opacity ${hidden.has(dev.name) ? "opacity-30" : "opacity-100"}`}
                    onClick={e => toggleSeries(dev.name, e.metaKey || e.ctrlKey)}>
                    <span className="w-4 h-0.5 inline-block" style={{ background: color }} />
                    <span className="text-slate-400">{dev.name}</span>
                  </li>
                );
              })}
            </ul>
          )} />
          {devVelocity.map((dev, i) => {
            const color = COLORS[i % COLORS.length];
            const DotComponent = makeClickableDot(dev, weekISOMap, teamUrl, completedStateIds, color);
            return (
              <Line key={dev.id} type="monotone" dataKey={dev.name} stroke={color} strokeWidth={2}
                hide={hidden.has(dev.name)}
                dot={DotComponent} activeDot={{ r: 6 }} />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto rounded-lg border border-slate-700/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/40">
              <th className="text-left py-2.5 px-4 text-slate-400 font-medium">Developer</th>
              <th className="text-right py-2.5 px-4 text-slate-400 font-medium">Issues</th>
              <th className="text-right py-2.5 px-4 text-slate-400 font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {devVelocity.map((dev, i) => (
              <tr key={dev.id}
                className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors cursor-pointer"
                onClick={() => openLinear(devIssuesUrl(teamUrl, dev.email, periodStart, periodEnd, completedStateIds))}
                title="Open all issues in Linear ↗">
                <td className="py-2.5 px-4 flex items-center gap-2.5 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  {dev.name}
                  <span className="text-slate-600 text-xs ml-auto">↗</span>
                </td>
                <td className="text-right py-2.5 px-4 text-slate-300">{dev.totalCount}</td>
                <td className="text-right py-2.5 px-4 text-slate-300">{dev.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
